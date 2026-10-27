"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Car, UserCheck, Search } from "lucide-react";

export function FleetSearchBar() {
  const router = useRouter();

  const [location, setLocation] = useState("Dar es Salaam");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [category, setCategory] = useState("all");
  const [withChauffeur, setWithChauffeur] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();

    if (location) query.set("location", location);
    if (pickupDate) query.set("pickup", pickupDate);
    if (returnDate) query.set("return", returnDate);
    if (category !== "all") query.set("type", category);
    if (withChauffeur) query.set("chauffeur", "true");

    router.push(`/rent?${query.toString()}`);
  };

  return (
    <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 w-full">
      <form
        onSubmit={handleSearch}
        className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-black/80 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* 1. Location */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 flex-shrink-0">
              <MapPin className="w-5 h-5"/>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Pickup Region
              </span>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="Dar es Salaam" className="bg-slate-900 text-white">Dar es Salaam (Central)</option>
                <option value="Arusha" className="bg-slate-900 text-white">Arusha (Safari Hub)</option>
                <option value="Dodoma" className="bg-slate-900 text-white">Dodoma (Capital City)</option>
                <option value="Zanzibar" className="bg-slate-900 text-white">Zanzibar (Island Desk)</option>
              </select>
            </div>
          </div>

          {/* 2. Dates */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center text-blue-400 flex-shrink-0">
              <Calendar className="w-5 h-5"/>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2 min-w-0">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Pickup
                </span>
                <input
                  type="date"
                  min={todayStr}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Return
                </span>
                <input
                  type="date"
                  min={pickupDate || todayStr}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 3. Category */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center text-purple-400 flex-shrink-0">
              <Car className="w-5 h-5"/>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Vehicle Type
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">All Fleet Classes</option>
                <option value="economy" className="bg-slate-900 text-white">Economy (TZS 75,000/day)</option>
                <option value="suv" className="bg-slate-900 text-white">Mid-Size SUV (TZS 150,000/day)</option>
                <option value="luxury" className="bg-slate-900 text-white">Executive 4x4 (TZS 350,000/day)</option>
              </select>
            </div>
          </div>

          {/* 4. Chauffeur Toggle & Search Submit */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => setWithChauffeur(!withChauffeur)}
              className={`flex-1 p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                withChauffeur
                  ? "border-amber-400 bg-amber-400/10 ring-2 ring-amber-400/20"
                  : "border-slate-800 bg-slate-950/80 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-400"/>
                <div>
                  <span className="text-xs font-bold text-white block">Chauffeur</span>
                  <span className="text-[10px] text-slate-400">+TZS 50k/day</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={withChauffeur}
                onChange={(e) => setWithChauffeur(e.target.checked)}
                className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="h-full px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4"/>
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}

export default FleetSearchBar;
