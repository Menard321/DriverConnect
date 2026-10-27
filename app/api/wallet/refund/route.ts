import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { bookingId, userId, refundMode, bookingAmount } = await req.json();

    if (!bookingId || !userId || !refundMode) {
      return NextResponse.json(
        { error: 'Missing bookingId, userId, or refundMode' },
        { status: 400 }
      );
    }

    // 1. Invoke Supabase RPC process_self_service_refund via service role client
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabaseAdmin.rpc('process_self_service_refund', {
        p_booking_id: bookingId,
        p_user_id: userId,
        p_refund_mode: refundMode,
      });

      if (error) {
        console.error('[Supabase Self-Service Refund RPC Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json(data);
    }

    // 2. Fallback simulation if running in offline demo environment
    const total = Number(bookingAmount || 1400000);
    let refundAmount = total;
    let couponCode: string | null = null;

    if (refundMode === 'wallet_credit') {
      refundAmount = total;
    } else if (refundMode === 'coupon_code') {
      refundAmount = total;
      couponCode = 'REFUND-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    } else if (refundMode === 'gateway_reversal') {
      refundAmount = Math.round(total * 0.9);
    }

    return NextResponse.json({
      success: true,
      refund_mode: refundMode,
      refund_amount: refundAmount,
      coupon_code: couponCode,
      message: 'Booking successfully cancelled and refund initiated (simulated mode).',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
