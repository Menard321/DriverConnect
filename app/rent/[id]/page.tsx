"use client";

import React, { useState, useEffect, useMemo, use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UserCheck,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Calendar,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { INITIAL_VEHICLES } from "@/lib/mockData";
import { EmbeddedCheckoutModal } from "@/components/checkout/EmbeddedCheckoutModal";

const CHAUFFEUR_RATE_PER_DAY = 50000;
const DELIVERY_RATE_PER_KM = 3500;

interface VehicleDetail {
  id: string;
  title: string;
  brand: string;
  year: number;
  transmission: "automatic" | "manual";
  seats: number;
  fuel_type: string;
  daily_rate: number;
  weekly_rate: number;
  features: string[];
  cover_image: string;
}

export default function RentalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const vehicleId = resolvedParams.id;

  const initialVehicle =
    INITIAL_VEHICLES.find((v) => v.id === vehicleId) || INITIAL_VEHICLES[0];
  const [vehicle, setVehicle] = useState<VehicleDetail | null>(initialVehicle as any);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [pickupDate, setPickupDate] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");
  const [withDriver, setWithDriver] = useState<boolean>(false);
  const [deliveryType, setDeliveryType] = useState<"showroom" | "doorstep">("showroom");
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [distanceKm, setDistanceKm] = useState<number>(10);
  const [paymentType, setPaymentType] = useState<"full_payment" | "deposit">("full_payment");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Stripe & Success Modal State
  const [checkoutSecret, setCheckoutSecret] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [holdSuccess, setHoldSuccess] = useState<{
    bookingId: string;
    amount: number;
  } | null>(null);

  // Load vehicle data with live database query + resilient mock catalog fallback
  useEffect(() => {
    async function loadVehicleData() {
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

        // Resilient fallback to mock inventory
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
    loadVehicleData();
  }, [vehicleId]);

  // Set default dates tomorrow -> 4 days later
  useEffect(() => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const later = new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0];
    setPickupDate(tomorrow);
    setReturnDate(later);
  }, []);

  const {
    totalDays,
    baseRent,
    driverCost,
    deliveryCost,
    discount,
    grandTotal,
    depositAmount,
  } = useMemo(() => {
    if (!pickupDate || !returnDate || !vehicle) {
      return {
        totalDays: 0,
        baseRent: 0,
        driverCost: 0,
        deliveryCost: 0,
        discount: 0,
        grandTotal: 0,
        depositAmount: 0,
      };
    }
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const days =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (days <= 0) {
      return {
        totalDays: 0,
        baseRent: 0,
        driverCost: 0,
        deliveryCost: 0,
        discount: 0,
        grandTotal: 0,
        depositAmount: 0,
      };
    }

    const base = days * vehicle.daily_rate;
    const driver = withDriver ? days * CHAUFFEUR_RATE_PER_DAY : 0;
    const delivery =
      deliveryType === "doorstep" ? distanceKm * DELIVERY_RATE_PER_KM : 0;
    const sub = base + driver + delivery;
    const disc = paymentType === "full_payment" ? sub * 0.05 : 0;

    return {
      totalDays: days,
      baseRent: base,
      driverCost: driver,
      deliveryCost: delivery,
      discount: disc,
      grandTotal: sub - disc,
      depositAmount: sub * 0.2,
    };
  }, [
    pickupDate,
    returnDate,
    vehicle,
    withDriver,
    deliveryType,
    distanceKm,
    paymentType,
  ]);

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (totalDays <= 0) {
      setErrorMessage("Please select valid pickup and return dates.");
      return;
    }
    if (deliveryType === "doorstep" && !deliveryAddress.trim()) {
      setErrorMessage("Please enter a valid doorstep delivery address.");
      return;
    }

    try {
      setSubmitting(true);
      const payable = paymentType === "full_payment" ? grandTotal : depositAmount;

      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehicle?.id,
          amount: payable,
          totalAmount: payable,
          customerName,
          customerEmail,
          customerPhone,
          pickupDate,
          returnDate,
          paymentType,
          bookingType: "rental",
          deliveryAddress:
            deliveryType === "doorstep"
              ? deliveryAddress
              : "Showroom Pickup (Ali Hassan Mwinyi Rd, Kijitonyama, Dar es Salaam)",
          distanceKm: deliveryType === "doorstep" ? distanceKm : 0,
          withDriver,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reservation failed.");

      if (data.clientSecret && data.clientSecret.startsWith("pi_")) {
        setCheckoutSecret(data.clientSecret);
        setIsCheckoutOpen(true);
      } else {
        setHoldSuccess({
          bookingId: data.bookingId || `DC-HLD-${Date.now().toString().slice(-6)}`,
          amount: payable,
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred during booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 space-y-3">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
          Loading Fleet Details...
        </span>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400" />
        <span className="text-lg font-bold text-white">Vehicle Not Found</span>
        <Link
          href="/#inventory-grid"
          className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold"
        >
          Return to Fleet Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <Link
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-amber-400 transition"
          href="/#inventory-grid"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Fleet Catalog
        </Link>

        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Hold Acquired Success Card Banner */}
        {holdSuccess && (
          <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Vehicle Hold Acquired Successfully!</span>
            </div>
            <p className="text-xs text-slate-300">
              Booking Reference:{" "}
              <strong className="text-white font-mono">{holdSuccess.bookingId}</strong>{" "}
              &bull; Amount:{" "}
              <strong className="text-amber-400 font-mono">
                TZS {holdSuccess.amount.toLocaleString()}
              </strong>
              . Our dispatch desk in Kijitonyama, Dar es Salaam is preparing your key handoff.
            </p>
            <div className="flex gap-3 pt-2">
              <Link
                href="/account/dashboard"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition"
              >
                Track in My Dashboard
              </Link>
              <button
                type="button"
                onClick={() => setHoldSuccess(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs font-bold transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* 2-Column Split: Specs & Configuration Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Vehicle Visuals & Specs (lg:col-span-7) */}
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
              <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/60 text-xs font-extrabold text-amber-400 shadow-lg">
                TZS {vehicle.daily_rate.toLocaleString()} / Day
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                <span>{vehicle.brand}</span> &bull; <span>Model {vehicle.year}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">{vehicle.title}</h1>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block font-semibold">Transmission</span>
                <span className="text-xs font-extrabold text-white capitalize">
                  {vehicle.transmission}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block font-semibold">Capacity</span>
                <span className="text-xs font-extrabold text-white">
                  {vehicle.seats} Passengers
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block font-semibold">Fuel Type</span>
                <span className="text-xs font-extrabold text-white capitalize">
                  {vehicle.fuel_type}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block font-semibold">Weekly Rate</span>
                <span className="text-xs font-extrabold text-amber-400 font-mono">
                  TZS {(vehicle.weekly_rate || vehicle.daily_rate * 6).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Equipment & Safety Features */}
            <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Vehicle Equipment & Safety</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(vehicle.features || []).map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Reservation Configuration (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 block">
                Booking Configuration
              </span>
              <h2 className="text-xl font-bold text-white">Reserve Your Vehicle</h2>
            </div>

            <form onSubmit={handleProceedToPayment} className="space-y-5">
              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Return Date
                  </label>
                  <input
                    type="date"
                    required
                    min={pickupDate || new Date().toISOString().split("T")[0]}
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Dedicated Driver Option */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Add Dedicated Driver
                    </span>
                    <span className="text-[10px] text-slate-400">
                      +TZS {CHAUFFEUR_RATE_PER_DAY.toLocaleString()}/day &bull; Class C Certified
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={withDriver}
                  onChange={(e) => setWithDriver(e.target.checked)}
                  className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
                />
              </div>

              {/* Logistics & Pickup */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Logistics & Pickup
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType("showroom")}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      deliveryType === "showroom"
                        ? "border-amber-400 bg-slate-850 text-white shadow-sm"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>Showroom (Free)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType("doorstep")}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      deliveryType === "doorstep"
                        ? "border-amber-400 bg-slate-850 text-white shadow-sm"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>Doorstep Delivery</span>
                  </button>
                </div>

                {deliveryType === "doorstep" && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <input
                      type="text"
                      placeholder="e.g. Masaki, Peninsula, Dar es Salaam"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Distance: {distanceKm} km</span>
                      <span className="font-bold text-white font-mono">
                        TZS {(distanceKm * DELIVERY_RATE_PER_KM).toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="60"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Payment Strategy */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Payment Strategy
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentType("full_payment")}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      paymentType === "full_payment"
                        ? "border-amber-400 bg-slate-850 ring-2 ring-amber-400/20"
                        : "border-slate-800 bg-slate-950 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">
                      Pay 100% Upfront
                    </span>
                    <span className="text-[10px] text-emerald-400 font-extrabold">
                      Instant 5% Discount
                    </span>
                  </div>
                  <div
                    onClick={() => setPaymentType("deposit")}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      paymentType === "deposit"
                        ? "border-amber-400 bg-slate-850 ring-2 ring-amber-400/20"
                        : "border-slate-800 bg-slate-950 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">
                      20% Deposit Hold
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Balance on Key Handoff
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="space-y-3 pt-2">
                <input
                  type="text"
                  required
                  placeholder="Full Legal Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="+255 700 000 000"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Dynamic Itemized Quote in TZS */}
              {totalDays > 0 && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Vehicle Rental ({totalDays} Days):</span>
                    <span className="text-white font-mono">
                      TZS {baseRent.toLocaleString()}
                    </span>
                  </div>
                  {withDriver && (
                    <div className="flex justify-between text-slate-400">
                      <span>Chauffeur ({totalDays} Days):</span>
                      <span className="text-white font-mono">
                        TZS {driverCost.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {deliveryType === "doorstep" && (
                    <div className="flex justify-between text-slate-400">
                      <span>Delivery ({distanceKm} km):</span>
                      <span className="text-white font-mono">
                        TZS {deliveryCost.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {paymentType === "full_payment" && discount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>5% Upfront Discount:</span>
                      <span className="font-mono">
                        - TZS {discount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm">
                    <span className="font-bold text-white">
                      {paymentType === "full_payment"
                        ? "Total Payable Today:"
                        : "20% Deposit Due Today:"}
                    </span>
                    <span className="text-amber-400 font-black text-base font-mono">
                      TZS{" "}
                      {(paymentType === "full_payment"
                        ? grandTotal
                        : depositAmount
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting || totalDays <= 0}
                className="w-full py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-400/20 disabled:opacity-40 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>
                  {submitting ? "Locking Vehicle..." : "Acquire Hold & Proceed"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Embedded Stripe Checkout Modal */}
      {isCheckoutOpen && (
        <EmbeddedCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          vehicleTitle={vehicle.title}
          totalAmountTZS={paymentType === "full_payment" ? grandTotal : depositAmount}
          bookingType="rental"
          vehicleId={vehicle.id}
          onPaymentSuccess={(confirmedId: string) => {
            setIsCheckoutOpen(false);
            setHoldSuccess({
              bookingId: confirmedId,
              amount: paymentType === "full_payment" ? grandTotal : depositAmount,
            });
          }}
        />
      )}
    </div>
  );
}
