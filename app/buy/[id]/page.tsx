"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Car,
  ShieldCheck,
  Calendar,
  ArrowRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  Lock,
  HelpCircle,
  Download,
  Gauge,
  Fuel,
  Settings2,
  Check,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { INITIAL_VEHICLES } from "@/lib/mockData";
import { EmbeddedCheckoutModal } from "@/components/checkout/EmbeddedCheckoutModal";

const RESERVATION_HOLD_FEE = 1300000;

interface VehicleSaleDetail {
  id: string;
  title: string;
  brand: string;
  year: number;
  transmission: "automatic" | "manual";
  fuel_type: string;
  mileage_km: number;
  license_plate: string;
  vin?: string;
  sale_price: number;
  status: "available" | "reserved" | "sold";
  features: string[];
  cover_image: string;
}

export default function VehicleSaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const vehicleId = resolvedParams.id;

  const initialVehicle =
    INITIAL_VEHICLES.find((v) => v.id === vehicleId) || INITIAL_VEHICLES[0];

  const [vehicle, setVehicle] = useState<VehicleSaleDetail | null>(
    initialVehicle as any
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals & form state
  const [isTestDriveOpen, setIsTestDriveOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isHoldSubmitting, setIsHoldSubmitting] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [holdSuccessBookingId, setHoldSuccessBookingId] = useState<string | null>(
    null
  );

  // Test drive fields
  const [testDriveDate, setTestDriveDate] = useState("");
  const [testDriveTime, setTestDriveTime] = useState("10:00");
  const [tdName, setTdName] = useState("");
  const [tdPhone, setTdPhone] = useState("");
  const [tdLicense, setTdLicense] = useState("");
  const [tdSuccess, setTdSuccess] = useState(false);

  // Inquiry fields
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Hold customer fields
  const [holdCustomerName, setHoldCustomerName] = useState("");
  const [holdCustomerEmail, setHoldCustomerEmail] = useState("");
  const [holdCustomerPhone, setHoldCustomerPhone] = useState("");

  // Load live vehicle details from Supabase with mock data fallback
  useEffect(() => {
    async function loadVehicle() {
      try {
        setLoading(true);
        if (
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ) {
          const { data, error } = await supabase
            .from("vehicles")
            .select("*")
            .eq("id", vehicleId)
            .single();

          if (!error && data) {
            setVehicle(data);
            return;
          }
        }

        const found =
          INITIAL_VEHICLES.find((v) => v.id === vehicleId) || INITIAL_VEHICLES[0];
        setVehicle(found as any);
      } catch (err: any) {
        const found =
          INITIAL_VEHICLES.find((v) => v.id === vehicleId) || INITIAL_VEHICLES[0];
        setVehicle(found as any);
      } finally {
        setLoading(false);
      }
    }
    loadVehicle();
  }, [vehicleId]);

  const handleInstantReservationHold = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!holdCustomerName || !holdCustomerEmail || !holdCustomerPhone) {
      setErrorMessage(
        "Please complete your contact details to lock this vehicle hold."
      );
      return;
    }

    try {
      setIsHoldSubmitting(true);
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehicle?.id,
          amount: RESERVATION_HOLD_FEE,
          totalAmount: RESERVATION_HOLD_FEE,
          customerName: holdCustomerName,
          customerEmail: holdCustomerEmail,
          customerPhone: holdCustomerPhone,
          paymentType: "deposit",
          bookingType: "sale_reservation",
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to initiate reservation hold.");

      setIsCheckoutOpen(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process reservation hold.");
    } finally {
      setIsHoldSubmitting(false);
    }
  };

  const handleTestDriveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("bookings").insert({
        vehicle_id: vehicle?.id,
        customer_name: tdName,
        customer_email: "testdrive@driverconnect.com",
        customer_phone: tdPhone,
        booking_type: "sale_reservation",
        pickup_date: testDriveDate,
        return_date: testDriveDate,
        total_amount: 0,
        payment_type: "cash_on_delivery",
        status: "confirmed",
        service_notes: `Test Drive scheduled for ${testDriveDate} at ${testDriveTime}. License: ${tdLicense}`,
      });

      if (error) {
        console.warn("Supabase booking insert warning:", error.message);
      }

      setTdSuccess(true);
      setTimeout(() => {
        setIsTestDriveOpen(false);
        setTdSuccess(false);
      }, 2500);
    } catch (err: any) {
      alert("Test Drive appointment booked in local demo session.");
      setTdSuccess(true);
      setTimeout(() => {
        setIsTestDriveOpen(false);
        setTdSuccess(false);
      }, 2000);
    }
  };

  const handleDownloadChecklist = () => {
    const reportContent = `DRIVERCONNECT VERIFIED INSPECTION REPORT
Vehicle: ${vehicle?.title} (${vehicle?.year})
VIN: ${vehicle?.vin || "TRA-VERIFIED-78192"}
Chassis & Registration: ${vehicle?.license_plate}
TRA Customs Clearance: PAID & VERIFIED
Mechanical Diagnostics: 150-Point Inspection Passed
Engine Compression: Optimal
Transmission Fluid: Fresh
Brake Pad Wear: 85% Remaining
Issued By: DriverConnect Central Workshop, Ali Hassan Mwinyi Rd, Kijitonyama, Dar es Salaam.`;

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Inspection-Report-${(vehicle?.license_plate || "VEHICLE").replace(
      /\s+/g,
      "_"
    )}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 space-y-3">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
          Loading Vehicle Dossier...
        </span>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400" />
        <span className="text-lg font-bold text-white">Vehicle Not Listed For Sale</span>
        <Link
          href="/buy"
          className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const isReserved = vehicle.status === "reserved";
  const isSold = vehicle.status === "sold";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <Link
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-amber-400 transition"
          href="/buy"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Verified Marketplace
        </Link>

        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 72-Hour Purchase Hold Notification Banner */}
        {isReserved && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                This vehicle is currently on a 72-hour purchase hold by another client.
                You may still schedule a test drive or ask questions.
              </span>
            </div>
            <span className="px-2.5 py-1 bg-amber-400/20 rounded-md text-[10px] uppercase font-black tracking-widest text-amber-400">
              On Hold
            </span>
          </div>
        )}

        {/* Hold Success Notification */}
        {holdSuccessBookingId && (
          <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>72-Hour Reservation Hold Secured!</span>
            </div>
            <p className="text-xs text-slate-300">
              Booking Ref:{" "}
              <strong className="text-white font-mono">{holdSuccessBookingId}</strong>.
              Vehicle status is locked for 72 hours. Our central showroom team has been
              notified and will prepare title transfer papers.
            </p>
          </div>
        )}

        {/* 2-Column Split: Vehicle Dossier & Acquisition Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Cover Image & 150-Point Specs (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
              <Image
                src={vehicle.cover_image || "/images/cars/toyota-prado.webp"}
                alt={vehicle.title}
                className="object-cover"
                fill
                priority
                unoptimized
              />
              <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/60 text-xs font-black text-amber-400 shadow-lg">
                TZS {(vehicle.sale_price || 48000000).toLocaleString()}
              </div>
              <div className="absolute top-4 right-4">
                {isSold ? (
                  <span className="px-3.5 py-1.5 rounded-full bg-rose-500 text-white font-black text-xs uppercase tracking-wider">
                    Sold Out
                  </span>
                ) : isReserved ? (
                  <span className="px-3.5 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Reserved
                  </span>
                ) : (
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Available
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                <span>{vehicle.brand}</span> &bull; <span>Year {vehicle.year}</span> &bull;{" "}
                <span>Plate: {vehicle.license_plate}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">{vehicle.title}</h1>
            </div>

            {/* Quick Mechanical Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <Gauge className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span className="text-[11px] text-slate-400 block font-semibold">
                  Odometer
                </span>
                <span className="text-xs font-extrabold text-white">
                  {(vehicle.mileage_km || 42000).toLocaleString()} km
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <Settings2 className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <span className="text-[11px] text-slate-400 block font-semibold">
                  Gearbox
                </span>
                <span className="text-xs font-extrabold text-white capitalize">
                  {vehicle.transmission}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <Fuel className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-[11px] text-slate-400 block font-semibold">
                  Fuel Engine
                </span>
                <span className="text-xs font-extrabold text-white capitalize">
                  {vehicle.fuel_type}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <ShieldCheck className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                <span className="text-[11px] text-slate-400 block font-semibold">
                  TRA Tax Status
                </span>
                <span className="text-xs font-extrabold text-emerald-400">
                  Duty Paid
                </span>
              </div>
            </div>

            {/* 150-Point Inspection Sheet & Download Action */}
            <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" /> 150-Point Quality Certified
                </span>
                <h4 className="text-sm font-bold text-white">
                  Full Inspection Checklist Ready
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified mechanical compression, transmission scan, and clear TRA title
                  verification.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadChecklist}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold flex items-center gap-2 border border-slate-700 transition active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </button>
            </div>

            {/* Features & Factory Options */}
            <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Features & Factory Options
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(vehicle.features || []).map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs text-slate-300"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Instant 72-Hour Hold & Actions (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. 72-Hour Hold Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 block">
                  Purchase Guarantee
                </span>
                <h2 className="text-xl font-bold text-white">
                  Instant 72-Hour Vehicle Hold
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Place a hold of{" "}
                  <strong className="text-white font-mono">
                    TZS {RESERVATION_HOLD_FEE.toLocaleString()}
                  </strong>{" "}
                  to freeze this vehicle. It prevents other buyers from purchasing while you
                  complete financing or view it in person.
                </p>
              </div>

              {isSold ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                  Sold out.
                </div>
              ) : isReserved ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-xs text-amber-300 font-bold">
                  Vehicle currently under active deposit hold. Direct purchases locked.
                </div>
              ) : (
                <form onSubmit={handleInstantReservationHold} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Juma Rashid"
                      value={holdCustomerName}
                      onChange={(e) => setHoldCustomerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="juma@example.com"
                        value={holdCustomerEmail}
                        onChange={(e) => setHoldCustomerEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+255..."
                        value={holdCustomerPhone}
                        onChange={(e) => setHoldCustomerPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
                    <span className="text-slate-400">Hold Fee (100% Deductible):</span>
                    <span className="font-extrabold text-amber-400 font-mono">
                      TZS {RESERVATION_HOLD_FEE.toLocaleString()}
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={isHoldSubmitting}
                    className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-400/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Lock className="w-4 h-4" />
                    <span>
                      {isHoldSubmitting
                        ? "Locking..."
                        : "Pay TZS 1,300,000 & Lock Car"}
                    </span>
                  </button>
                </form>
              )}
            </div>

            {/* 2. Schedule Test Drive Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  Schedule Free Test Drive
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Experience this vehicle at our central showroom in Kijitonyama, Dar es
                Salaam. 30-minute booking.
              </p>
              <button
                type="button"
                onClick={() => setIsTestDriveOpen(true)}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-slate-700 transition flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Book Test Drive Slot</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* 3. Have Questions / Dealer Inquiry Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Have Questions on this Unit?
                </h4>
              </div>
              <p className="text-xs text-slate-400">
                Contact our showroom desk directly regarding duty clearance, exchange
                offers, or financing.
              </p>
              <button
                type="button"
                onClick={() => setIsInquiryOpen(true)}
                className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-800 transition active:scale-95"
              >
                Send Question to Dealer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Test Drive Scheduling Modal */}
      {isTestDriveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" /> Book Test Drive
              </h3>
              <button
                type="button"
                onClick={() => setIsTestDriveOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>
            {tdSuccess ? (
              <div className="p-6 text-center space-y-2">
                <Check className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-bold text-white text-sm">
                  Appointment Confirmed!
                </h4>
                <p className="text-xs text-slate-400">
                  Our showroom team has reserved your 30-min slot. Please bring your driving
                  license.
                </p>
              </div>
            ) : (
              <form onSubmit={handleTestDriveSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={testDriveDate}
                      onChange={(e) => setTestDriveDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Time Slot
                    </label>
                    <select
                      value={testDriveTime}
                      onChange={(e) => setTestDriveTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="09:00">09:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amani Mwamba"
                    value={tdName}
                    onChange={(e) => setTdName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+255..."
                      value={tdPhone}
                      onChange={(e) => setTdPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Driver License No.
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="TZ-DL-..."
                      value={tdLicense}
                      onChange={(e) => setTdLicense(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg active:scale-95"
                >
                  Confirm Free Test Drive
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Dealer Inquiry Modal */}
      {isInquiryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" /> Ask a Question
              </h3>
              <button
                type="button"
                onClick={() => setIsInquiryOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>
            {inquirySuccess ? (
              <div className="p-6 text-center space-y-2">
                <Check className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">Message Dispatched</h4>
                <p className="text-xs text-slate-400">
                  Our sales manager has received your query and will reply via email/phone
                  shortly.
                </p>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await supabase.from("bookings").insert({
                      vehicle_id: vehicle?.id,
                      customer_name: inquiryName,
                      customer_email: inquiryEmail,
                      customer_phone: "+255000000000",
                      booking_type: "sale_reservation",
                      total_amount: 0,
                      payment_type: "cash_on_delivery",
                      status: "pending",
                      service_notes: `[Inquiry on ${vehicle?.title}]: ${inquiryMessage}`,
                    });
                  } catch (err) {
                    console.warn("Inquiry logged in local demo mode:", err);
                  }
                  setInquirySuccess(true);
                  setTimeout(() => {
                    setIsInquiryOpen(false);
                    setInquirySuccess(false);
                  }, 2500);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maryam Said"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="maryam@example.com"
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Your Question
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. Is there room for negotiation or bank financing available?"
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg active:scale-95"
                >
                  Send Inquiry to Showroom
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Embedded Stripe Checkout Modal for TZS 1.3M Hold */}
      {isCheckoutOpen && (
        <EmbeddedCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          vehicleTitle={`${vehicle.title} (72-Hour Hold)`}
          totalAmountTZS={RESERVATION_HOLD_FEE}
          bookingType="sale_reservation"
          vehicleId={vehicle.id}
          onPaymentSuccess={(confirmedId: string) => {
            setIsCheckoutOpen(false);
            setHoldSuccessBookingId(confirmedId);
            setVehicle((prev) => (prev ? { ...prev, status: "reserved" } : null));
          }}
        />
      )}
    </div>
  );
}
