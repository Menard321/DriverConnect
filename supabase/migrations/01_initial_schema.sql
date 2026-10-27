-- ==============================================================================
-- DRIVERCONNECT: PRODUCTION SUPABASE POSTGRESQL SCHEMA MIGRATION (TZS NATIVE)
-- Migration 01: Core Extensions, Enums, Tables, GiST Constraints, RPCs, & RLS
-- Currency: Tanzanian Shillings (TZS)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. CUSTOM TYPES & ENUMS
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM (
        'customer',
        'admin',
        'fleet_driver',
        'vehicle_owner'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE transmission_type AS ENUM (
        'automatic',
        'manual'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_vertical_type AS ENUM (
        'rental',
        'sale_reservation',
        'repair_service'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_settlement_type AS ENUM (
        'full_card',
        'deposit_card',
        'internal_wallet',
        'cash_on_delivery'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_lifecycle_status AS ENUM (
        'pending',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE vehicle_status_type AS ENUM (
        'available',
        'reserved',
        'rented',
        'maintenance',
        'sold'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role_type NOT NULL DEFAULT 'customer',
    wallet_balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (wallet_balance >= 0.00),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger to create profile upon new Supabase auth sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, role, wallet_balance)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Valued Customer'),
        COALESCE(new.raw_user_meta_data->>'phone', ''),
        COALESCE((new.raw_user_meta_data->>'role')::user_role_type, 'customer'),
        0.00
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. VEHICLES TABLE (Rentals & P2P Marketplace)
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Nullable for dealership fleet
    title TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1990 AND year <= 2030),
    body_type TEXT NOT NULL, -- 'SUV', 'Sedan', 'Pickup', 'Van', etc.
    transmission transmission_type NOT NULL DEFAULT 'automatic',
    seats INTEGER NOT NULL DEFAULT 5 CHECK (seats > 0),
    doors INTEGER NOT NULL DEFAULT 4 CHECK (doors > 0),
    fuel_type TEXT NOT NULL DEFAULT 'Petrol',
    mileage_km INTEGER NOT NULL DEFAULT 0 CHECK (mileage_km >= 0),
    license_plate TEXT NOT NULL UNIQUE,
    daily_rate NUMERIC(14, 2) NOT NULL CHECK (daily_rate >= 0.00), -- In TZS (e.g. 150000.00)
    weekly_rate NUMERIC(14, 2) CHECK (weekly_rate >= 0.00),       -- In TZS (e.g. 900000.00)
    sale_price NUMERIC(14, 2) CHECK (sale_price >= 0.00),         -- In TZS (e.g. 45000000.00)
    is_for_rent BOOLEAN NOT NULL DEFAULT true,
    is_for_sale BOOLEAN NOT NULL DEFAULT false,
    is_approved BOOLEAN NOT NULL DEFAULT false,                   -- P2P requires admin approval
    status vehicle_status_type NOT NULL DEFAULT 'available',
    cover_image TEXT,
    gallery_images TEXT[] NOT NULL DEFAULT '{}',
    features TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. DRIVERS TABLE (Chauffeurs)
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    license_number TEXT NOT NULL UNIQUE,
    daily_wage NUMERIC(14, 2) NOT NULL DEFAULT 50000.00 CHECK (daily_wage >= 0.00), -- TZS 50,000/day
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. REPAIR SERVICES TABLE (Workshop & Diagnostics)
CREATE TABLE IF NOT EXISTS public.repair_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    base_price NUMERIC(14, 2) NOT NULL CHECK (base_price >= 0.00), -- In TZS
    estimated_duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (estimated_duration_minutes > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. BOOKINGS TABLE (Multi-vertical reservations)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE RESTRICT,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    booking_type booking_vertical_type NOT NULL,
    pickup_date TIMESTAMPTZ NOT NULL,
    return_date TIMESTAMPTZ NOT NULL,
    date_range DATERANGE NOT NULL,
    total_amount NUMERIC(14, 2) NOT NULL CHECK (total_amount >= 0.00), -- In TZS
    payment_type payment_settlement_type NOT NULL,
    status booking_lifecycle_status NOT NULL DEFAULT 'pending',
    hold_expires_at TIMESTAMPTZ,
    stripe_payment_intent_id TEXT UNIQUE,
    delivery_address TEXT,
    distance_km NUMERIC(8, 2) DEFAULT 0.00 CHECK (distance_km >= 0.00),
    service_ids UUID[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT valid_date_order CHECK (return_date >= pickup_date)
);

-- Automatically synchronize `date_range` from pickup_date and return_date
CREATE OR REPLACE FUNCTION public.sync_booking_date_range()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_range := daterange(NEW.pickup_date::date, NEW.return_date::date, '[]');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_booking_date_range ON public.bookings;
CREATE TRIGGER trg_sync_booking_date_range
    BEFORE INSERT OR UPDATE OF pickup_date, return_date ON public.bookings
    FOR EACH ROW EXECUTE PROCEDURE public.sync_booking_date_range();

-- 8. DOUBLE-BOOKING PREVENTION VIA GiST EXCLUSION CONSTRAINT
-- Prevents overlapping vehicle reservations for confirmed/in_progress bookings
-- and pending bookings that haven't expired their 15-minute temporary hold window.
ALTER TABLE public.bookings 
    DROP CONSTRAINT IF EXISTS exclude_overlapping_vehicle_dates;

ALTER TABLE public.bookings 
    ADD CONSTRAINT exclude_overlapping_vehicle_dates 
    EXCLUDE USING gist (
        vehicle_id WITH =,
        date_range WITH &&
    ) 
    WHERE (
        vehicle_id IS NOT NULL AND (
            status IN ('confirmed', 'in_progress') OR 
            (status = 'pending' AND hold_expires_at > timezone('utc'::text, now()))
        )
    );

-- 9. WALLET LEDGERS TABLE (Double-entry digital wallet audits)
CREATE TABLE IF NOT EXISTS public.wallet_ledgers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    amount NUMERIC(14, 2) NOT NULL, -- Positive for credits/refunds, negative for debits
    running_balance NUMERIC(14, 2) NOT NULL CHECK (running_balance >= 0.00),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9B. PLATFORM APPEARANCE & BRANDING CONFIGURATION (Singleton)
CREATE TABLE IF NOT EXISTS public.platform_appearance (
    id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    theme_accent TEXT DEFAULT 'amber' CHECK (theme_accent IN ('amber', 'emerald', 'blue', 'rose')),
    corner_radius TEXT DEFAULT 'rounded' CHECK (corner_radius IN ('sharp', 'rounded', 'pill')),
    layout_density TEXT DEFAULT 'classic' CHECK (layout_density IN ('compact', 'classic', 'spacious')),
    show_testimonials BOOLEAN DEFAULT true,
    background_image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1920&q=80',
    delivery_rate_per_km NUMERIC(10, 2) DEFAULT 3500.00 NOT NULL,
    driver_daily_rate NUMERIC(10, 2) DEFAULT 50000.00 NOT NULL,
    sale_reservation_fee NUMERIC(12, 2) DEFAULT 1300000.00 NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed Singleton Appearance
INSERT INTO public.platform_appearance (id, theme_accent, corner_radius, layout_density, show_testimonials, delivery_rate_per_km, driver_daily_rate, sale_reservation_fee)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'amber', 'rounded', 'classic', true, 3500.00, 50000.00, 1300000.00)
ON CONFLICT (id) DO NOTHING;

-- 10. ATOMIC STORED PROCEDURES (RPCs)

-- RPC 1: Acquire Concurrency-Safe Vehicle Hold (15 min window)
CREATE OR REPLACE FUNCTION public.acquire_vehicle_hold(
    p_vehicle_id UUID,
    p_customer_id UUID,
    p_customer_name TEXT,
    p_customer_email TEXT,
    p_customer_phone TEXT,
    p_booking_type booking_vertical_type,
    p_pickup_date TIMESTAMPTZ,
    p_return_date TIMESTAMPTZ,
    p_total_amount NUMERIC(14, 2),
    p_payment_type payment_settlement_type,
    p_driver_id UUID DEFAULT NULL,
    p_delivery_address TEXT DEFAULT NULL,
    p_distance_km NUMERIC(8, 2) DEFAULT 0.00,
    p_service_ids UUID[] DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_booking_id UUID;
    v_calculated_range DATERANGE;
BEGIN
    v_calculated_range := daterange(p_pickup_date::date, p_return_date::date, '[]');

    BEGIN
        INSERT INTO public.bookings (
            vehicle_id,
            driver_id,
            customer_id,
            customer_name,
            customer_email,
            customer_phone,
            booking_type,
            pickup_date,
            return_date,
            date_range,
            total_amount,
            payment_type,
            status,
            hold_expires_at,
            delivery_address,
            distance_km,
            service_ids
        ) VALUES (
            p_vehicle_id,
            p_driver_id,
            p_customer_id,
            p_customer_name,
            p_customer_email,
            p_customer_phone,
            p_booking_type,
            p_pickup_date,
            p_return_date,
            v_calculated_range,
            p_total_amount,
            p_payment_type,
            'pending',
            timezone('utc'::text, now()) + INTERVAL '15 minutes',
            p_delivery_address,
            p_distance_km,
            p_service_ids
        )
        RETURNING id INTO v_booking_id;

        RETURN v_booking_id;
    EXCEPTION
        WHEN exclusion_violation THEN
            RAISE EXCEPTION 'This vehicle is unavailable or currently held by another customer for the requested dates.' 
            USING ERRCODE = '23P01';
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC 2: Settle Booking via Digital Internal Wallet (Row-locked)
CREATE OR REPLACE FUNCTION public.settle_booking_via_wallet(
    p_booking_id UUID,
    p_profile_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_current_balance NUMERIC(14, 2);
    v_new_balance NUMERIC(14, 2);
    v_total_amount NUMERIC(14, 2);
    v_booking_status booking_lifecycle_status;
BEGIN
    -- 1. Lock profile row for update to prevent race conditions
    SELECT wallet_balance INTO v_current_balance
    FROM public.profiles
    WHERE id = p_profile_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Customer profile not found.' USING ERRCODE = 'P0002';
    END IF;

    -- 2. Verify booking details and pending status
    SELECT total_amount, status INTO v_total_amount, v_booking_status
    FROM public.bookings
    WHERE id = p_booking_id AND customer_id = p_profile_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking not found or customer mismatch.' USING ERRCODE = 'P0002';
    END IF;

    IF v_booking_status != 'pending' THEN
        RAISE EXCEPTION 'Booking is already % and cannot be settled.', v_booking_status;
    END IF;

    -- 3. Verify sufficient wallet balance
    IF v_current_balance < v_total_amount THEN
        RAISE EXCEPTION 'Insufficient wallet balance. Required: TZS %, Available: TZS %', 
            v_total_amount, v_current_balance USING ERRCODE = 'P0001';
    END IF;

    -- 4. Deduct balance
    v_new_balance := v_current_balance - v_total_amount;
    UPDATE public.profiles
    SET wallet_balance = v_new_balance,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_profile_id;

    -- 5. Confirm booking and clear temporary hold
    UPDATE public.bookings
    SET status = 'confirmed',
        hold_expires_at = NULL,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_booking_id;

    -- 6. Record audit ledger
    INSERT INTO public.wallet_ledgers (
        profile_id,
        booking_id,
        amount,
        running_balance,
        reason
    ) VALUES (
        p_profile_id,
        p_booking_id,
        -v_total_amount,
        v_new_balance,
        'Payment settled for booking #' || SUBSTRING(p_booking_id::text, 1, 8)
    );

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', p_booking_id,
        'settled_amount', v_total_amount,
        'remaining_wallet_balance', v_new_balance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_ledgers ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Vehicles Policies
CREATE POLICY "Public catalog view for approved vehicles" ON public.vehicles
    FOR SELECT USING (is_approved = true AND status != 'sold');

CREATE POLICY "Owners can view all their own vehicles" ON public.vehicles
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owners can submit new vehicles" ON public.vehicles
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own vehicles" ON public.vehicles
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Admins have full access to vehicles" ON public.vehicles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Drivers Policies
CREATE POLICY "Anyone can view active drivers" ON public.drivers
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins have full access to drivers" ON public.drivers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Repair Services Policies
CREATE POLICY "Anyone can view active repair services" ON public.repair_services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins have full access to repair services" ON public.repair_services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Bookings Policies
CREATE POLICY "Users can view their own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Authenticated users can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Admins have full access to bookings" ON public.bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Wallet Ledgers Policies
CREATE POLICY "Users can view their own wallet ledgers" ON public.wallet_ledgers
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Admins have full access to wallet ledgers" ON public.wallet_ledgers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Platform Appearance Policies
ALTER TABLE public.platform_appearance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read appearance" ON public.platform_appearance
    FOR SELECT USING (true);

CREATE POLICY "Admins can update appearance" ON public.platform_appearance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 12. INITIAL SEED DATA (Tanzanian Fleet & Services in TZS)
INSERT INTO public.repair_services (name, category, base_price, estimated_duration_minutes, is_active)
VALUES
    ('Computerized Full Diagnostics', 'Diagnostics', 50000.00, 30, true),
    ('Synthetic Engine Oil & Filter Change', 'Maintenance', 85000.00, 45, true),
    ('Air Conditioning Recharge & Leak Test', 'Climate', 95000.00, 60, true),
    ('Brake Pads Replacement & Disc Machining', 'Braking', 120000.00, 90, true),
    ('Full Suspension & Bushings Overhaul', 'Chassis', 250000.00, 180, true),
    ('Ceramic Nano-Shield Wash & Interior Detail', 'Detailing', 60000.00, 60, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.vehicles (
    title, brand, model, year, body_type, transmission, seats, doors, fuel_type, 
    mileage_km, license_plate, daily_rate, weekly_rate, sale_price, is_for_rent, 
    is_for_sale, is_approved, status, cover_image, gallery_images, features
) VALUES
(
    'Toyota Land Cruiser Prado TX-L', 'Toyota', 'Prado TX-L', 2021, 'SUV', 'automatic', 7, 5, 'Diesel',
    42000, 'T 782 EBC', 350000.00, 2100000.00, 145000000.00, true, true, true, 'available',
    '/images/cars/toyota-prado.webp',
    ARRAY['/images/cars/toyota-prado.webp'],
    ARRAY['4WD / 4x4', 'Leather Seats', 'Sunroof', 'Sunshade', 'Reverse Camera', 'Coolbox']
),
(
    'Toyota Harrier Elegance', 'Toyota', 'Harrier', 2018, 'SUV', 'automatic', 5, 5, 'Petrol',
    68000, 'T 419 DWL', 150000.00, 900000.00, 48000000.00, true, true, true, 'available',
    'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['Push Start', 'Lane Assist', 'Cruise Control', 'Alloy Rims', 'Eco Mode']
),
(
    'Toyota IST New Shape', 'Toyota', 'IST', 2016, 'Hatchback', 'automatic', 5, 5, 'Petrol',
    89000, 'T 603 EAF', 75000.00, 450000.00, 18500000.00, true, true, true, 'available',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['Fuel Efficient', 'Bluetooth Audio', 'Power Steering', 'Keyless Entry']
),
(
    'Toyota Hilux Double Cabin Revo 4x4', 'Toyota', 'Hilux Revo', 2022, 'Pickup', 'automatic', 5, 4, 'Diesel',
    35000, 'T 144 EDZ', 300000.00, 1800000.00, 120000000.00, true, true, true, 'available',
    'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['Heavy Duty 4x4', 'Tow Bar', 'Off-road Tires', 'Bedliner', 'Differential Lock']
),
(
    'Toyota Alphard Executive Lounge', 'Toyota', 'Alphard', 2017, 'Van', 'automatic', 7, 5, 'Petrol',
    54000, 'T 931 DYK', 250000.00, 1500000.00, 62000000.00, true, true, true, 'available',
    'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=80',
    ARRAY['https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=80'],
    ARRAY['VIP Captain Chairs', 'Twin Sunroof', 'Rear Entertainment', 'Dual Power Sliding Doors']
)
ON CONFLICT (license_plate) DO NOTHING;
