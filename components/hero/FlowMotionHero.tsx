"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mic, ArrowRight, ShieldCheck, Car, ShoppingBag, Wrench } from "lucide-react";
import HeroQuickBooking from "./HeroQuickBooking";
import FloatingCardsTicker from "./FloatingCardsTicker";

export interface FlowMotionHeroProps {
  accentColor?: string;
  backgroundImageUrl?: string;
  activeVertical?: "rent" | "buy" | "repair";
  onSelectVertical?: (vertical: "rent" | "buy" | "repair") => void;
}

export function FlowMotionHero({
  accentColor = "#e0533c",
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
    <section className="relative w-full bg-[#f8f9fa] overflow-hidden pt-8 pb-6 sm:pb-10 flex flex-col items-center border-b border-gray-200 transition-colors">
      
      {/* 1. Ambient Background Lighting & Warm Neutral Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-5 pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#f8f9fa]/80 via-[#f8f9fa]/95 to-[#f8f9fa] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#e0533c]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* 2. Headline & Overview Content */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 text-center space-y-4">
        
        {/* Hub Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fbf5f2] border border-[#f0ded8] text-[#e0533c] text-xs font-bold uppercase tracking-wider shadow-sm">
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
                      ? "bg-[#e0533c] text-white shadow-md shadow-[#e0533c]/25"
                      : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200 shadow-sm"
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

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight">
          Drive, Buy, or Service with <br className="hidden sm:inline" />
          <span className="text-[#e0533c]">Total Transparency</span>
        </h1>

        <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Accredited chauffeurs, TRA-verified sales with 72-hour holds, and certified workshop bay care. All settled friction-free in Tanzanian Shillings (TZS).
        </p>

        {/* Quick CTA Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <Link
            href="/rent"
            className="px-6 py-2.5 rounded-xl bg-[#e0533c] hover:bg-[#d04631] text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-[#e0533c]/25 flex items-center gap-2 cursor-pointer"
          >
            <span>Explore Fleet</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={handleTriggerVoice}
            className="px-6 py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Mic className="w-4 h-4 text-[#e0533c] animate-pulse" />
            <span>Speak with Ava</span>
          </button>
        </div>
      </div>

      {/* 3. Inline Hero Quick-Booking Bar (Directly Above the Road Divider) */}
      <div className="relative z-20 w-full mt-2">
        <HeroQuickBooking />
      </div>

      {/* 4. Animated Road Divider Canvas Positioned Beneath Quick-Booking Controls */}
      <div className="relative w-full h-32 sm:h-38 mt-2 overflow-hidden flex items-end">
        {/* Road Surface & Endless Animated Highway Markers */}
        <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-gray-950 via-slate-900 to-slate-850 border-t border-slate-700/80 shadow-md">
          <div className="relative w-full h-full flex items-center overflow-hidden">
            <motion.div
              className="flex gap-16 whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
            >
              {Array.from({ length: 24 }).map((_, idx) => (
                <div
                  key={idx}
                  className="w-12 h-1 bg-amber-400/70 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                />
              ))}
            </motion.div>
          </div>
        </div>

        {/* Dynamic Moving Car Fleet Loop Across the Road */}
        <motion.div
          className="absolute bottom-2 z-20 flex items-center pointer-events-none"
          initial={{ x: "-120%" }}
          animate={{ x: "125vw" }}
          transition={{ repeat: Infinity, duration: 11, ease: "linear" }}
        >
          <div className="relative group">
            <img
              src="/images/flow-motion-car.webp"
              alt="DriverConnect Moving Fleet"
              className="w-64 sm:w-80 md:w-[380px] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.7)]"
            />
            {/* Aerodynamic Speed Streak */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-16 bg-gradient-to-r from-[#e0533c]/20 via-amber-100/10 to-transparent blur-lg rounded-full pointer-events-none transform translate-x-28" />
          </div>
        </motion.div>
      </div>

      {/* 5. Animated Floating Metric Cards (Infinite Stream directly below the road) */}
      <div className="w-full mt-3">
        <FloatingCardsTicker />
      </div>

    </section>
  );
}

export default FlowMotionHero;
