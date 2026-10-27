"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mic, ArrowRight, ShieldCheck, Car, ShoppingBag, Wrench, Sparkles } from "lucide-react";
import FloatingCardsTicker from "./FloatingCardsTicker";

export interface FlowMotionHeroProps {
  accentColor?: string;
  backgroundImageUrl?: string;
  activeVertical?: "rent" | "buy" | "repair";
  onSelectVertical?: (vertical: "rent" | "buy" | "repair") => void;
}

export function FlowMotionHero({
  accentColor = "amber",
  backgroundImageUrl = "/images/hero-workshop-bg.jpg",
  activeVertical = "rent",
  onSelectVertical,
}: FlowMotionHeroProps) {
  const handleTriggerVoice = () => {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("trigger-voice-concierge");
      window.dispatchEvent(event);
    }
  };

  return (
    <section className="relative w-full bg-slate-950 overflow-hidden pt-8 pb-8 sm:pb-12 flex flex-col items-center border-b border-slate-800">
      
      {/* 1. Ambient Background Lighting & Image Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none transition-all duration-700 scale-105"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/95 to-slate-950 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 2. Headline Content */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 text-center space-y-4">
        
        {/* Hub Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-bold uppercase tracking-wider shadow-inner">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Tanzania&apos;s Premier Automotive Ecosystem</span>
        </div>

        {/* Vertical Switcher Tabs */}
        {onSelectVertical && (
          <div className="flex items-center justify-center gap-2 pt-1">
            {[
              { id: "rent", label: "Self-Drive & Safari Rentals", icon: Car },
              { id: "buy", label: "Verified Cars For Sale", icon: ShoppingBag },
              { id: "repair", label: "Diagnostic Garage Bays", icon: Wrench },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeVertical === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectVertical(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                      : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.id.toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        )}

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
          Drive, Buy, or Service with <br className="hidden sm:inline" />
          <span className="text-amber-400">Total Transparency</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Accredited chauffeurs, TRA-verified sales with 72-hour holds, and certified workshop bay care. All settled friction-free in Tanzanian Shillings (TZS).
        </p>

        {/* Call to Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/rent"
            className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-400/20 flex items-center gap-2 cursor-pointer"
          >
            <span>Explore Fleet</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={handleTriggerVoice}
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer"
          >
            <Mic className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Speak with Ava</span>
          </button>
        </div>
      </div>

      {/* 3. Flow-Motion Highway & Moving Vehicle Animation */}
      <div className="relative w-full h-36 sm:h-44 mt-6 overflow-hidden flex items-end">
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

        {/* Dynamic Moving Car Fleet Loop Across the Road */}
        <motion.div
          className="absolute bottom-3 z-20 flex items-center pointer-events-none"
          initial={{ x: "-120%" }}
          animate={{ x: "125vw" }}
          transition={{ repeat: Infinity, duration: 11, ease: "linear" }}
        >
          <div className="relative group">
            <img
              src="/images/flow-motion-car.webp"
              alt="DriverConnect Moving Fleet"
              className="w-64 sm:w-80 md:w-[380px] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)]"
            />
            {/* Aerodynamic Speed Glow Streak */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-16 bg-gradient-to-r from-amber-300/20 via-amber-100/5 to-transparent blur-lg rounded-full pointer-events-none transform translate-x-28" />
          </div>
        </motion.div>
      </div>

      {/* 4. Animated Floating Metric Cards (Infinite Stream directly below the road) */}
      <div className="w-full mt-3">
        <FloatingCardsTicker />
      </div>

    </section>
  );
}

export default FlowMotionHero;
