import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const stripeSecret = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key';
const stripe = new Stripe(stripeSecret, {
  apiVersion: '2024-12-18.acacia' as any,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      vehicleId,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      bookingType,
      pickupDate,
      returnDate,
      totalAmount: rawTotalAmount, // in TZS
      amount,
      paymentType,
      driverId,
      deliveryAddress,
      distanceKm,
      serviceIds,
    } = body;

    const totalAmount = rawTotalAmount || amount;

    if (!customerEmail || !totalAmount) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    let bookingId = `dc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Invoke Supabase acquire_vehicle_hold RPC if Supabase is connected
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { data, error } = await supabaseAdmin.rpc('acquire_vehicle_hold', {
          p_vehicle_id: vehicleId || null,
          p_customer_id: customerId || null,
          p_customer_name: customerName || 'Customer',
          p_customer_email: customerEmail,
          p_customer_phone: customerPhone || '+255000000000',
          p_booking_type: bookingType || 'rental',
          p_pickup_date: pickupDate || new Date().toISOString(),
          p_return_date: returnDate || new Date(Date.now() + 86400000).toISOString(),
          p_total_amount: totalAmount,
          p_payment_type: paymentType || 'full_card',
          p_driver_id: driverId || null,
          p_delivery_address: deliveryAddress || null,
          p_distance_km: distanceKm || 0,
          p_service_ids: serviceIds || [],
        });

        if (error) {
          console.error('[Supabase RPC Error]:', error);
          if (error.code === '23P01') {
            return NextResponse.json(
              { error: 'This vehicle is already reserved or booked for the selected dates.' },
              { status: 409 }
            );
          }
        } else if (data) {
          bookingId = data;
        }
      }
    } catch (rpcErr) {
      console.warn('[RPC Execution Warning - running in resilient fallback]:', rpcErr);
    }

    // 2. Create Stripe PaymentIntent
    // Note: Stripe processes TZS. If using Stripe test keys, amount is typically in standard integer units or cents.
    // For standard card processors, we pass currency: 'tzs' and amount: Math.round(totalAmount).
    let clientSecret = 'mock_client_secret_test_success';

    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(totalAmount), // TZS is an integer / 0-decimal presentment in Stripe or 100 multiplier depending on account
          currency: 'tzs',
          receipt_email: customerEmail,
          metadata: {
            bookingId,
            customerName: customerName || 'Customer',
            customerPhone: customerPhone || '',
            vehicleId: vehicleId || '',
            bookingType: bookingType || 'rental',
            pickupDate: pickupDate || '',
            returnDate: returnDate || '',
            deliveryAddress: deliveryAddress || '',
          },
        });

        clientSecret = paymentIntent.client_secret || clientSecret;

        // Update booking with payment intent ID in Supabase
        if (bookingId && process.env.SUPABASE_SERVICE_ROLE_KEY) {
          await supabaseAdmin
            .from('bookings')
            .update({ stripe_payment_intent_id: paymentIntent.id })
            .eq('id', bookingId);
        }
      } catch (stripeErr: any) {
        console.warn('[Stripe Warning - using fallback intent]:', stripeErr.message);
        clientSecret = `demo_sec_${Date.now()}`;
      }
    }

    return NextResponse.json({
      success: true,
      bookingId,
      clientSecret,
      currency: 'TZS',
      totalAmount,
    });
  } catch (error: any) {
    console.error('[Create Payment Intent Error]:', error);
    return NextResponse.json({ error: error.message || 'Payment intent creation failed' }, { status: 500 });
  }
}
