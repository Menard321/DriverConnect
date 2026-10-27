'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Car,
  ShieldCheck,
  Calendar,
  MapPin,
  UserCheck,
  ArrowRight,
  Filter,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Vehicle } from '@/lib/types';
import { INITIAL_VEHICLES } from '@/lib/mockData';
import { formatTZS, PLATFORM_CONSTANTS } from '@/lib/formatters';

function RentalCatalogContent() {
  const searchParams = useSearchParams();

  const initialLocation = searchParams.get('location') || 'All Regions';
  const initialCategory = searchParams.get('type') || 'all';
  const initialPickup = searchParams.get('pickup') || '';
  const initialReturn = searchParams.get('return') || '';
  const initialChauffeur = searchParams.get('chauffeur') === 'true';

  const [categoryFilter, setCategoryFilter] = useState<string>(
    initialCategory.toLowerCase() === 'economy'
      ? 'Hatchback'
      : initialCategory.toLowerCase() === 'suv'
      ? 'SUV'
      : initialCategory.toLowerCase() === 'luxury'
      ? 'SUV'
      : 'All'
  );
  const [withChauffeur, setWithChauffeur] = useState<boolean>(initialChauffeur);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);

  // Filter rentals
  const rentalVehicles = vehicles.filter((v) => {
    if (categoryFilter === 'All') return true;
    return v.body_type?.toLowerCase() === categoryFilter.toLowerCase();
  });

  const categories = ['All', 'SUV', 'Pickup', 'Van', 'Hatchback'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Real-Time Fleet Availability • Tanzania</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          Explore Rental Fleet
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Guaranteed temporal booking reservation. Zero double bookings with live PostgreSQL temporal locks.
          {initialLocation && initialLocation !== 'All Regions' && (
            <span className="text-amber-400 font-semibold"> Showing fleet in {initialLocation}.</span>
          )}
        </p>

        {/* Search Parameter Badges */}
        {(initialPickup || initialReturn || withChauffeur) && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {initialPickup && (
              <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Pickup: {initialPickup}</span>
              </span>
            )}
            {initialReturn && (
              <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>Return: {initialReturn}</span>
              </span>
            )}
            {withChauffeur && (
              <span className="px-3 py-1 rounded-xl bg-amber-400/10 border border-amber-400/30 text-xs text-amber-400 flex items-center gap-1.5 font-bold">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Dedicated Driver (+TZS 50k/day)</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filter and Chauffeur bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setWithChauffeur(!withChauffeur)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
            withChauffeur
              ? 'bg-amber-400/10 border-amber-400 text-amber-400'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Add Chauffeur (+TZS 50k/day)</span>
        </button>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rentalVehicles.map((car) => {
          const dailyRate = car.daily_rate;
          const chauffeurRate = withChauffeur ? PLATFORM_CONSTANTS.DRIVER_DAILY_RATE : 0;
          const totalDaily = dailyRate + chauffeurRate;

          return (
            <motion.div
              key={car.id}
              whileHover={{ y: -6 }}
              className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl hover:border-amber-400/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-60 w-full overflow-hidden bg-slate-950">
                  <img
                    src={car.cover_image}
                    alt={car.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-md border border-white/10 uppercase">
                      {car.body_type}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 uppercase">
                      {car.transmission}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-slate-950/90 text-amber-400 border border-amber-400/30">
                    {car.license_plate}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{car.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {car.year} • {car.fuel_type} • {car.seats} Seats • {car.mileage_km.toLocaleString()} km
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {car.features.slice(0, 3).map((f, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-slate-800 text-slate-300"
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  {withChauffeur && (
                    <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                        Dedicated Chauffeur:
                      </span>
                      <span className="font-bold">+TZS 50,000/day</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-800/60 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Daily Rate</span>
                  <div className="text-lg font-black text-amber-400">
                    {formatTZS(totalDaily)}
                    <span className="text-xs text-slate-400 font-normal"> / day</span>
                  </div>
                </div>

                <Link
                  href={`/rent/${car.id}${withChauffeur ? '?chauffeur=true' : ''}`}
                  className="py-2.5 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-amber-400/20 cursor-pointer"
                >
                  Reserve Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function RentIndexPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center text-slate-400">Loading Fleet...</div>}>
      <RentalCatalogContent />
    </Suspense>
  );
}
