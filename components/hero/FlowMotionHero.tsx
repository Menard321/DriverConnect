"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  Car,
  Wrench,
  Tag,
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export interface FlowMotionHeroProps {
  backgroundImageUrl?: string;
  accentColor?: "amber" | "emerald" | "blue" | "rose";
  activeVertical?: "rent" | "buy" | "repair";
  onSelectVertical?: (vertical: "rent" | "buy" | "repair") => void;
}

export function FlowMotionHero({
  backgroundImageUrl,
  accentColor,
  activeVertical = "rent",
  onSelectVertical,
}: FlowMotionHeroProps) {
  const { appearance } = useTheme();

  const activeAccent = accentColor || appearance.themeAccent || "amber";
  const activeBg =
    backgroundImageUrl ||
    appearance.backgroundImageUrl ||
    "/images/hero-workshop-bg.jpg";

  const colorStyles = {
    amber: {
      badge: "bg-amber-400/10 text-amber-400 border-amber-400/20",
      accentText: "text-amber-400",
      primaryBtn: "bg-amber-400 hover:bg-amber-300 text-slate-950",
      glow: "from-amber-500/20",
      tabActive: "bg-amber-400 text-slate-950 shadow-amber-400/25",
    },
    emerald: {
      badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
      accentText: "text-emerald-400",
      primaryBtn: "bg-emerald-400 hover:bg-emerald-300 text-slate-950",
      glow: "from-emerald-500/20",
      tabActive: "bg-emerald-400 text-slate-950 shadow-emerald-400/25",
    },
    blue: {
      badge: "bg-blue-400/10 text-blue-400 border-blue-400/20",
      accentText: "text-blue-400",
      primaryBtn: "bg-blue-500 hover:bg-blue-400 text-white",
      glow: "from-blue-500/20",
      tabActive: "bg-blue-500 text-white shadow-blue-500/25",
    },
    rose: {
      badge: "bg-rose-400/10 text-rose-400 border-rose-400/20",
      accentText: "text-rose-400",
      primaryBtn: "bg-rose-500 hover:bg-rose-400 text-white",
      glow: "from-rose-500/20",
      tabActive: "bg-rose-500 text-white shadow-rose-500/25",
    },
  }[activeAccent] || {
    badge: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    accentText: "text-amber-400",
    primaryBtn: "bg-amber-400 hover:bg-amber-300 text-slate-950",
    glow: "from-amber-500/20",
    tabActive: "bg-amber-400 text-slate-950 shadow-amber-400/25",
  };

  const handleTriggerVoice = () => {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("trigger-voice-concierge");
      window.dispatchEvent(event);
    }
  };

  return (
    <section className="relative w-full min-h-[580px] lg:min-h-[640px] bg-slate-950 overflow-hidden flex flex-col justify-between border-b border-slate-800 select-none">
      {/* Background Layer with Dark Gradient Masks */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 opacity-20 scale-105"
        style={{ backgroundImage: `url(${activeBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
      <div
        className={`absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b ${colorStyles.glow} to-transparent blur-3xl pointer-events-none rounded-full opacity-60`}
      />

      {/* Main Hero Header & Copy */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 w-full">
        <div className="max-w-3xl space-y-5">
          {/* Top Hub Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider backdrop-blur-md ${colorStyles.badge}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tanzania Premier Automotive Hub &bull; TZS</span>
          </motion.div>

          {/* Vertical Quick Selector Tabs (Optional interactive switcher) */}
          {onSelectVertical && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md gap-1"
            >
              <button
                type="button"
                onClick={() => onSelectVertical("rent")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                  activeVertical === "rent"
                    ? colorStyles.tabActive + " shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Rentals</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectVertical("buy")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                  activeVertical === "buy"
                    ? colorStyles.tabActive + " shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Sales Showroom</span>
              </button>
              <Link
                href="/repair"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider text-slate-400 hover:text-white transition-all"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Workshop</span>
              </Link>
            </motion.div>
          )}

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]"
          >
            Rent, Purchase & Service Vehicles{" "}
            <span className={colorStyles.accentText}>At Lightning Speed.</span>
          </motion.h1>

          {/* Subheading / Value Proposition */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-sm sm:text-base text-slate-300 max-w-2xl font-normal leading-relaxed"
          >
            Experience instant luxury rentals with dedicated drivers, verified
            sales featuring 72-hour holds, and certified mechanical care across
            Dar es Salaam, Arusha, and Dodoma. Speak directly with{" "}
            <strong className="text-white">Ava</strong> for hands-free instant
            booking.
          </motion.p>

          {/* Call-to-action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <Link
              href="/#inventory-grid"
              className={`px-6 py-3.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all duration-200 flex items-center gap-2 group hover:scale-105 shadow-lg ${colorStyles.primaryBtn}`}
            >
              <span>Explore Fleet</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              type="button"
              onClick={handleTriggerVoice}
              className="px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-900/90 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-2 backdrop-blur-md active:scale-95"
            >
              <span>Speak With Ava</span>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            <div className="hidden sm:flex items-center gap-6 pl-4 border-l border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>TRA Verified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>TZS 3,500/km Delivery</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Flow-Motion Highway & Moving Vehicle Simulation */}
      <div className="relative w-full h-44 sm:h-52 mt-8 overflow-hidden flex items-end">
        {/* Road Surface & Endless Animated Highway Markers */}
        <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-slate-950 via-slate-900 to-transparent border-t border-slate-800/80">
          <div className="relative w-full h-full flex items-center overflow-hidden">
            <motion.div
              className="flex gap-16 whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
            >
              {Array.from({ length: 24 }).map((_, idx) => (
                <div
                  key={idx}
                  className="w-12 h-1 bg-amber-400/40 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.3)]"
                />
              ))}
            </motion.div>
          </div>
        </div>

        {/* Dynamic Moving Car Fleet Loop */}
        <motion.div
          className="absolute bottom-4 z-20 flex items-center pointer-events-none"
          initial={{ x: "-120%" }}
          animate={{ x: "125vw" }}
          transition={{ repeat: Infinity, duration: 11, ease: "linear" }}
        >
          <div className="relative group">
            <img
              src="/images/flow-motion-car.webp"
              alt="DriverConnect Moving Fleet"
              className="w-72 sm:w-88 md:w-[420px] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)]"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = document.getElementById(
                  "hero-fallback-vehicle"
                );
                if (fallback) fallback.style.display = "flex";
              }}
            />
            {/* Fallback Vehicle Badge Card */}
            <div
              id="hero-fallback-vehicle"
              className="hidden flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <Car className="w-10 h-10 text-amber-400 animate-pulse" />
                <div>
                  <span className="text-xs font-extrabold text-white block">
                    Toyota Land Cruiser Prado TX
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">
                    TZS 350,000 / Day &bull; Active Fleet
                  </span>
                </div>
              </div>
            </div>
            {/* Aerodynamic Speed Glow Streak */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-20 bg-gradient-to-r from-amber-300/20 via-amber-100/5 to-transparent blur-lg rounded-full pointer-events-none transform translate-x-32" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default FlowMotionHero;
