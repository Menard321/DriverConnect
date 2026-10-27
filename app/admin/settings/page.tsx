'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sliders, Sparkles, Check, ShieldCheck, DollarSign, Volume2 } from 'lucide-react';
import { PLATFORM_CONSTANTS, formatTZS } from '@/lib/formatters';

export default function AdminSettingsPage() {
  const [rentalsEnabled, setRentalsEnabled] = useState(true);
  const [salesEnabled, setSalesEnabled] = useState(true);
  const [repairsEnabled, setRepairsEnabled] = useState(true);

  // Rate adjustments in TZS
  const [deliveryFeePerKm, setDeliveryFeePerKm] = useState(PLATFORM_CONSTANTS.DELIVERY_FEE_PER_KM);
  const [driverDailyRate, setDriverDailyRate] = useState(PLATFORM_CONSTANTS.DRIVER_DAILY_RATE);
  const [salesHoldAmount, setSalesHoldAmount] = useState(PLATFORM_CONSTANTS.SALES_HOLD_AMOUNT);

  // Ava Voice Concierge Persona & Prompt settings
  const [voicePersona, setVoicePersona] = useState('alloy');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are "Ava", the elite autonomous voice concierge for DriverConnect in Tanzania (Dar es Salaam & Arusha). Quote in Tanzanian Shillings (TZS) and USD ($1 USD ≈ 2,650 TZS). USD payments are settled via Bank Wire Transfer.'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-border pb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-black text-foreground">Platform Policies & Rates (TZS)</h1>
        <p className="text-xs text-muted-foreground">
          Configure active commercial verticals, standard Tanzanian rates, and Ava AI voice settings.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" /> Policy and pricing settings updated across all nodes.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Commercial Verticals Switches */}
        <div className="p-6 rounded-3xl bg-card border border-border shadow-xl space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            1. Commercial Vertical Killswitches
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border">
              <div>
                <div className="text-xs font-bold text-foreground">Car Rentals Vertical</div>
                <div className="text-[11px] text-muted-foreground">Self-drive & chauffeur rentals</div>
              </div>
              <input
                type="checkbox"
                checked={rentalsEnabled}
                onChange={(e) => setRentalsEnabled(e.target.checked)}
                className="w-5 h-5 rounded accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border">
              <div>
                <div className="text-xs font-bold text-foreground">Vehicle Sales & Marketplace Vertical</div>
                <div className="text-[11px] text-muted-foreground">Showroom test-drives & 72-hr holds</div>
              </div>
              <input
                type="checkbox"
                checked={salesEnabled}
                onChange={(e) => setSalesEnabled(e.target.checked)}
                className="w-5 h-5 rounded accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border">
              <div>
                <div className="text-xs font-bold text-foreground">Workshop Diagnostics & Repairs Vertical</div>
                <div className="text-[11px] text-muted-foreground">Service bays and mechanical checklist</div>
              </div>
              <input
                type="checkbox"
                checked={repairsEnabled}
                onChange={(e) => setRepairsEnabled(e.target.checked)}
                className="w-5 h-5 rounded accent-primary cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Global Standard Rates in TZS */}
        <div className="p-6 rounded-3xl bg-card border border-border shadow-xl space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            2. Platform Rates & Surcharges (Tanzanian Shillings)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                Doorstep Delivery (TZS/km)
              </label>
              <input
                type="number"
                step="500"
                value={deliveryFeePerKm}
                onChange={(e) => setDeliveryFeePerKm(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-bold focus:outline-none focus:border-primary"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">Current: {formatTZS(deliveryFeePerKm)}/km</span>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                Driver Day Wage (TZS/day)
              </label>
              <input
                type="number"
                step="5000"
                value={driverDailyRate}
                onChange={(e) => setDriverDailyRate(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-bold focus:outline-none focus:border-primary"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">Current: {formatTZS(driverDailyRate)}/day</span>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                Sales 72-hr Hold (TZS)
              </label>
              <input
                type="number"
                step="50000"
                value={salesHoldAmount}
                onChange={(e) => setSalesHoldAmount(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-bold focus:outline-none focus:border-primary"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">Current: {formatTZS(salesHoldAmount)}</span>
            </div>
          </div>
        </div>

        {/* Ava Voice AI Settings */}
        <div className="p-6 rounded-3xl bg-card border border-border shadow-xl space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-primary" />
            3. Autonomous Voice Concierge ("Ava") Configuration
          </h2>
          <div>
            <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
              Voice Persona
            </label>
            <select
              value={voicePersona}
              onChange={(e) => setVoicePersona(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-semibold focus:outline-none focus:border-primary"
            >
              <option value="alloy">Alloy (Balanced, Professional)</option>
              <option value="shimmer">Shimmer (Warm, Welcoming)</option>
              <option value="echo">Echo (Authoritative, Clear)</option>
              <option value="coral">Coral (Polite, Refined)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
              System Instructions & Swahili Tone
            </label>
            <textarea
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-mono leading-relaxed focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary-hover text-primary-foreground font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> Save Platform & Pricing Rules
        </button>
      </form>
    </div>
  );
}
