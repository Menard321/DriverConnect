-- ==============================================================================
-- DRIVERCONNECT: TELEMATICS, GPS TRACKING & REMOTE IMMOBILIZATION SCHEMA
-- ==============================================================================

-- 1. Vehicle Telematics Hardware Devices (Teltonika FMB920 / Traccar)
CREATE TABLE IF NOT EXISTS public.vehicle_telematics_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    device_imei TEXT NOT NULL UNIQUE,
    traccar_device_id TEXT,
    device_model TEXT DEFAULT 'Teltonika FMB920',
    sim_phone_number TEXT,
    is_online BOOLEAN DEFAULT false,
    engine_relay_cut BOOLEAN DEFAULT false,
    last_heartbeat TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Spatial Telemetry Point Logs
CREATE TABLE IF NOT EXISTS public.vehicle_telemetry_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    device_imei TEXT NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    location TEXT, -- SRID=4326;POINT(lon lat)
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    speed_kmh NUMERIC(6, 2) DEFAULT 0,
    altitude NUMERIC(8, 2),
    course_deg NUMERIC(6, 2),
    ignition_on BOOLEAN DEFAULT false,
    battery_voltage NUMERIC(6, 2),
    raw_attributes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing for high-speed spatial & temporal queries
CREATE INDEX IF NOT EXISTS idx_telemetry_vehicle_time ON public.vehicle_telemetry_logs(vehicle_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_device_imei ON public.vehicle_telemetry_logs(device_imei);

-- 3. Telematics Security & Geofence Alerts
CREATE TABLE IF NOT EXISTS public.telematics_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    device_imei TEXT,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
    alert_type TEXT NOT NULL DEFAULT 'geofence',
    details TEXT NOT NULL,
    is_acknowledged BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_telematics_alerts_unack ON public.telematics_alerts(vehicle_id, is_acknowledged) WHERE is_acknowledged = false;

-- 4. Spatial Evaluation Trigger Function
CREATE OR REPLACE FUNCTION public.evaluate_vehicle_geofence()
RETURNS TRIGGER AS $$
DECLARE
    v_vehicle_title TEXT;
BEGIN
    SELECT title INTO v_vehicle_title FROM public.vehicles WHERE id = NEW.vehicle_id;

    -- Speed limit breach (> 120 km/h on Tanzanian highways)
    IF NEW.speed_kmh > 120 THEN
        INSERT INTO public.telematics_alerts (vehicle_id, device_imei, severity, alert_type, details)
        VALUES (
            NEW.vehicle_id,
            NEW.device_imei,
            'critical',
            'overspeed',
            'Speed threshold exceeded: ' || NEW.speed_kmh || ' km/h'
        );
    END IF;

    -- Geofence breach check (Tanzania National Territory bounding polygon: approx lat -12 to -1, lon 29 to 41)
    IF NEW.latitude < -12.0 OR NEW.latitude > -0.8 OR NEW.longitude < 29.0 OR NEW.longitude > 41.0 THEN
        INSERT INTO public.telematics_alerts (vehicle_id, device_imei, severity, alert_type, details)
        VALUES (
            NEW.vehicle_id,
            NEW.device_imei,
            'critical',
            'geofence_breach',
            'National border perimeter crossed at coords: ' || NEW.latitude || ', ' || NEW.longitude
        );
    END IF;

    -- Critical Low Battery / Tamper Warning (< 11.2V)
    IF NEW.battery_voltage IS NOT NULL AND NEW.battery_voltage < 11.2 THEN
        INSERT INTO public.telematics_alerts (vehicle_id, device_imei, severity, alert_type, details)
        VALUES (
            NEW.vehicle_id,
            NEW.device_imei,
            'warning',
            'low_battery',
            'Tracker battery voltage dropped to: ' || NEW.battery_voltage || 'V'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_evaluate_telemetry_geofence ON public.vehicle_telemetry_logs;
CREATE TRIGGER trigger_evaluate_telemetry_geofence
    AFTER INSERT ON public.vehicle_telemetry_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.evaluate_vehicle_geofence();

-- Enable RLS
ALTER TABLE public.vehicle_telematics_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_telemetry_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telematics_alerts ENABLE ROW LEVEL SECURITY;

-- Service Role Full Access
CREATE POLICY "Service Role Telematics Full Access"
    ON public.vehicle_telematics_devices FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service Role Logs Full Access"
    ON public.vehicle_telemetry_logs FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service Role Alerts Full Access"
    ON public.telematics_alerts FOR ALL
    USING (auth.role() = 'service_role');
