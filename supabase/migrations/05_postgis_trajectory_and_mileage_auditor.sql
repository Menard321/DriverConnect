-- ==============================================================================
-- DRIVERCONNECT: POSTGIS TRAJECTORY-BASED EXCESS MILEAGE AUDITING & BILLING
-- ==============================================================================

-- 1. Ensure PostGIS is active
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Add excess mileage tracking columns to bookings table
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS total_km_driven NUMERIC(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS allowed_km NUMERIC(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS excess_km NUMERIC(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS excess_mileage_billed NUMERIC(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS mileage_audited_at TIMESTAMP WITH TIME ZONE;

-- 3. Function to Stitch Points into an ST_MakeLine Trajectory and Calculate Geodesic Distance
CREATE OR REPLACE FUNCTION public.calculate_booking_trajectory_km(p_booking_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking record;
  v_point_count integer;
  v_total_meters double precision := 0.0;
  v_total_km numeric(10, 2) := 0.00;
  v_days integer := 1;
  v_daily_allowance numeric(10, 2) := 200.00; -- 200 km per day base allowance
  v_allowed_km numeric(10, 2);
  v_excess_km numeric(10, 2) := 0.00;
  v_rate_per_km numeric(10, 2) := 800.00;     -- TZS 800 per excess kilometer
  v_excess_charge numeric(12, 2) := 0.00;
BEGIN
  -- 1. Fetch booking context
  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Booking not found.');
  END IF;

  -- 2. Calculate rental duration days
  IF v_booking.pickup_date IS NOT NULL AND v_booking.return_date IS NOT NULL THEN
    v_days := greatest(1, (v_booking.return_date::date - v_booking.pickup_date::date) + 1);
  END IF;
  v_allowed_km := v_days * v_daily_allowance;

  -- 3. Check number of telemetry points logged between booking timeline
  SELECT count(*) INTO v_point_count
  FROM public.vehicle_telemetry_logs
  WHERE vehicle_id = v_booking.vehicle_id
    AND recorded_at >= v_booking.pickup_date::timestamp at time zone 'Africa/Dar_es_Salaam'
    AND recorded_at <= (v_booking.return_date + interval '1 day')::timestamp at time zone 'Africa/Dar_es_Salaam';

  -- Need at least 2 points to form a trajectory
  IF v_point_count >= 2 THEN
    -- Stitch points chronologically into a LineString and calculate geodesic length in meters (EPSG:4326 to geography)
    SELECT ST_Length(
      ST_MakeLine(
        COALESCE(location::geometry, ST_SetSRID(ST_MakePoint(longitude, latitude), 4326))
        ORDER BY recorded_at ASC
      )::geography
    ) INTO v_total_meters
    FROM public.vehicle_telemetry_logs
    WHERE vehicle_id = v_booking.vehicle_id
      AND recorded_at >= v_booking.pickup_date::timestamp at time zone 'Africa/Dar_es_Salaam'
      AND recorded_at <= (v_booking.return_date + interval '1 day')::timestamp at time zone 'Africa/Dar_es_Salaam';

    v_total_km := round((v_total_meters / 1000.0)::numeric, 2);
  END IF;

  -- 4. Calculate excess metrics
  IF v_total_km > v_allowed_km THEN
    v_excess_km := v_total_km - v_allowed_km;
    v_excess_charge := round(v_excess_km * v_rate_per_km, 2);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', p_booking_id,
    'point_count', v_point_count,
    'rental_days', v_days,
    'allowed_km', v_allowed_km,
    'total_km_driven', v_total_km,
    'excess_km', v_excess_km,
    'rate_per_km', v_rate_per_km,
    'excess_charge_tzs', v_excess_charge
  );
END;
$$;

-- 4. Procedure to Audit, Bill Customer Wallet, and Record Ledger
CREATE OR REPLACE FUNCTION public.audit_and_bill_excess_mileage(
  p_booking_id uuid,
  p_admin_user_id uuid default null
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_metrics jsonb;
  v_booking record;
  v_excess_charge numeric(12, 2);
  v_total_km numeric(10, 2);
  v_allowed_km numeric(10, 2);
  v_excess_km numeric(10, 2);
  v_user_balance numeric(14, 2);
  v_new_balance numeric(14, 2);
  v_customer_id uuid;
BEGIN
  -- 1. Compute trajectory using ST_MakeLine
  v_metrics := public.calculate_booking_trajectory_km(p_booking_id);

  IF NOT (v_metrics->>'success')::boolean THEN
    RETURN v_metrics;
  END IF;

  v_excess_charge := (v_metrics->>'excess_charge_tzs')::numeric;
  v_total_km := (v_metrics->>'total_km_driven')::numeric;
  v_allowed_km := (v_metrics->>'allowed_km')::numeric;
  v_excess_km := (v_metrics->>'excess_km')::numeric;

  SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id FOR UPDATE;

  -- If customer profile is associated, check wallet for debiting
  v_customer_id := v_booking.customer_id;
  IF v_customer_id IS NULL THEN
    SELECT id INTO v_customer_id FROM public.profiles WHERE lower(phone) = lower(v_booking.customer_phone) LIMIT 1;
  END IF;

  -- 2. Execute wallet deduction if excess charge exists and profile is found
  IF v_excess_charge > 0 AND v_customer_id IS NOT NULL THEN
    SELECT wallet_balance INTO v_user_balance
    FROM public.profiles
    WHERE id = v_customer_id
    FOR UPDATE;

    -- Debit balance (allowing negative running balance or billing against credits)
    v_new_balance := coalesce(v_user_balance, 0.00) - v_excess_charge;

    UPDATE public.profiles
    SET wallet_balance = v_new_balance, updated_at = now()
    WHERE id = v_customer_id;

    -- Record double-entry wallet ledger
    INSERT INTO public.wallet_ledgers (
      profile_id, booking_id, amount, running_balance, reason
    ) VALUES (
      v_customer_id, p_booking_id, -v_excess_charge, v_new_balance,
      'Automated GPS Excess Mileage Surcharge (' || v_excess_km || ' km @ TZS 800/km) for booking #' || substr(p_booking_id::text, 1, 8)
    );
  END IF;

  -- 3. Update Booking Record with Audit Snapshot
  UPDATE public.bookings
  SET total_km_driven = v_total_km,
      allowed_km = v_allowed_km,
      excess_km = v_excess_km,
      excess_mileage_billed = v_excess_charge,
      mileage_audited_at = now(),
      updated_at = now()
  WHERE id = p_booking_id;

  RETURN jsonb_build_object(
    'success', true,
    'total_km_driven', v_total_km,
    'allowed_km', v_allowed_km,
    'excess_km', v_excess_km,
    'billed_amount_tzs', v_excess_charge,
    'wallet_debited', (v_customer_id IS NOT NULL AND v_excess_charge > 0)
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.calculate_booking_trajectory_km(UUID) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.audit_and_bill_excess_mileage(UUID, UUID) TO authenticated, service_role, anon;
