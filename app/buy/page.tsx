'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, ShieldCheck, FileText, ArrowRight, CheckCircle2, Sparkles, Filter } from 'lucide-react';
import { INITIAL_VEHICLES } from '@/lib/mockData';
import { formatTZS, PLATFORM_CONSTANTS } from '@/lib/formatters';

export default function BuyIndexPage() {
  const [filterBrand, setFilterBrand] = useState('All');
  const salesVehicles = INITIAL_VEHICLES.filter((v) => v.is_for_sale);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          Certified 150-Point Inspected Vehicles • Tanzania
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-foreground">
          Verified Vehicles For Sale
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Every vehicle is professionally vetted by certified mechanics. Lock any vehicle for 72 hours with an instant <strong>{formatTZS(PLATFORM_CONSTANTS.SALES_HOLD_AMOUNT)}</strong> reservation hold while you test drive and finalize financing.
        </p>
      </div>

      {/* Grid of Cars For Sale */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {salesVehicles.map((car) => (
          <motion.div
            key={car.id}
            whileHover={{ y: -6 }}
            className="rounded-3xl bg-card border border-border overflow-hidden shadow-xl hover:border-primary/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative h-60 w-full overflow-hidden bg-slate-900">
                <img
                  src={car.cover_image}
                  alt={car.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground uppercase shadow-md">
                  Certified Pre-Owned
                </div>
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-black/70 text-amber-400 border border-amber-500/30">
                  {car.license_plate}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{car.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {car.year} • {car.body_type} • {car.transmission} • {car.mileage_km.toLocaleString()} km
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-secondary/50 border border-border text-xs flex items-center justify-between">
                  <span className="text-muted-foreground">Full Sale Price:</span>
                  <span className="text-base font-black text-primary">
                    {formatTZS(car.sale_price || 45000000)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Clean Title • Inspection Sheet Available
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-border/40 mt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Instant 72-hr Hold</span>
                <span className="text-sm font-bold text-foreground">{formatTZS(PLATFORM_CONSTANTS.SALES_HOLD_AMOUNT)}</span>
              </div>
              <Link
                href={`/buy/${car.id}`}
                className="py-2.5 px-5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-primary/20"
              >
                Inspect & Hold
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
