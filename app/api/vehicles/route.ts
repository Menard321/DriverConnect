import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { INITIAL_VEHICLES } from '@/lib/mockData';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vertical = searchParams.get('vertical'); // 'rent', 'buy', or 'all'
    const category = searchParams.get('category');
    const maxRate = searchParams.get('maxRate');

    // Attempt querying Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      let query = supabaseAdmin.from('vehicles').select('*');

      if (vertical === 'rent') {
        query = query.eq('is_for_rent', true);
      } else if (vertical === 'buy') {
        query = query.eq('is_for_sale', true);
      }

      if (category && category !== 'All') {
        query = query.eq('body_type', category);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return NextResponse.json({ vehicles: data });
      }
    }

    // Fallback to initial mock data
    let filtered = [...INITIAL_VEHICLES];
    if (vertical === 'rent') {
      filtered = filtered.filter((v) => v.is_for_rent);
    } else if (vertical === 'buy') {
      filtered = filtered.filter((v) => v.is_for_sale);
    }
    if (category && category !== 'All') {
      filtered = filtered.filter((v) => v.body_type.toLowerCase() === category.toLowerCase());
    }
    if (maxRate) {
      const numRate = parseFloat(maxRate);
      filtered = filtered.filter((v) => v.daily_rate <= numRate);
    }

    return NextResponse.json({ vehicles: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.license_plate || !body.daily_rate) {
      return NextResponse.json({ error: 'Missing required vehicle fields' }, { status: 400 });
    }

    // Save P2P submission with is_approved = false
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabaseAdmin.from('vehicles').insert([
        {
          ...body,
          is_approved: false, // Enforce admin approval queue
          status: 'available',
        },
      ]).select().single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, vehicle: data });
    }

    return NextResponse.json({
      success: true,
      message: 'Vehicle submitted for admin approval (local mock mode).',
      vehicle: { ...body, id: `v_${Date.now()}`, is_approved: false },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
