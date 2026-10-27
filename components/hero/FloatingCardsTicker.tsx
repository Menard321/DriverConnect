"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Car, ShieldCheck, Clock, Key, Wrench } from "lucide-react";

const TICKER_CARDS = [
  {
    icon: Users,
    iconBg: "bg-amber-400",
    iconColor: "text-slate-950",
    label: "2",
    sublabel: "customers",
  },
  {
    icon: Car,
    iconBg: "bg-blue-500",
    iconColor: "text-white",
    label: "TZS 75k",
    sublabel: "daily rental start",
  },
  {
    icon: ShieldCheck,
    iconBg: "bg-emerald-500",
    iconColor: "text-white",
    label: "TRA Verified",
    sublabel: "clear tax & title",
  },
  {
    icon: Key,
    iconBg: "bg-amber-400",
    iconColor: "text-slate-950",
    label: "Class C",
    sublabel: "chauffeur available",
  },
  {
    icon: Clock,
    iconBg: "bg-purple-500",
    iconColor: "text-white",
    label: "72-Hr Hold",
    sublabel: "lock showroom unit",
  },
  {
    icon: Wrench,
    iconBg: "bg-emerald-400",
    iconColor: "text-slate-950",
    label: "TZS 50,000",
    sublabel: "OBD diagnostics",
  },
];

export function FloatingCardsTicker() {
  // Duplicate array so it creates an infinite loop with zero visual stutter
  const duplicatedCards = [...TICKER_CARDS, ...TICKER_CARDS];

  return (
    <div className="relative w-full overflow-hidden py-3 select-none">
      {/* Edge gradient masks for seamless fade out on the sides */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

      {/* Continuously translating conveyor belt */}
      <motion.div
        className="flex gap-4 w-max items-center"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 22, // adjust speed as needed
        }}
      >
        {duplicatedCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white shadow-xl border border-slate-200/80 transition-transform hover:scale-105 cursor-pointer flex-shrink-0"
            >
              {/* Rounded Icon Capsule (matches your second image) */}
              <div
                className={`w-9 h-9 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center shadow-md flex-shrink-0`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Text Meta */}
              <div className="flex flex-col text-left">
                <span className="text-sm font-black text-slate-950 leading-tight">
                  {card.label}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 leading-tight">
                  {card.sublabel}
                </span>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

export default FloatingCardsTicker;
