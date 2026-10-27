"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  CreditCard,
  Key,
  ShieldCheck,
  Zap,
  Navigation,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Smartphone,
  Building2,
  Clock,
  MapPin,
  FileText,
  UserCheck,
} from "lucide-react";

interface StepDetail {
  id: number;
  stepNumber: string;
  badge: string;
  title: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  accent: string;
  accentBg: string;
  accentBorder: string;
  features: string[];
  mockData: {
    title: string;
    subtitle: string;
    metrics: { label: string; value: string }[];
    statusBadge: string;
  };
}

const STEPS: StepDetail[] = [
  {
    id: 1,
    stepNumber: "01",
    badge: "Fleet Discovery & Temporal Lock",
    title: "Select Vehicle & Travel Route",
    tagline: "PostgreSQL GiST Temporal Booking Protection",
    description:
      "Explore vetted safari 4x4s, executive VIP sedans, or economy city cars across Dar es Salaam, Arusha, Dodoma, or Zanzibar. Lock your exact dates with zero risk of double booking.",
    icon: Car,
    accent: "text-amber-400",
    accentBg: "bg-amber-400/10",
    accentBorder: "border-amber-400/30",
    features: [
      "Real-time GiST database locks prevent double booking",
      "Optional licensed professional chauffeur (+TZS 50,000/day)",
      "Multi-city pickup & drop-off desks (Central & Safari hubs)",
    ],
    mockData: {
      title: "Toyota Land Cruiser Prado TX (2022)",
      subtitle: "T 884 DWL • Dar es Salaam & Arusha Hub",
      metrics: [
        { label: "Daily Rate", value: "TZS 350,000" },
        { label: "Transmission", value: "Automatic 4WD" },
        { label: "Chauffeur", value: "Included (+50k)" },
      ],
      statusBadge: "Temporal Lock Active",
    },
  },
  {
    id: 2,
    stepNumber: "02",
    badge: "Dual Settlement Rails (TZS & USD)",
    title: "Instant Dual-Currency Checkout",
    tagline: "Mobile Money STK Push or Corporate USD Bank Wire",
    description:
      "Pay securely in Tanzanian Shillings via Vodacom M-Pesa, Tigo Pesa, Airtel Money, TIPS or Card, or settle in USD via corporate Bank Wire Transfer with instant automated reference reconciliation.",
    icon: CreditCard,
    accent: "text-emerald-400",
    accentBg: "bg-emerald-400/10",
    accentBorder: "border-emerald-400/30",
    features: [
      "TZS: Instant USSD STK prompt directly to your mobile phone",
      "USD: Corporate Nostro Bank Wire (CRDB, NMB, Stanbic)",
      "Instant PDF tax invoice dispatched to email & WhatsApp",
    ],
    mockData: {
      title: "Multi-Rail Payment Reconciled",
      subtitle: "Order #DC-920418 • 256-Bit Encrypted SSL",
      metrics: [
        { label: "Settlement", value: "TZS 350,000 / $132 USD" },
        { label: "Channel", value: "M-Pesa STK / USD Wire" },
        { label: "Ledger Audit", value: "Verified Instant" },
      ],
      statusBadge: "100% Refund Protected",
    },
  },
  {
    id: 3,
    stepNumber: "03",
    badge: "Doorstep Delivery & Digital Handover",
    title: "Direct Delivery & Key Handover",
    tagline: "GPS Dispatch to Doorstep, Airport or Safari Lodge",
    description:
      "Your sanitized vehicle is delivered directly to your doorstep or airport terminal (TZS 3,500/km). Complete the 150-point mobile inspection, receive keys, and drive with 24/7 concierge support.",
    icon: Key,
    accent: "text-blue-400",
    accentBg: "bg-blue-400/10",
    accentBorder: "border-blue-400/30",
    features: [
      "GPS live vehicle dispatch tracking right to your location pin",
      "Digital mobile inspection checklist before key handover",
      "24/7 autonomous emergency support with Ava Voice Concierge",
    ],
    mockData: {
      title: "Vehicle Dispatched & En Route",
      subtitle: "Driver: Juma Mwangi (Badge #DC-701)",
      metrics: [
        { label: "Dispatch Fee", value: "TZS 3,500 / km" },
        { label: "ETA to Pin", value: "18 Minutes" },
        { label: "Inspection", value: "150-Point Pass" },
      ],
      statusBadge: "Digital Key Ready",
    },
  },
];

export function HowItWorksSection() {
  const [activeStepId, setActiveStepId] = useState<number>(1);
  const activeStep = STEPS.find((s) => s.id === activeStepId) || STEPS[0];

  const handleTriggerVoice = () => {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("trigger-voice-concierge");
      window.dispatchEvent(event);
    }
  };

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Streamlined Platform Workflow</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          How DriverConnect Works in <span className="text-amber-400">3 Simple Steps</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto">
          From real-time temporal fleet locking to doorstep vehicle delivery across Dar es Salaam, Arusha, Dodoma, and Zanzibar.
        </p>
      </div>

      {/* 3 Step Interactive Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {STEPS.map((step) => {
          const StepIcon = step.icon;
          const isActive = activeStepId === step.id;

          return (
            <div
              key={step.id}
              onClick={() => setActiveStepId(step.id)}
              className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? "bg-slate-900 border-amber-400 ring-2 ring-amber-400/20 shadow-xl shadow-amber-400/10"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
              }`}
            >
              {/* Step Top Bar */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-2xl font-black font-mono ${isActive ? "text-amber-400" : "text-slate-600"}`}>
                  {step.stepNumber}
                </span>
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                    isActive ? `${step.accentBg} ${step.accent}` : "bg-slate-800 text-slate-400"
                  }`}
                >
                  <StepIcon className="w-5 h-5" />
                </div>
              </div>

              {/* Step Content */}
              <div className="space-y-1.5 mb-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  {step.badge}
                </span>
                <h3 className={`text-base font-bold transition-colors ${isActive ? "text-white" : "text-slate-300"}`}>
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Active Indicator Bar */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className={`font-semibold ${isActive ? step.accent : "text-slate-500"}`}>
                  {isActive ? "Viewing Step Details" : "Click to Explore"}
                </span>
                <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isActive ? "translate-x-1 text-amber-400" : "text-slate-600"}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep-Dive Interactive Step Walkthrough Pane */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Detailed Walkthrough Specs */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-[11px] font-bold text-slate-300">
                <span className="text-amber-400 font-mono">Step {activeStep.stepNumber} of 03</span>
                <span>&bull;</span>
                <span>{activeStep.tagline}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {activeStep.title}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                {activeStep.description}
              </p>

              {/* Checklist items */}
              <div className="space-y-2.5 pt-2">
                {activeStep.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm text-slate-200 font-medium">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <Link
                  href="/rent"
                  className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-400/20 flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Available Fleet</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={handleTriggerVoice}
                  className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer border border-slate-700"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Ask Ava Voice Concierge</span>
                </button>
              </div>
            </div>

            {/* Right: Live Realistic Simulator Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl relative overflow-hidden">
                {/* Simulator Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                      Live Telemetry Preview
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    {activeStep.mockData.statusBadge}
                  </span>
                </div>

                {/* Simulated Data Title */}
                <div>
                  <h4 className="text-base font-bold text-white">
                    {activeStep.mockData.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeStep.mockData.subtitle}
                  </p>
                </div>

                {/* 3 Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-center">
                  {activeStep.mockData.metrics.map((m, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        {m.label}
                      </span>
                      <span className="text-xs font-black text-amber-400 font-mono block">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Micro Visual Simulation based on step */}
                {activeStep.id === 1 && (
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <UserCheck className="w-4 h-4 text-amber-400" />
                      <span>Dedicated Driver Option</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">+TZS 50,000/day</span>
                  </div>
                )}

                {activeStep.id === 2 && (
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <span>USD Wire &amp; M-Pesa STK</span>
                    </div>
                    <span className="font-mono text-amber-400 font-bold">100% Zero-Wait Reconciled</span>
                  </div>
                )}

                {activeStep.id === 3 && (
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span>Doorstep Dispatch Fee</span>
                    </div>
                    <span className="font-mono text-blue-400 font-bold">TZS 3,500 / km</span>
                  </div>
                )}

                <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400/80" />
                  <span>DriverConnect Automated Guarantee &bull; Dar es Salaam &bull; Arusha</span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

export default HowItWorksSection;
