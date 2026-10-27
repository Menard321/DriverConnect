"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, Wrench, Mic, ArrowRight } from "lucide-react";

export function HeroQuickBooking() {
  const router = useRouter();
  const [service, setService] = useState("oil-change");
  const [preferredDate, setPreferredDate] = useState("");

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/repair?service=${service}&date=${preferredDate}`);
  };

  const handleTriggerVoice = () => {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("trigger-voice-concierge");
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Quick Booking Form */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
          
          {/* Service Dropdown */}
          <div className="w-full sm:w-1/2">
            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
              Service
            </span>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full text-xs font-bold text-gray-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="oil-change">Oil &amp; Filter Change - TZS 85,000</option>
              <option value="diagnostics">Computerized Diagnostics - TZS 50,000</option>
              <option value="brake-overhaul">Brake Pad Overhaul - TZS 120,000</option>
              <option value="full-inspection">150-Point Roadworthy Check - TZS 70,000</option>
            </select>
          </div>

          <div className="hidden sm:block w-px h-8 bg-gray-200" />

          {/* Date Picker */}
          <div className="w-full sm:w-1/3">
            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
              Preferred day
            </span>
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full text-xs font-bold text-gray-800 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleBooking}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#e0533c] hover:bg-[#d04631] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-sm whitespace-nowrap cursor-pointer"
          >
            <span>Book now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Feature Badges */}
        <div className="flex items-center gap-3">
          <div className="flex-1 sm:flex-initial flex items-center gap-2.5 px-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 flex-shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-900 block leading-tight">
                Delivered to your door
              </span>
            </div>
          </div>

          <div className="flex-1 sm:flex-initial flex items-center gap-2.5 px-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-[#e0533c] flex-shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-900 block leading-tight">
                Expert mechanics
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Voice Prompt */}
      <div className="flex items-center gap-2 text-xs text-gray-600 pl-1">
        <Mic className="w-3.5 h-3.5 text-[#e0533c]" />
        <span>
          Or tap{" "}
          <button
            type="button"
            onClick={handleTriggerVoice}
            className="font-bold text-gray-900 underline decoration-[#e0533c] underline-offset-2 hover:text-[#e0533c] transition cursor-pointer"
          >
            Talk to us
          </button>{" "}
          and book by voice
        </span>
      </div>
    </div>
  );
}

export default HeroQuickBooking;
