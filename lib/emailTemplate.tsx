import { formatTZS } from './formatters';

export interface EmailReceiptParams {
  bookingId: string;
  customerName: string;
  bookingType: string;
  vehicleTitle?: string;
  licensePlate?: string;
  pickupDate: string;
  returnDate: string;
  totalAmount: number;
  paymentType: string;
  hasDriver?: boolean;
  deliveryAddress?: string;
  serviceNames?: string[];
}

export function generateBookingReceiptHtml(params: EmailReceiptParams): string {
  const formattedTotal = formatTZS(params.totalAmount);
  const formattedPickup = new Date(params.pickupDate).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedReturn = new Date(params.returnDate).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>DriverConnect Booking Confirmation</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; margin: 0; padding: 24px; }
        .card { background-color: #151d30; border: 1px solid #1e293b; border-radius: 12px; max-width: 600px; margin: 0 auto; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #d97706, #b45309); padding: 32px 24px; text-align: center; }
        .logo { font-size: 26px; font-weight: 800; letter-spacing: 1px; color: #ffffff; margin: 0; text-transform: uppercase; }
        .tagline { font-size: 13px; color: #fef3c7; margin-top: 6px; letter-spacing: 0.5px; }
        .content { padding: 28px 24px; }
        .badge { display: inline-block; background-color: #059669; color: #ffffff; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 20px; }
        .title { font-size: 20px; font-weight: 700; color: #f8fafc; margin-top: 0; margin-bottom: 8px; }
        .text { font-size: 14px; color: #94a3b8; line-height: 1.6; margin: 0 0 20px 0; }
        .detail-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .detail-table td { padding: 12px 0; border-bottom: 1px solid #1e293b; font-size: 14px; }
        .detail-table td.label { color: #94a3b8; width: 40%; }
        .detail-table td.value { color: #f8fafc; font-weight: 600; text-align: right; }
        .total-box { background-color: #0b1120; border: 1px solid #334155; border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center; margin-top: 24px; }
        .total-label { font-size: 15px; font-weight: 600; color: #e2e8f0; }
        .total-amount { font-size: 22px; font-weight: 800; color: #f59e0b; }
        .footer { text-align: center; padding: 24px; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 class="logo">DRIVERCONNECT</h1>
          <div class="tagline">Official Booking & Payment Receipt (Tanzania)</div>
        </div>
        <div class="content">
          <div class="badge">Payment Verified</div>
          <h2 class="title">Jambo, ${params.customerName}!</h2>
          <p class="text">Your reservation has been confirmed and locked in our system. Below is your official itemized receipt in Tanzanian Shillings (TZS).</p>
          
          <table class="detail-table">
            <tr>
              <td class="label">Booking ID</td>
              <td class="value">#${params.bookingId.substring(0, 8).toUpperCase()}</td>
            </tr>
            <tr>
              <td class="label">Vertical / Category</td>
              <td class="value" style="text-transform: capitalize;">${params.bookingType.replace('_', ' ')}</td>
            </tr>
            ${params.vehicleTitle ? `
            <tr>
              <td class="label">Vehicle</td>
              <td class="value">${params.vehicleTitle} (${params.licensePlate || 'Tanzania Fleet'})</td>
            </tr>` : ''}
            <tr>
              <td class="label">Start / Pickup</td>
              <td class="value">${formattedPickup}</td>
            </tr>
            <tr>
              <td class="label">End / Return</td>
              <td class="value">${formattedReturn}</td>
            </tr>
            ${params.hasDriver ? `
            <tr>
              <td class="label">Chauffeur Service</td>
              <td class="value">Dedicated Driver Assigned</td>
            </tr>` : ''}
            ${params.deliveryAddress ? `
            <tr>
              <td class="label">Delivery Location</td>
              <td class="value">${params.deliveryAddress}</td>
            </tr>` : ''}
            ${params.serviceNames && params.serviceNames.length > 0 ? `
            <tr>
              <td class="label">Workshop Services</td>
              <td class="value">${params.serviceNames.join(', ')}</td>
            </tr>` : ''}
            <tr>
              <td class="label">Payment Method</td>
              <td class="value" style="text-transform: capitalize;">${params.paymentType.replace('_', ' ')}</td>
            </tr>
          </table>

          <div class="total-box">
            <span class="total-label">Total Amount Paid (TZS):</span>
            <span class="total-amount">${formattedTotal}</span>
          </div>

          <p class="text" style="margin-top: 24px; font-size: 13px;">
            A printable PDF tax invoice is attached to this email. For customer assistance or urgent modifications, contact our 24/7 concierge at <strong>support@driverconnect.co.tz</strong> or call <strong>+255 700 000 000</strong>.
          </p>
        </div>
        <div class="footer">
          DriverConnect Tanzania Ltd. • Dar es Salaam & Arusha • All prices inclusive of statutory fees.
        </div>
      </div>
    </body>
    </html>
  `;
}
