'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Car,
  Wrench,
  PhoneCall,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Users,
  Settings,
  ArrowUpRight,
  Sparkles,
  Route,
} from 'lucide-react';
import { formatTZS } from '@/lib/formatters';

export default function AdminDashboardPage() {
  const metrics = {
    dailyGrossVolumeTZS: 8750000,
    fleetUtilizationPercent: 78,
    activeRepairBays: 5,
    totalVoiceCalls: 42,
  };

  const recentPickups = [
    {
      id: 'DC-BKG-881204',
      vehicle: 'Toyota Land Cruiser Prado TX-L',
      plate: 'T 782 EBC',
      customer: 'David Mrema',
      time: 'Today, 10:30 AM',
      type: 'Rental Pickup',
      status: 'Confirmed',
    },
    {
      id: 'DC-BKG-992143',
      vehicle: 'Toyota Harrier Elegance',
      plate: 'T 419 DWL',
      customer: 'Amina Salum',
      time: 'Today, 02:00 PM',
      type: 'Doorstep Delivery',
      status: 'En Route',
    },
    {
      id: 'DC-REP-390142',
      vehicle: 'Toyota Hilux Revo',
      plate: 'T 144 EDZ',
      customer: 'Safari Expeditions Ltd',
      time: 'Tomorrow, 09:00 AM',
      type: 'Bay 3: Diagnostics',
      status: 'Scheduled',
    },
  ];

  const recentVoiceLogs = [
    {
      id: 'V-102',
      time: '12 mins ago',
      caller: 'Customer (+255 754 *** 321)',
      query: 'Inquired for Prado TX weekly rate and chauffeur cost in TZS',
      outcome: 'Tool calculate_rental_quote executed (TZS 2.1M quote generated)',
    },
    {
      id: 'V-101',
      time: '35 mins ago',
      caller: 'Customer (+255 680 *** 990)',
      query: 'Requested SUVs available for rent under TZS 200,000/day',
      outcome: 'Tool display_vehicle_cards filtered 2 matching cars to screen',
    },
    {
      id: 'V-100',
      time: '1 hour ago',
      caller: 'Customer (+255 768 *** 114)',
      query: 'Wanted to schedule synthetic oil service for Toyota IST',
      outcome: 'Directed to Victoria Service Center Bay 2',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Admin Nav Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Executive Operational Control Plane
          </div>
          <h1 className="text-3xl font-black text-foreground">DriverConnect Operations</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Realtime metrics, fleet utilization, and voice inbound logs across Tanzania.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/vehicles"
            className="py-2.5 px-4 rounded-xl bg-secondary hover:bg-muted text-foreground text-xs font-bold transition-colors"
          >
            Fleet & Approvals
          </Link>
          <Link
            href="/admin/tracking"
            className="py-2.5 px-4 rounded-xl bg-secondary hover:bg-muted text-foreground text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Route className="w-3.5 h-3.5 text-amber-400" />
            GPS Trajectories & Audits
          </Link>
          <Link
            href="/admin/drivers"
            className="py-2.5 px-4 rounded-xl bg-secondary hover:bg-muted text-foreground text-xs font-bold transition-colors"
          >
            Drivers
          </Link>
          <Link
            href="/admin/appearance"
            className="py-2.5 px-4 rounded-xl bg-secondary hover:bg-muted text-foreground text-xs font-bold transition-colors"
          >
            Appearance Studio
          </Link>
          <Link
            href="/admin/settings"
            className="py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold transition-colors shadow-md shadow-primary/20"
          >
            Settings & Rates
          </Link>
        </div>
      </div>

      {/* 4 Core Financial & Utilization Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-card border border-border shadow-xl space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase">Daily Gross Volume (TZS)</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-primary">
            {formatTZS(metrics.dailyGrossVolumeTZS)}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold">+18.4% vs yesterday</span>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-xl space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase">Fleet Utilization</span>
            <Car className="w-4 h-4 text-foreground" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground">
            {metrics.fleetUtilizationPercent}%
          </div>
          <span className="text-[11px] text-muted-foreground">18 of 23 active cars booked</span>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-xl space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase">Active Workshop Bays</span>
            <Wrench className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground">
            {metrics.activeRepairBays} / 6
          </div>
          <span className="text-[11px] text-muted-foreground">Dar es Salaam Main Hub</span>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-xl space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase">Voice Calls (Ava)</span>
            <PhoneCall className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground">
            {metrics.totalVoiceCalls}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold">WebRTC 98.2% latency &lt;300ms</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Integrated Master Operations Calendar */}
        <div className="lg:col-span-7 rounded-3xl border border-border bg-card shadow-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Operational Pickup & Bay Timeline</h2>
              <p className="text-xs text-muted-foreground">Live movement tracking and driver dispatches</p>
            </div>
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Today
            </span>
          </div>

          <div className="space-y-3">
            {recentPickups.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-background border border-border flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-foreground">{item.vehicle}</span>
                    <span className="text-[10px] font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                      {item.plate}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Customer: <strong>{item.customer}</strong> • {item.type}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-foreground">{item.time}</div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ava Autonomous Inbound Voice Logs */}
        <div className="lg:col-span-5 rounded-3xl border border-border bg-card shadow-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Voice Concierge Inbound Log</h2>
              <p className="text-xs text-muted-foreground">Autonomous tool calls executed in TZS</p>
            </div>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>

          <div className="space-y-4">
            {recentVoiceLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-2xl bg-background border border-border space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-primary">{log.caller}</span>
                  <span className="text-[10px] text-muted-foreground">{log.time}</span>
                </div>
                <p className="text-xs text-foreground font-medium">"{log.query}"</p>
                <div className="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 p-2 rounded-lg">
                  {log.outcome}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
