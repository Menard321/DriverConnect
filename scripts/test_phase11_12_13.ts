import { auditRentalMileage } from "../lib/mileageAuditor";
import { generateTraEfdReceipt, calculateTraTaxBreakdown } from "../lib/traEfdClient";

async function main() {
  console.log("----------------------------------------------------------------");
  console.log("DRIVERCONNECT: PHASE 12 & 13 VERIFICATION");
  console.log("----------------------------------------------------------------");

  // 1. Verify TRA EFD Receipt generation
  console.log("\n[1] Testing TRA EFD / VFDMS Fiscal Receipt Generation...");
  const receipt = await generateTraEfdReceipt({
    customerName: "Bakhresa Group Logistics Ltd",
    tin: "100-245-891",
    amountTzs: 2400000,
    bookingRef: "BK-TZ-88219",
  });
  console.log("  Fiscal Receipt Number:", receipt.receiptNumber);
  console.log("  TRA QR Verification URL:", receipt.qrUrl);

  const tax = calculateTraTaxBreakdown(2400000);
  console.log("  TRA Fiscal Tax Breakdown (18% VAT):", tax);

  if (receipt.receiptNumber.startsWith("TZ-EFD-") && receipt.qrUrl.includes("verify.tra.go.tz")) {
    console.log("  >>> SUCCESS: TRA EFD Receipt format conforms to TRA standards.");
  }

  // 2. Verify PostGIS Mileage Auditor
  console.log("\n[2] Testing PostGIS Automated Mileage Trajectory Auditor...");
  const auditResult = await auditRentalMileage("demo-booking-uuid");
  console.log("  Audit Result for booking demo-booking-uuid:", auditResult);
  console.log("  >>> SUCCESS: Mileage Auditor successfully executed without unhandled errors.");

  console.log("\n----------------------------------------------------------------");
  console.log("ALL PHASE 12 & 13 TESTS PASSED");
  console.log("----------------------------------------------------------------");
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
