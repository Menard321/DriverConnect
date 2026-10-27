-- ==============================================================================
-- DRIVERCONNECT: CHAUFFEUR COMPANION, INSPECTIONS & MILEAGE AUDITING SCHEMA
-- ==============================================================================

-- 1. Add excess_mileage_billed column to bookings if not exists
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS excess_mileage_billed NUMERIC(14, 2) DEFAULT 0;

-- 2. Vehicle Handover & Inspections
CREATE TABLE IF NOT EXISTS public.vehicle_inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    inspection_type TEXT NOT NULL CHECK (inspection_type IN ('pre_handover', 'post_return')) DEFAULT 'pre_handover',
    odometer_reading NUMERIC(10, 2) NOT NULL,
    fuel_level_percent NUMERIC(5, 2) NOT NULL DEFAULT 100,
    customer_signature_svg TEXT,
    driver_signature_svg TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inspections_booking ON public.vehicle_inspections(booking_id);

-- 3. PostGIS / Telematics Mileage Calculation RPC
CREATE OR REPLACE FUNCTION public.calculate_booking_mileage(p_booking_id UUID)
RETURNS JSON AS $$
DECLARE
    v_vehicle_id UUID;
    v_start TIMESTAMPTZ;
    v_end TIMESTAMPTZ;
    v_days INT;
    v_meters NUMERIC := 0;
    v_log_count INT := 0;
BEGIN
    SELECT vehicle_id, pickup_date, return_date,
           GREATEST(1, CEIL(EXTRACT(EPOCH FROM (return_date - pickup_date)) / 86400))::INT
    INTO v_vehicle_id, v_start, v_end, v_days
    FROM public.bookings
    WHERE id = p_booking_id;

    IF v_vehicle_id IS NULL THEN
        RETURN json_build_object('meters_driven', 0, 'total_days', 1);
    END IF;

    -- Count telemetry logs recorded during the active rental window
    SELECT COUNT(*) INTO v_log_count
    FROM public.vehicle_telemetry_logs
    WHERE vehicle_id = v_vehicle_id
      AND recorded_at >= v_start
      AND recorded_at <= COALESCE(v_end, now());

    -- Approximate meters driven from telemetry speed and intervals, or default baseline
    IF v_log_count > 1 THEN
        SELECT COALESCE(SUM((speed_kmh / 3.6) * 30), 0) INTO v_meters
        FROM public.vehicle_telemetry_logs
        WHERE vehicle_id = v_vehicle_id
          AND recorded_at >= v_start
          AND recorded_at <= COALESCE(v_end, now());
    ELSE
        -- Fallback simulation (approx 160km per day driven)
        v_meters := v_days * 160000;
    END IF;

    RETURN json_build_object(
        'meters_driven', v_meters,
        'total_days', v_days
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS
ALTER TABLE public.vehicle_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert vehicle inspections"
    ON public.vehicle_inspections FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can read vehicle inspections"
    ON public.vehicle_inspections FOR SELECT
    USING (true);
