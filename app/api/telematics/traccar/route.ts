import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendTwilioAlerts } from "@/lib/twilioClient";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { device, position } = payload;

    if (!device?.uniqueId || !position || !position.valid) {
      return NextResponse.json({ ignored: true }, { status: 200 });
    }

    const { data: devMapping } = await supabaseAdmin
      .from("vehicle_telematics_devices")
      .select("vehicle_id")
      .eq("device_imei", device.uniqueId)
      .single();

    if (!devMapping) {
      return NextResponse.json({ error: "Device not registered" }, { status: 404 });
    }

    // Convert knots to km/h (1 knot = 1.852 km/h)
    const speedKmh = position.speed ? position.speed * 1.852 : 0;

    // 1. Insert spatial Point log into Supabase (Triggers evaluate_vehicle_geofence automatically)
    await supabaseAdmin.from("vehicle_telemetry_logs").insert({
      vehicle_id: devMapping.vehicle_id,
      device_imei: device.uniqueId,
      recorded_at: position.fixTime || new Date().toISOString(),
      location: `SRID=4326;POINT(${position.longitude} ${position.latitude})`,
      latitude: position.latitude,
      longitude: position.longitude,
      speed_kmh: Math.round(speedKmh * 10) / 10,
      altitude: position.altitude,
      course_deg: position.course,
      ignition_on: Boolean(position.attributes?.ignition),
      battery_voltage: position.attributes?.battery ? Number(position.attributes.battery) : null,
      raw_attributes: position.attributes || {},
    });

    // 2. Refresh device status
    await supabaseAdmin
      .from("vehicle_telematics_devices")
      .update({
        is_online: true,
        last_heartbeat: new Date().toISOString(),
        traccar_device_id: device.id ? String(device.id) : null,
      })
      .eq("device_imei", device.uniqueId);

    // 3. Check for any critical security alerts triggered by the spatial engine
    const { data: alerts } = await supabaseAdmin
      .from("telematics_alerts")
      .select("*, vehicles(title)")
      .eq("vehicle_id", devMapping.vehicle_id)
      .eq("is_acknowledged", false)
      .eq("severity", "critical")
      .limit(1);

    if (alerts && alerts.length > 0) {
      const alert: any = alerts[0];
      await sendTwilioAlerts({
        toPhone: "+255700000000",
        customerName: "DISPATCH SECURITY",
        carModel: alert.vehicles?.title || "Fleet Unit",
        pickupDate: new Date().toLocaleTimeString(),
        bookingId: `ALERT: ${alert.details} at coords (${position.latitude}, ${position.longitude})`,
      });

      await supabaseAdmin
        .from("telematics_alerts")
        .update({ is_acknowledged: true })
        .eq("id", alert.id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
