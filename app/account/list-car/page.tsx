'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Car,
  Upload,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  DollarSign,
  Plus,
} from 'lucide-react';
import { formatTZS } from '@/lib/formatters';

export default function ListCarPage() {
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('Toyota');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2020');
  const [bodyType, setBodyType] = useState('SUV');
  const [transmission, setTransmission] = useState<'automatic' | 'manual'>('automatic');
  const [fuelType, setFuelType] = useState('Petrol');
  const [seats, setSeats] = useState(5);
  const [licensePlate, setLicensePlate] = useState('');
  const [dailyRate, setDailyRate] = useState<number>(150000);
  const [salePrice, setSalePrice] = useState<number>(45000000);
  const [isForRent, setIsForRent] = useState(true);
  const [isForSale, setIsForSale] = useState(false);
  const [featuresInput, setFeaturesInput] = useState('Reverse Camera, 4WD, Bluetooth, Air Conditioning');
  const [imageUrl, setImageUrl] = useState('/images/cars/toyota-prado.webp');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedVehicle, setSubmittedVehicle] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        title: title || `${brand} ${model} (${year})`,
        brand,
        model,
        year: parseInt(year),
        body_type: bodyType,
        transmission,
        fuel_type: fuelType,
        seats,
        license_plate: licensePlate.toUpperCase(),
        daily_rate: dailyRate,
        sale_price: isForSale ? salePrice : null,
        is_for_rent: isForRent,
        is_for_sale: isForSale,
        is_approved: false, // Strict default: Enforced admin review queue
        cover_image: imageUrl,
        features: featuresInput.split(',').map((f) => f.trim()),
      };

      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setSubmittedVehicle(data.vehicle || payload);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Fleet Catalog
      </Link>

      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
          <Car className="w-3.5 h-3.5" />
          P2P Vehicle Onboarding • Earn in TZS
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground">
          List Your Vehicle for Rent or Sale
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Join Tanzania’s premier vehicle owner network. Earn daily passive income from certified renters with comprehensive insurance and licensed chauffeurs.
        </p>
      </div>

      {!submittedVehicle ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-border bg-card shadow-2xl p-6 sm:p-8 space-y-8 backdrop-blur-xl"
        >
          {/* Vertical Choices */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              1. Choose Listing Purpose
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  isForRent ? 'bg-primary/10 border-primary' : 'bg-background border-border hover:bg-secondary'
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-foreground">List for Rent</div>
                  <div className="text-xs text-muted-foreground">Earn daily rental income in TZS</div>
                </div>
                <input
                  type="checkbox"
                  checked={isForRent}
                  onChange={(e) => setIsForRent(e.target.checked)}
                  className="w-5 h-5 rounded accent-primary cursor-pointer"
                />
              </label>

              <label
                className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  isForSale ? 'bg-primary/10 border-primary' : 'bg-background border-border hover:bg-secondary'
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-foreground">List for Sale</div>
                  <div className="text-xs text-muted-foreground">Sell with TZS 1.3M reservation holds</div>
                </div>
                <input
                  type="checkbox"
                  checked={isForSale}
                  onChange={(e) => setIsForSale(e.target.checked)}
                  className="w-5 h-5 rounded accent-primary cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Vehicle Specifications */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              2. Vehicle Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Make / Brand</label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Toyota, Nissan"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Model</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Prado TX, RAV4, Harrier"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Manufacturing Year</label>
                <input
                  type="number"
                  required
                  min="1995"
                  max="2026"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Body Type</label>
                <select
                  value={bodyType}
                  onChange={(e) => setBodyType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-semibold focus:outline-none focus:border-primary"
                >
                  <option>SUV</option>
                  <option>Sedan</option>
                  <option>Pickup</option>
                  <option>Van</option>
                  <option>Hatchback</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Transmission</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-semibold focus:outline-none focus:border-primary"
                >
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Tanzanian Plate (TRA)</label>
                <input
                  type="text"
                  required
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  placeholder="e.g. T 842 EAD"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-semibold uppercase focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Pricing Config in TZS */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              3. Pricing Configuration (TZS Native)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isForRent && (
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                    Daily Rental Rate (TZS)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required={isForRent}
                      step="5000"
                      value={dailyRate}
                      onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)}
                      className="w-full pl-3.5 pr-20 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-bold focus:outline-none focus:border-primary"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-black text-primary">TZS / day</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Recommended: TZS 75,000 (Compact) to TZS 350,000 (Luxury SUV)
                  </span>
                </div>
              )}

              {isForSale && (
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                    Asking Sale Price (TZS)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required={isForSale}
                      step="500000"
                      value={salePrice}
                      onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                      className="w-full pl-3.5 pr-16 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-bold focus:outline-none focus:border-primary"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-black text-primary">TZS</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Includes automatic TZS 1,300,000 hold deposit mechanism.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Image & Features */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              4. Media & Key Highlights
            </h3>
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                Vehicle Image URL (or upload to Supabase 'vehicles' bucket)
              </label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                Features (Comma separated)
              </label>
              <input
                type="text"
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Admin Policy Notice */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-300">
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <span className="font-bold text-amber-200 block">Strict Admin Approval Enforcement</span>
              All submissions are created with <code>is_approved = false</code>. DriverConnect fleet managers inspect the vehicle and verify TRA registration before publishing live to the public catalog.
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary-hover text-primary-foreground font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isSubmitting ? 'Submitting to Approval Queue...' : 'Submit Vehicle for Admin Review'}
          </button>
        </form>
      ) : (
        <div className="p-8 rounded-3xl border border-emerald-500/30 bg-card shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Vehicle Submitted Successfully!</h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Your vehicle <strong>{submittedVehicle.title}</strong> (Plate: {submittedVehicle.license_plate}) has been added to our pending queue. An admin will review and publish it within 24 hours.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              href="/admin/vehicles"
              className="py-2.5 px-5 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
            >
              View in Admin Approval Queue
            </Link>
            <button
              onClick={() => setSubmittedVehicle(null)}
              className="py-2.5 px-5 rounded-xl bg-secondary text-foreground text-xs font-bold"
            >
              Submit Another Car
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
