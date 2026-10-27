"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mic, ArrowRight, ShieldCheck, Car, ShoppingBag, Wrench } from "lucide-react";
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
    <section className="relative w-full bg-slate-950 overflow-hidden pt-8 pb-10 sm:pb-14 flex flex-col items-center border-b border-slate-800">
      
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
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer"
          >
            <Mic className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Speak with Ava</span>
          </button>
        </div>
      </div>

      {/* 3. Showcase Vehicle Canvas (Centered High-Res Luxury Vehicle) */}
      <div className="relative z-20 mt-8 w-full max-w-4xl px-4 flex justify-center">
        <div className="relative w-full max-w-2xl h-56 sm:h-72 md:h-80 rounded-3xl overflow-hidden bg-slate-900/60 border border-slate-800 shadow-2xl flex items-center justify-center group">
          <Image
            src="/images/cars/toyota-prado.webp"
            alt="Toyota Land Cruiser Prado TX-L"
            fill
            priority
            unoptimized
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          {/* Subtle vignette shadow gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute bottom-3 left-4 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-black text-amber-400 border border-slate-800 shadow-lg">
            Toyota Land Cruiser Prado TX &bull; TZS 350,000 / day
          </div>
        </div>
      </div>

      {/* 4. The Road Surface with Animated Dashed Dividers */}
      <div className="relative w-full h-12 bg-slate-900/90 border-y border-slate-800 mt-6 flex items-center overflow-hidden">
        {/* Animated Dashed Road Stripe */}
        <motion.div
          className="flex gap-8 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 8 }}
        >
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="w-12 h-1 bg-amber-400/70 rounded-full flex-shrink-0" />
          ))}
        </motion.div>
      </div>

      {/* 5. Animated Floating Metric Cards (Infinite Stream directly below the road) */}
      <div className="w-full mt-2">
        <FloatingCardsTicker />
      </div>

    </section>
  );
}

export default FlowMotionHero;
