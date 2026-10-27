"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Route,
  Car,
  Radio,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Navigation,
  Gauge,
  RotateCw,
  Search,
} from "lucide-react";
import MileageTrajectoryAuditCard from "@/components/admin/MileageTrajectoryAuditCard";

interface TrackingBooking {
  id: string;
  vehicleTitle: string;
  licensePlate: string;
  customerName: string;
  customerPhone: string;
  pickupDate: string;
  returnDate: string;
  totalKm: number;
  allowedKm: number;
  excessKm: number;
  excessBilledTzs: number;
  auditedAt: string | null;
  status: "in_progress" | "completed" | "pending";
}

const INITIAL_TRACKING_BOOKINGS: TrackingBooking[] = [
  {
    id: "b48c10fa-7c91-4e89-a512-1092a832f012",
    vehicleTitle: "Toyota Land Cruiser Prado TX-L",
    licensePlate: "T 782 EBC",
    customerName: "David Mrema",
    customerPhone: "+255 754 123 456",
    pickupDate: "2026-10-25",
    returnDate: "2026-10-28",
    totalKm: 684.5,
    allowedKm: 600.0,
    excessKm: 84.5,
    excessBilledTzs: 67600,
    auditedAt: new Date(Date.now() - 3600000).toISOString(),
    status: "completed",
  },
  {
    id: "c91e52ba-8d02-4f90-b623-2103b943e123",
    vehicleTitle: "Toyota Harrier Elegance (2018)",
    licensePlate: "T 419 DWL",
    customerName: "Amina Salum",
    customerPhone: "+255 712 345 678",
    pickupDate: "2026-10-26",
    returnDate: "2026-10-29",
    totalKm: 342.0,
    allowedKm: 600.0,
    excessKm: 0.0,
    excessBilledTzs: 0,
    auditedAt: null,
    status: "in_progress",
  },
  {
    id: "d02f63cb-9e13-4a01-c734-3214c054f234",
    vehicleTitle: "Toyota Hilux Revo Double Cabin",
    licensePlate: "T 144 EDZ",
    customerName: "Safari Expeditions Ltd",
    customerPhone: "+255 788 990 011",
    pickupDate: "2026-10-24",
    returnDate: "2026-10-27",
    totalKm: 915.2,
    allowedKm: 800.0,
    excessKm: 115.2,
    excessBilledTzs: 92160,
    auditedAt: new Date(Date.now() - 14400000).toISOString(),
    status: "completed",
  },
];

export default function AdminTrackingPage() {
  const [bookings, setBookings] = useState<TrackingBooking[]>(INITIAL_TRACKING_BOOKINGS);
  const [selectedBookingId, setSelectedBookingId] = useState<string>(INITIAL_TRACKING_BOOKINGS[0].id);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId) || bookings[0];

  const filteredBookings = bookings.filter(
    (b) =>
      b.vehicleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-10 space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <Link
            href="/admin"
            className="text-xs font-bold text-slate-400 hover:text-amber-400 flex items-center gap-1.5 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <Route className="w-3.5 h-3.5" /> Telematics &amp; GPS Spatial Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            PostGIS Trajectory &amp; Excess Mileage Auditor
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geodetic ST_MakeLine distance measurements, 200 km/day threshold monitoring, and automated TZS 800/km wallet surcharges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> Teltonika / Traccar Online
          </span>
        </div>
      </div>

      {/* 2. Metric Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500">Fleet GPS Coverage</span>
          <h3 className="text-xl font-black text-white font-mono">100% Active</h3>
          <span className="text-[10px] text-emerald-400 block font-semibold">PostGIS SRID:4326</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500">Standard Allowance</span>
          <h3 className="text-xl font-black text-amber-400 font-mono">200 km / day</h3>
          <span className="text-[10px] text-slate-400 block font-semibold">Base Contract Allotment</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500">Excess Surcharge Rate</span>
          <h3 className="text-xl font-black text-rose-400 font-mono">TZS 800 / km</h3>
          <span className="text-[10px] text-slate-400 block font-semibold">Auto-Billed to Wallet</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500">Twilio Alert Rail</span>
          <h3 className="text-xl font-black text-emerald-400 font-mono">SMS &amp; WhatsApp</h3>
          <span className="text-[10px] text-slate-400 block font-semibold">Instant Check-in Dispatch</span>
        </div>
      </div>

      {/* 3. Main Audit Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Active Trajectory Inspection Widget */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Selected Trajectory Widget
          </h2>
          <MileageTrajectoryAuditCard
            bookingId={selectedBooking.id}
            totalKm={selectedBooking.totalKm}
            allowedKm={selectedBooking.allowedKm}
            excessKm={selectedBooking.excessKm}
            excessBilledTzs={selectedBooking.excessBilledTzs}
            auditedAt={selectedBooking.auditedAt}
            onAudited={() => {
              // Refresh state
              setBookings((prev) =>
                prev.map((b) =>
                  b.id === selectedBooking.id
                    ? {
                        ...b,
                        auditedAt: new Date().toISOString(),
                      }
                    : b
                )
              );
            }}
          />

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              Selected Rental Details
            </h3>
            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle:</span>
                <span className="font-bold text-white">{selectedBooking.vehicleTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">License Plate:</span>
                <span className="font-mono font-bold text-amber-400">{selectedBooking.licensePlate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-medium text-white">{selectedBooking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Handset Phone:</span>
                <span className="font-mono font-medium text-white">{selectedBooking.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Rental Window:</span>
                <span className="font-mono text-slate-400">{selectedBooking.pickupDate} to {selectedBooking.returnDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Fleet Trajectory Log List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Fleet Rentals &amp; Return Check-Ins ({filteredBookings.length})
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search plate, title, or client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-4">Vehicle &amp; Customer</th>
                    <th className="py-4 px-4 text-right">Driven / Allowed</th>
                    <th className="py-4 px-4 text-right">Excess km</th>
                    <th className="py-4 px-4 text-right">Surcharge</th>
                    <th className="py-4 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredBookings.map((b) => {
                    const isSelected = b.id === selectedBookingId;
                    const isExcess = b.excessKm > 0;
                    return (
                      <tr
                        key={b.id}
                        onClick={() => setSelectedBookingId(b.id)}
                        className={`cursor-pointer transition ${
                          isSelected ? "bg-amber-400/10" : "hover:bg-slate-850/50"
                        }`}
                      >
                        <td className="py-4 px-4">
                          <div className="font-bold text-white text-xs">{b.vehicleTitle}</div>
                          <div className="text-slate-400 text-[11px] flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-amber-400 font-bold">{b.licensePlate}</span>
                            <span>&bull;</span>
                            <span>{b.customerName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-mono">
                          <span className="text-white font-bold">{b.totalKm} km</span>
                          <span className="text-slate-500 block text-[10px]">/ {b.allowedKm} km</span>
                        </td>
                        <td className="py-4 px-4 text-right font-mono">
                          {isExcess ? (
                            <span className="text-rose-400 font-bold">+{b.excessKm} km</span>
                          ) : (
                            <span className="text-emerald-400 font-bold">0 km</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold">
                          {isExcess ? (
                            <span className="text-rose-400">TZS {b.excessBilledTzs.toLocaleString()}</span>
                          ) : (
                            <span className="text-slate-500">TZS 0</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBookingId(b.id);
                            }}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                              isSelected
                                ? "bg-amber-400 text-slate-950 shadow-md"
                                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                            }`}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
