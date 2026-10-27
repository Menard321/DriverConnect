import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { PlatformAppearance } from '@/lib/types';

const SINGLETON_ID = '00000000-0000-0000-0000-000000000001';

const DEFAULT_APPEARANCE: PlatformAppearance = {
  id: SINGLETON_ID,
  theme_accent: 'amber',
  corner_radius: 'rounded',
  layout_density: 'classic',
  show_testimonials: true,
  background_image_url: '/images/hero-workshop-bg.jpg',
  delivery_rate_per_km: 3500,
  driver_daily_rate: 50000,
  sale_reservation_fee: 1300000,
};

// In-memory fallback persistence
let inMemoryAppearance: PlatformAppearance = { ...DEFAULT_APPEARANCE };

export async function GET() {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabaseAdmin
        .from('platform_appearance')
        .select('*')
        .eq('id', SINGLETON_ID)
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json(data);
      }
    }

    return NextResponse.json(inMemoryAppearance);
  } catch (err: any) {
    return NextResponse.json(inMemoryAppearance);
  }
}

async function handleSave(req: NextRequest) {
  try {
    const body = await req.json();

    const recordToSave: PlatformAppearance = {
      id: SINGLETON_ID,
      theme_accent: body.theme_accent || body.themeAccent || 'amber',
      corner_radius: body.corner_radius || body.cornerRadius || 'rounded',
      layout_density: body.layout_density || body.layoutDensity || 'classic',
      show_testimonials: body.show_testimonials ?? body.showTestimonials ?? true,
      background_image_url:
        body.background_image_url ||
        body.backgroundImageUrl ||
        DEFAULT_APPEARANCE.background_image_url,
      delivery_rate_per_km:
        body.delivery_rate_per_km || body.deliveryRatePerKm || 3500,
      driver_daily_rate:
        body.driver_daily_rate || body.driverDailyRate || 50000,
      sale_reservation_fee:
        body.sale_reservation_fee || body.saleReservationFee || 1300000,
      updated_at: new Date().toISOString(),
    };

    inMemoryAppearance = { ...recordToSave };

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabaseAdmin
        .from('platform_appearance')
        .upsert(recordToSave)
        .select()
        .single();

      if (error) {
        console.warn('[Supabase Appearance Upsert Warning]:', error.message);
      } else if (data) {
        return NextResponse.json(data);
      }
    }

    return NextResponse.json(recordToSave);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return handleSave(req);
}

export async function PUT(req: NextRequest) {
  return handleSave(req);
}
