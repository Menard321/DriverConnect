import twilio from 'twilio';
import { formatPhoneTZ, formatTZS } from './formatters';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;
const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function sendBookingNotifications(params: {
  toPhone: string;
  customerName: string;
  bookingId: string;
  vehicleTitle?: string;
  totalAmount: number;
  pickupDate: string;
}) {
  const formattedPhone = formatPhoneTZ(params.toPhone);
  const formattedTotal = formatTZS(params.totalAmount);
  const shortId = params.bookingId.substring(0, 8).toUpperCase();

  const messageBody = `Karibu DriverConnect! Habari ${params.customerName}, booking #${shortId} ya ${params.vehicleTitle || 'huduma'} imethibitishwa. Jumla: ${formattedTotal}. Tarehe: ${new Date(params.pickupDate).toLocaleDateString('en-GB')}. Asante kwa kuchagua DriverConnect!`;

  const results = {
    sms: false,
    whatsapp: false,
  };

  if (!client || !accountSid) {
    console.log('[Twilio Simulated Mode] Notification would be sent to:', formattedPhone);
    console.log('[Twilio Simulated Mode] Message:', messageBody);
    return { sms: true, whatsapp: true, simulated: true };
  }

  // 1. Dispatch SMS
  try {
    if (fromPhone) {
      await client.messages.create({
        body: messageBody,
        from: fromPhone,
        to: formattedPhone,
      });
      results.sms = true;
    }
  } catch (err) {
    console.error('[Twilio SMS Error]:', err);
  }

  // 2. Dispatch WhatsApp
  try {
    if (fromWhatsApp) {
      await client.messages.create({
        body: messageBody,
        from: fromWhatsApp,
        to: `whatsapp:${formattedPhone}`,
      });
      results.whatsapp = true;
    }
  } catch (err) {
    console.error('[Twilio WhatsApp Error]:', err);
  }

  return results;
}

export async function sendTwilioAlerts(params: {
  toPhone: string;
  customerName: string;
  carModel: string;
  pickupDate: string;
  bookingId: string;
}) {
  const formattedPhone = formatPhoneTZ(params.toPhone);
  const alertBody = `[DRIVERCONNECT SECURITY DISPATCH] Unit: ${params.carModel}. Target: ${params.customerName}. Event: ${params.bookingId}. Timestamp: ${params.pickupDate}`;

  if (!client || !accountSid) {
    console.log('[Twilio Alert Simulated]:', alertBody);
    return { sms: true, simulated: true };
  }

  try {
    if (fromPhone) {
      await client.messages.create({
        body: alertBody,
        from: fromPhone,
        to: formattedPhone,
      });
      return { sms: true };
    }
  } catch (err) {
    console.error('[Twilio Alert SMS Error]:', err);
  }
  return { sms: false };
}
