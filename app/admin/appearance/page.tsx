"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Palette,
  Layout,
  Maximize2,
  Check,
  Save,
  RotateCcw,
  Eye,
  Sliders,
  Car,
  ShieldCheck,
  MessageSquare,
  ArrowLeft,
  Image as ImageIcon,
  DollarSign,
} from "lucide-react";
import { AppearanceConfig, useTheme } from "@/components/providers/ThemeProvider";

export default function AdminAppearanceStudio() {
  const { appearance, setAppearance } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [draft, setDraft] = useState<AppearanceConfig>({ ...appearance });

  // Sync draft whenever appearance changes initially from API
  useEffect(() => {
    setDraft({ ...appearance });
  }, [appearance]);

  const handleUpdate = <K extends keyof AppearanceConfig>(
    key: K,
    value: AppearanceConfig[K]
  ) => {
    const updated = { ...draft, [key]: value };
    setDraft(updated);
    // Real-time canvas reflection
    setAppearance(updated);
  };

  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const response = await fetch("/api/admin/appearance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });

      if (!response.ok) throw new Error("Failed to persist appearance config");

      setSaveStatus("Platform styling applied and saved successfully.");
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err: any) {
      setSaveStatus(`Save Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const defaultState: AppearanceConfig = {
      themeAccent: "amber",
      cornerRadius: "rounded",
      layoutDensity: "classic",
      showTestimonials: true,
      backgroundImageUrl: "/images/hero-workshop-bg.jpg",
      deliveryRatePerKm: 3500,
      driverDailyRate: 50000,
      saleReservationFee: 1300000,
    };
    setDraft(defaultState);
    setAppearance(defaultState);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10">
      {/* Studio Top Navigation & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
          </div>
          <span className="text-xs font-bold tracking-widest text-amber-400 uppercase flex items-center gap-1.5 mb-1">
            <Sliders className="w-3.5 h-3.5" /> Studio Configuration
          </span>
          <h1 className="text-2xl lg:text-3xl font-black text-white">
            Appearance & Branding Studio
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Customize platform primary accents, corner geometry, and density in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            type="button"
            onClick={handleSaveToDatabase}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-amber-400/20 transition active:scale-95 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Publishing..." : "Save & Publish"}</span>
          </button>
        </div>
      </div>

      {/* Save Status Notification */}
      {saveStatus && (
        <div
          className={`mb-6 p-4 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            saveStatus.includes("Error")
              ? "bg-rose-950/60 border-rose-500/40 text-rose-300"
              : "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
          }`}
        >
          <Check className="w-4 h-4" /> {saveStatus}
        </div>
      )}

      {/* 2-Column Split: Controls + Live Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customization Controls (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Theme Accent Palette */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Theme Accent Palette</span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { id: "amber", name: "Amber Gold", hex: "#f59e0b", desc: "Default Luxury" },
                { id: "emerald", name: "Emerald Safari", hex: "#10b981", desc: "Eco / High Contrast" },
                { id: "blue", name: "Cobalt Blue", hex: "#3b82f6", desc: "Executive / Tech" },
                { id: "rose", name: "Rose Ruby", hex: "#f43f5e", desc: "Sport / Aggressive" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleUpdate("themeAccent", c.id as any)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                    draft.themeAccent === c.id
                      ? "border-amber-400 bg-slate-800 ring-2 ring-amber-400/20"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">{c.name}</span>
                    <span className="text-[10px] text-slate-400">{c.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Corner Radius Geometry */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Maximize2 className="w-4 h-4 text-blue-400" />
              <span>Corner Radius Geometry</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "sharp", label: "Sharp", radiusClass: "rounded-none", token: "0px" },
                { id: "rounded", label: "Rounded", radiusClass: "rounded-xl", token: "12px" },
                { id: "pill", label: "Pill / Full", radiusClass: "rounded-full", token: "9999px" },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleUpdate("cornerRadius", r.id as any)}
                  className={`p-3.5 rounded-xl border text-center transition flex flex-col items-center gap-2 ${
                    draft.cornerRadius === r.id
                      ? "border-amber-400 bg-slate-800 ring-2 ring-amber-400/20"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                  }`}
                >
                  <div
                    className={`w-12 h-6 border-2 border-slate-400 bg-slate-800 ${r.radiusClass}`}
                  />
                  <span className="text-xs font-bold text-slate-200">{r.label}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{r.token}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Layout Spacing Density */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Layout className="w-4 h-4 text-emerald-400" />
              <span>Layout Spacing Density</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "compact", label: "Compact", desc: "Data Dense" },
                { id: "classic", label: "Classic", desc: "Standard" },
                { id: "spacious", label: "Spacious", desc: "Luxury" },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleUpdate("layoutDensity", d.id as any)}
                  className={`p-3.5 rounded-xl border text-center transition ${
                    draft.layoutDensity === d.id
                      ? "border-amber-400 bg-slate-800 ring-2 ring-amber-400/20"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                  }`}
                >
                  <span className="text-xs font-bold text-white block">{d.label}</span>
                  <span className="text-[10px] text-slate-400">{d.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Background & Hero Imagery */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>Hero Background Wallpaper</span>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={draft.backgroundImageUrl || ""}
                onChange={(e) => handleUpdate("backgroundImageUrl", e.target.value)}
                placeholder="/images/hero-workshop-bg.jpg"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { label: "Workshop", url: "/images/hero-workshop-bg.jpg" },
                  {
                    label: "Luxury Showroom",
                    url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1920&q=80",
                  },
                  {
                    label: "Coastal Highway",
                    url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1920&q=80",
                  },
                ].map((bg) => (
                  <button
                    key={bg.label}
                    type="button"
                    onClick={() => handleUpdate("backgroundImageUrl", bg.url)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300"
                  >
                    {bg.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Economic Rates in TZS */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Operational Rates (TZS)</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Delivery / km
                </label>
                <input
                  type="number"
                  step="500"
                  value={draft.deliveryRatePerKm ?? 3500}
                  onChange={(e) =>
                    handleUpdate("deliveryRatePerKm", parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Chauffeur / day
                </label>
                <input
                  type="number"
                  step="5000"
                  value={draft.driverDailyRate ?? 50000}
                  onChange={(e) =>
                    handleUpdate("driverDailyRate", parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  72h Hold Fee
                </label>
                <input
                  type="number"
                  step="50000"
                  value={draft.saleReservationFee ?? 1300000}
                  onChange={(e) =>
                    handleUpdate("saleReservationFee", parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* 6. Page Modules & Reviews */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Page Modules & Reviews</span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  Display Customer Reviews
                </span>
                <span className="text-[11px] text-slate-400">
                  Show verified feedback ribbon on catalog views.
                </span>
              </div>
              <input
                type="checkbox"
                checked={draft.showTestimonials}
                onChange={(e) => handleUpdate("showTestimonials", e.target.checked)}
                className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Canvas Preview (lg:col-span-7) */}
        <div className="lg:col-span-7 sticky top-8">
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between px-3 pb-3 border-b border-slate-800 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5 text-white">
                <Eye className="w-4 h-4 text-amber-400" /> Live Interactive Preview
              </span>
              <span className="text-[10px] uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded-full font-mono text-amber-400">
                Accent: {draft.themeAccent.toUpperCase()} &bull; Geometry: {draft.cornerRadius}
              </span>
            </div>

            {/* Simulated Live Viewport Frame */}
            <div
              className={`mt-4 bg-slate-950 border border-slate-800/80 overflow-hidden transition-all duration-300 ${
                draft.cornerRadius === "sharp"
                  ? "rounded-none"
                  : draft.cornerRadius === "pill"
                  ? "rounded-3xl"
                  : "rounded-2xl"
              } ${
                draft.layoutDensity === "compact"
                  ? "p-4 space-y-3"
                  : draft.layoutDensity === "spacious"
                  ? "p-8 space-y-6"
                  : "p-6 space-y-4"
              }`}
            >
              {/* Fleet Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 flex items-center justify-center transition-all shadow-md"
                    style={{
                      backgroundColor: "var(--app-primary)",
                      borderRadius: "var(--app-radius)",
                    }}
                  >
                    <Car className="w-4 h-4 text-slate-950" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      DriverConnect Fleet Card
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      Previewing live CSS variables & geometry
                    </span>
                  </div>
                </div>
                <span
                  className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all"
                  style={{
                    backgroundColor: "var(--app-primary-light)",
                    color: "var(--app-primary)",
                    borderRadius: "var(--app-radius)",
                  }}
                >
                  TZS Verified
                </span>
              </div>

              {/* Vehicle Preview Display */}
              <div
                className="w-full h-44 bg-slate-900 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden transition-all group"
                style={{ borderRadius: "var(--app-radius)" }}
              >
                <img
                  src="/images/flow-motion-car.webp"
                  alt="Vehicle Preview"
                  className="w-64 h-auto object-contain drop-shadow-2xl z-10"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <span className="text-xs font-bold text-slate-200 relative z-10 mt-1">
                  Toyota Land Cruiser Prado TX
                </span>
              </div>

              {/* Rate & Chauffeur Specification */}
              <div className="flex justify-between items-center pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    Daily Rate:
                  </span>
                  <span
                    className="text-lg font-black transition-colors"
                    style={{ color: "var(--app-primary)" }}
                  >
                    TZS 350,000
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>With Chauffeur (+TZS {draft.driverDailyRate?.toLocaleString() || "50,000"})</span>
                </div>
              </div>

              {/* Call-to-action Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  className="w-full py-2.5 text-xs font-extrabold text-slate-950 transition-all shadow-md active:scale-95"
                  style={{
                    backgroundColor: "var(--app-primary)",
                    borderRadius: "var(--app-radius)",
                  }}
                >
                  Book Rental Now
                </button>
                <button
                  type="button"
                  className="w-full py-2.5 text-xs font-bold bg-slate-900 border border-slate-700 text-slate-200 hover:text-white transition-all active:scale-95"
                  style={{ borderRadius: "var(--app-radius)" }}
                >
                  View Details
                </button>
              </div>

              {/* Optional Testimonial Review Module */}
              {draft.showTestimonials && (
                <div
                  className="p-3 bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2.5 transition-all mt-4"
                  style={{ borderRadius: "var(--app-radius)" }}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">
                      &quot;Flawless pickup in Dar es Salaam.&quot;
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      &bull; Verified Rental Booking
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
