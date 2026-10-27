import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * GPRS Remote Engine Relay Controller
 * Interfaces with Traccar Server / Teltonika FMB920 GPS Tracker standard.
 * Teltonika command standard: "setdigout 1" (Immobilize / Cut Engine Relay) | "setdigout 0" (Restore / Re-enable)
 */
export async function toggleEngineRelay(
  deviceImei: string,
  cutEngine: boolean
): Promise<boolean> {
  const traccarBase = process.env.TRACCAR_API_URL;
  const traccarUser = process.env.TRACCAR_USER || "admin";
  const traccarPass = process.env.TRACCAR_PASSWORD || "admin";
  const authHeader = `Basic ${Buffer.from(`${traccarUser}:${traccarPass}`).toString("base64")}`;

  // Teltonika standard command protocol
  const rawCommand = cutEngine ? "setdigout 1" : "setdigout 0";

  try {
    // 1. If Traccar instance is configured, dispatch HTTP command
    if (traccarBase) {
      const res = await fetch(`${traccarBase}/commands/send`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deviceId: deviceImei,
          type: "custom",
          attributes: { data: rawCommand },
        }),
      });

      if (!res.ok) {
        console.warn(`[Traccar Relay Command Status]: ${res.status} ${res.statusText}`);
      }
    } else {
      console.log(`[Telematics Simulator]: Dispatched GPRS command '${rawCommand}' to IMEI ${deviceImei}`);
    }

    // 2. Persist immobilization status to Supabase if connected
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        await supabaseAdmin
          .from("vehicle_telematics_devices")
          .update({
            engine_relay_cut: cutEngine,
            updated_at: new Date().toISOString(),
          })
          .eq("device_imei", deviceImei);
      }
    } catch (dbErr) {
      console.warn("[Database Telematics Status Sync Warning]:", dbErr);
    }

    return true;
  } catch (err) {
    console.error("Relay command error:", err);
    return false;
  }
}
