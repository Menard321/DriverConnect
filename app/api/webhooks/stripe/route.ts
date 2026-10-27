import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generatePdfInvoiceBuffer } from '@/lib/generatePdfBuffer';
import { generateBookingReceiptHtml } from '@/lib/emailTemplate';
import { sendBookingNotifications } from '@/lib/twilioClient';
import { Resend } from 'resend';

const stripeSecret = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
const stripe = new Stripe(stripeSecret, {
  apiVersion: '2024-12-18.acacia' as any,
});

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const sig = req.headers.get('stripe-signature');

    let event: Stripe.Event;

    if (stripeWebhookSecret && sig) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, sig, stripeWebhookSecret);
      } catch (err: any) {
        console.error('[Stripe Webhook Signature Verification Failed]:', err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
      }
    } else {
      // In dev or testing without raw signature, parse directly
      event = JSON.parse(rawBody) as Stripe.Event;
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const metadata = paymentIntent.metadata || {};
      const bookingId = metadata.bookingId;
      const customerEmail = paymentIntent.receipt_email || metadata.customerEmail || 'customer@driverconnect.co.tz';
      const customerName = metadata.customerName || 'Valued Customer';
      const customerPhone = metadata.customerPhone || '+255700000000';
      const vehicleTitle = metadata.vehicleTitle || 'Booked Vehicle';
      const totalAmount = paymentIntent.amount; // in TZS

      console.log(`[Stripe Webhook] Payment succeeded for Booking #${bookingId}, Amount: TZS ${totalAmount}`);

      // 1. Update Supabase Booking to confirmed and clear temporary hold
      if (bookingId && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        await supabaseAdmin
          .from('bookings')
          .update({
            status: 'confirmed',
            hold_expires_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId);
      }

      // 2. Generate PDF Tax Invoice Buffer in TZS
      let pdfBuffer: Buffer | null = null;
      try {
        pdfBuffer = await generatePdfInvoiceBuffer({
          bookingId: bookingId || 'DC-PENDING',
          customerName,
          customerEmail,
          customerPhone,
          vehicleTitle,
          pickupDate: metadata.pickupDate || new Date().toISOString(),
          returnDate: metadata.returnDate || new Date(Date.now() + 86400000).toISOString(),
          totalAmount,
          paymentType: 'full_card',
        });
      } catch (pdfErr) {
        console.error('[PDF Generation Error]:', pdfErr);
      }

      // 3. Dispatch Transactional Email via Resend with PDF Attachment
      if (resend && customerEmail) {
        try {
          const emailHtml = generateBookingReceiptHtml({
            bookingId: bookingId || 'DC-REC',
            customerName,
            bookingType: metadata.bookingType || 'rental',
            vehicleTitle,
            pickupDate: metadata.pickupDate || new Date().toISOString(),
            returnDate: metadata.returnDate || new Date(Date.now() + 86400000).toISOString(),
            totalAmount,
            paymentType: 'full_card',
            deliveryAddress: metadata.deliveryAddress,
          });

          await resend.emails.send({
            from: process.env.SYSTEM_SENDER_EMAIL || 'invoices@driverconnect.co.tz',
            to: customerEmail,
            subject: `DriverConnect Booking Receipt #${bookingId?.substring(0, 8)} [Confirmed]`,
            html: emailHtml,
            attachments: pdfBuffer
              ? [
                  {
                    filename: `DriverConnect_Invoice_${bookingId?.substring(0, 8)}.pdf`,
                    content: pdfBuffer,
                  },
                ]
              : undefined,
          });
          console.log('[Resend Email Dispatched] to:', customerEmail);
        } catch (emailErr) {
          console.error('[Resend Email Error]:', emailErr);
        }
      }

      // 4. Dispatch SMS and WhatsApp via Twilio
      try {
        await sendBookingNotifications({
          toPhone: customerPhone,
          customerName,
          bookingId: bookingId || 'DC-BOOKING',
          vehicleTitle,
          totalAmount,
          pickupDate: metadata.pickupDate || new Date().toISOString(),
        });
      } catch (twilioErr) {
        console.error('[Twilio Notification Error]:', twilioErr);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[Stripe Webhook Processing Error]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
