'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Car,
  ShoppingBag,
  Wrench,
  Search,
  Filter,
  ShieldCheck,
  Zap,
  Users,
  Navigation,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Vehicle } from '@/lib/types';
import { INITIAL_VEHICLES } from '@/lib/mockData';
import { formatTZS, formatTZSCompact } from '@/lib/formatters';
import { FlowMotionHero } from '@/components/home/FlowMotionHero';
import { FleetSearchBar } from '@/components/home/FleetSearchBar';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';

export default function HomePage() {
  const [activeVertical, setActiveVertical] = useState<'rent' | 'buy' | 'repair'>('rent');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch vehicles
  useEffect(() => {
    async function loadVehicles() {
      setLoading(true);
      try {
        const res = await fetch(`/api/vehicles?vertical=${activeVertical}&category=${categoryFilter}`);
        const data = await res.json();
        if (data.vehicles && data.vehicles.length > 0) {
          setVehicles(data.vehicles);
        } else {
          setVehicles(INITIAL_VEHICLES);
        }
      } catch (err) {
        console.error('Failed to load live vehicles:', err);
        setVehicles(INITIAL_VEHICLES);
      } finally {
        setLoading(false);
      }
    }

    if (activeVertical !== 'repair') {
      loadVehicles();
    }
  }, [activeVertical, categoryFilter]);

  const categories = ['All', 'SUV', 'Pickup', 'Van', 'Hatchback'];

  return (
    <div className="space-y-16 pb-24">
      {/* Flow-Motion Moving Car Hero with Highway Markers & Customizable Background */}
      <FlowMotionHero
        activeVertical={activeVertical}
        onSelectVertical={(vert) => setActiveVertical(vert)}
      />

      {/* 1. Instant Fleet Search & Filter Bar */}
      <FleetSearchBar />

      {/* Trust Badges Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-secondary/40 border border-border/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-foreground">Zero Double Bookings</h5>
              <p className="text-[11px] text-muted-foreground">Postgres GiST temporal locks</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-foreground">Doorstep Delivery</h5>
              <p className="text-[11px] text-muted-foreground">TZS 3,500/km direct dispatch</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-foreground">Licensed Chauffeurs</h5>
              <p className="text-[11px] text-muted-foreground">TZS 50,000/day dedicated driver</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-foreground">Ava Voice Concierge</h5>
              <p className="text-[11px] text-muted-foreground">OpenAI WebRTC live UI sync</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. "How It Works" 3-Step Interactive Walkthrough */}
      <HowItWorksSection />

      {/* Main Inventory Catalog */}
      <section id="inventory-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-bold text-primary tracking-wider mb-1">
              {activeVertical === 'buy' ? 'Verified Cars For Sale' : 'Available Fleet For Rent'}
            </div>
            <h2 className="text-3xl font-black text-foreground">
              {activeVertical === 'buy' ? 'Browse Sales Showroom' : 'Explore Rental Vehicles'}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              All quotes and rates guaranteed in Tanzanian Shillings (TZS) with instant checkout confirmation.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((car) => (
            <motion.div
              key={car.id}
              whileHover={{ y: -5 }}
              className="rounded-3xl bg-card border border-border overflow-hidden shadow-xl hover:border-primary/50 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-900">
                  <img
                    src={car.cover_image}
                    alt={car.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/10 uppercase">
                      {car.body_type}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-primary text-primary-foreground backdrop-blur-md uppercase">
                      {car.transmission}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-950/80 text-amber-400 border border-amber-500/30">
                    {car.license_plate}
                  </div>
                </div>

                {/* Car Details */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{car.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {car.year} • {car.fuel_type} • {car.seats} Seats • {car.mileage_km.toLocaleString()} km
                    </p>
                  </div>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {car.features.slice(0, 3).map((f, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-secondary text-secondary-foreground"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Action Footer */}
              <div className="p-6 pt-0 border-t border-border/40 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    {activeVertical === 'buy' ? 'Full Sale Price' : 'Daily Rental Rate'}
                  </span>
                  <div className="text-lg font-black text-primary">
                    {activeVertical === 'buy'
                      ? formatTZS(car.sale_price || 45000000)
                      : `${formatTZS(car.daily_rate)}`}
                    {activeVertical !== 'buy' && <span className="text-xs text-muted-foreground font-normal"> / day</span>}
                  </div>
                </div>

                {activeVertical === 'buy' ? (
                  <Link
                    href={`/buy/${car.id}`}
                    className="py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-primary/20"
                  >
                    Hold TZS 1.3M
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link
                    href={`/rent/${car.id}`}
                    className="py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-primary/20"
                  >
                    Reserve
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
