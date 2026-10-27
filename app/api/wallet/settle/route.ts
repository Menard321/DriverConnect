import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { bookingId, profileId, totalAmount } = await req.json();

    if (!bookingId || !profileId) {
      return NextResponse.json({ error: 'Missing bookingId or profileId' }, { status: 400 });
    }

    // Call Supabase settle_booking_via_wallet RPC
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabaseAdmin.rpc('settle_booking_via_wallet', {
        p_booking_id: bookingId,
        p_profile_id: profileId,
      });

      if (error) {
        console.error('[Wallet Settle RPC Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json(data);
    }

    // Fallback simulation
    return NextResponse.json({
      success: true,
      booking_id: bookingId,
      settled_amount: totalAmount || 150000,
      remaining_wallet_balance: 100000,
      message: 'Settled via internal wallet (mock mode)',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
