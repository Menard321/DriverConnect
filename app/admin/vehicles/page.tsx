'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Car, Check, X, ShieldCheck, Search, Filter } from 'lucide-react';
import { INITIAL_VEHICLES } from '@/lib/mockData';
import { Vehicle } from '@/lib/types';
import { formatTZS } from '@/lib/formatters';

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    ...INITIAL_VEHICLES,
    {
      id: 'p2p-pend-01',
      title: 'Nissan X-Trail 4WD',
      brand: 'Nissan',
      model: 'X-Trail',
      year: 2019,
      body_type: 'SUV',
      transmission: 'automatic',
      seats: 5,
      doors: 5,
      fuel_type: 'Petrol',
      mileage_km: 74000,
      license_plate: 'T 921 ECD',
      daily_rate: 130000,
      weekly_rate: 780000,
      sale_price: 36000000,
      is_for_rent: true,
      is_for_sale: false,
      is_approved: false, // P2P Awaiting Approval
      status: 'available',
      cover_image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      gallery_images: [],
      features: ['Sunroof', 'Eco Mode', 'Alloy Rims'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'fleet' | 'sold'>('all');

  const toggleApproval = (id: string) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, is_approved: !v.is_approved } : v))
    );
  };

  const filteredVehicles = vehicles.filter((v) => {
    if (activeTab === 'pending') return !v.is_approved;
    if (activeTab === 'fleet') return v.is_approved && v.status !== 'sold';
    if (activeTab === 'sold') return v.status === 'sold';
    return true;
  });

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
          <h1 className="text-3xl font-black text-foreground">Fleet & P2P Approvals</h1>
          <p className="text-xs text-muted-foreground">
            Approve customer-submitted vehicles to publish them to the live marketplace catalog.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            All ({vehicles.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}
          >
            Awaiting Approval ({vehicles.filter((v) => !v.is_approved).length})
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'fleet' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            Active Catalog
          </button>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/60 text-muted-foreground border-b border-border uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Plate</th>
                <th className="p-4">Category</th>
                <th className="p-4">Rates (TZS)</th>
                <th className="p-4">Listing Mode</th>
                <th className="p-4">Approval State</th>
                <th className="p-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredVehicles.map((car) => (
                <tr key={car.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={car.cover_image}
                        alt={car.title}
                        className="w-12 h-10 object-cover rounded-lg bg-slate-900"
                      />
                      <div>
                        <div className="font-bold text-foreground text-sm">{car.title}</div>
                        <div className="text-[11px] text-muted-foreground">{car.year} • {car.fuel_type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-primary">{car.license_plate}</td>
                  <td className="p-4 text-foreground">{car.body_type}</td>
                  <td className="p-4">
                    <div className="font-bold text-foreground">{formatTZS(car.daily_rate)}/day</div>
                    {car.is_for_sale && (
                      <div className="text-[10px] text-muted-foreground">Sale: {formatTZS(car.sale_price)}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-secondary text-secondary-foreground uppercase">
                      {car.is_for_rent && car.is_for_sale
                        ? 'Rent & Sale'
                        : car.is_for_sale
                        ? 'For Sale'
                        : 'Rent Only'}
                    </span>
                  </td>
                  <td className="p-4">
                    {car.is_approved ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                        <Check className="w-3.5 h-3.5" /> Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-400 font-bold animate-pulse">
                        Pending Admin Review
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleApproval(car.id)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                        car.is_approved
                          ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                          : 'bg-primary hover:bg-primary-hover text-primary-foreground shadow-md'
                      }`}
                    >
                      {car.is_approved ? 'Revoke Approval' : 'Approve & Publish'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
