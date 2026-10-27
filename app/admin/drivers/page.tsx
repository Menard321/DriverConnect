'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, UserCheck, ShieldCheck, Check, X, Phone, DollarSign } from 'lucide-react';
import { INITIAL_DRIVERS } from '@/lib/mockData';
import { Driver } from '@/lib/types';
import { formatTZS } from '@/lib/formatters';

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDriverName, setNewDriverName] = useState('');
  const [newLicense, setNewLicense] = useState('');
  const [newPhone, setNewPhone] = useState('+255 754 ');

  const toggleActive = (id: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, is_active: !d.is_active } : d))
    );
  };

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName || !newLicense) return;

    const created: Driver = {
      id: `d_${Date.now()}`,
      profile_id: `p_${Date.now()}`,
      license_number: newLicense,
      daily_wage: 50000,
      is_active: true,
      profile: {
        id: `p_${Date.now()}`,
        full_name: newDriverName,
        phone: newPhone,
        role: 'fleet_driver',
        wallet_balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setDrivers((prev) => [created, ...prev]);
    setIsAddOpen(false);
    setNewDriverName('');
    setNewLicense('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="space-y-1">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-black text-foreground">Chauffeur & Driver Allocation</h1>
          <p className="text-xs text-muted-foreground">
            Manage certified drivers, daily wage payouts (TZS 50,000/day), and booking assignments.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-primary/20"
        >
          + Add New Chauffeur
        </button>
      </div>

      {isAddOpen && (
        <form
          onSubmit={handleAddDriver}
          className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-xl"
        >
          <h3 className="font-bold text-sm text-foreground">Register Certified Chauffeur</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newDriverName}
                onChange={(e) => setNewDriverName(e.target.value)}
                placeholder="e.g. Salim Said"
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">License No (TRA)</label>
              <input
                type="text"
                required
                value={newLicense}
                onChange={(e) => setNewLicense(e.target.value)}
                placeholder="TZ-DL-XXXXXX"
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="py-2 px-4 rounded-xl bg-secondary text-xs font-bold text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-md"
            >
              Save Chauffeur
            </button>
          </div>
        </form>
      )}

      {/* Driver List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {drivers.map((drv) => (
          <div
            key={drv.id}
            className="p-6 rounded-3xl bg-card border border-border shadow-xl flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-foreground">{drv.profile?.full_name}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    drv.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {drv.is_active ? 'Available' : 'On Leave'}
                </span>
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <div>License: <strong className="text-foreground">{drv.license_number}</strong></div>
                <div>Phone: <strong className="text-foreground">{drv.profile?.phone}</strong></div>
                <div>Daily Wage: <strong className="text-primary">{formatTZS(drv.daily_wage)} / day</strong></div>
              </div>
            </div>

            <button
              onClick={() => toggleActive(drv.id)}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                drv.is_active
                  ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              {drv.is_active ? 'Set Unavailable' : 'Set Available'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
