"use client";

import React, { useState } from "react";
import { Route, AlertTriangle, CheckCircle2, RotateCw, Gauge, DollarSign } from "lucide-react";

interface TrajectoryCardProps {
  bookingId: string;
  totalKm: number;
  allowedKm: number;
  excessKm: number;
  excessBilledTzs: number;
  auditedAt: string | null;
  onAudited?: () => void;
}

export default function MileageTrajectoryAuditCard({
  bookingId,
  totalKm,
  allowedKm,
  excessKm,
  excessBilledTzs,
  auditedAt,
  onAudited,
}: TrajectoryCardProps) {
  const [loading, setLoading] = useState(false);
  const [auditStats, setAuditStats] = useState({
    totalKm,
    allowedKm,
    excessKm,
    excessBilledTzs,
    auditedAt,
  });

  const handleRunAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rentals/audit-mileage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to audit");

      setAuditStats({
        totalKm: json.data.total_km_driven,
        allowedKm: json.data.allowed_km,
        excessKm: json.data.excess_km,
        excessBilledTzs: json.data.billed_amount_tzs,
        auditedAt: new Date().toISOString(),
      });

      if (onAudited) onAudited();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const isExcess = auditStats.excessKm > 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 text-xs">
      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
        <span className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <Route className="w-4 h-4 text-amber-400" /> PostGIS Trajectory Audit
        </span>
        <button
          onClick={handleRunAudit}
          disabled={loading}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-lg border border-slate-700 flex items-center gap-1 text-[10px] transition disabled:opacity-40 cursor-pointer"
        >
          <RotateCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Calculating..." : "Re-calculate"}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
            <Gauge className="w-3 h-3 text-blue-400" /> Trajectory Length
          </span>
          <span className="text-base font-black text-white font-mono">
            {auditStats.totalKm} km
          </span>
          <span className="text-[10px] text-slate-500 block">
            Allowance: {auditStats.allowedKm} km
          </span>
        </div>

        <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-amber-400" /> Surcharge (TZS)
          </span>
          <span className={`text-base font-black font-mono ${isExcess ? "text-rose-400" : "text-emerald-400"}`}>
            TZS {Number(auditStats.excessBilledTzs).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block">
            {isExcess ? `${auditStats.excessKm} km excess @ 800/km` : "Within limit"}
          </span>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
        <span>Audited: {auditStats.auditedAt ? new Date(auditStats.auditedAt).toLocaleString() : "Pending check-in"}</span>
        <span className={`font-bold uppercase ${isExcess ? "text-rose-400" : "text-emerald-400"}`}>
          {isExcess ? "Billed to Wallet" : "Compliant"}
        </span>
      </div>
    </div>
  );
}
