import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface MileageAuditResult {
  totalDistanceKm: number;
  excessBilledTzs: number;
  allowedKm?: number;
  days?: number;
  excessKm?: number;
}

/**
 * PostGIS Automated Mileage Trajectory Auditor
 * Calculates total distance from telematics points during rental period,
 * compares against 200 km/day allotment, and bills TZS 800 per excess km.
 */
export async function auditRentalMileage(
  bookingId: string
): Promise<{ totalDistanceKm: number; excessBilledTzs: number }> {
  try {
    // Query PostGIS to stitch all telemetry points into an ST_MakeLine and calculate length in meters
    const { data, error } = await supabaseAdmin.rpc("calculate_booking_mileage", {
      p_booking_id: bookingId,
    });

    if (error || !data) {
      console.warn(`[mileageAuditor] calculate_booking_mileage RPC notice:`, error?.message || "No data returned");
      return { totalDistanceKm: 0, excessBilledTzs: 0 };
    }

    const payload = typeof data === "string" ? JSON.parse(data) : data;
    const meters = Number(payload.meters_driven) || 0;
    const totalKm = Math.round(meters / 1000);
    const dailyLimit = 200; // 200 km/day standard allotment
    const days = Math.max(1, Number(payload.total_days) || 1);
    const allowedKm = days * dailyLimit;

    let excessTzs = 0;
    if (totalKm > allowedKm) {
      const excessKm = totalKm - allowedKm;
      excessTzs = excessKm * 800; // TZS 800 per excess kilometer

      // Record excess fee on the booking
      const { error: updateError } = await supabaseAdmin
        .from("bookings")
        .update({ excess_mileage_billed: excessTzs })
        .eq("id", bookingId);

      if (updateError) {
        console.error(`[mileageAuditor] Failed to record excess fee on booking ${bookingId}:`, updateError.message);
      }
    }

    return { totalDistanceKm: totalKm, excessBilledTzs: excessTzs };
  } catch (err: any) {
    console.error("[mileageAuditor] Execution exception:", err?.message || err);
    return { totalDistanceKm: 0, excessBilledTzs: 0 };
  }
}
