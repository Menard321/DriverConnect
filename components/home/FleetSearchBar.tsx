"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar as CalendarIcon,
  Car,
  UserCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Check,
  Sparkles,
} from "lucide-react";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(iso: string): string {
  if (!iso) return "Select date";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
  return dateObj.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function FleetSearchBar() {
  const router = useRouter();

  // Search parameters state
  const [location, setLocation] = useState("Dar es Salaam");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [category, setCategory] = useState("all");
  const [withChauffeur, setWithChauffeur] = useState(false);

  // Calendar popover & navigation state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectingTarget, setSelectingTarget] = useState<"pickup" | "return">("pickup");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toISODate(today);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    if (isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalendarOpen]);

  // Navigate month
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Generate days grid for viewMonth and viewYear
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  // In JS, Sunday is 0. Convert to Monday = 0, Sunday = 6
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const calendarDays: Array<{
    dateStr: string;
    dayNum: number;
    isCurrentMonth: boolean;
    isPast: boolean;
  }> = [];

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dObj = new Date(viewYear, viewMonth, d);
    dObj.setHours(0, 0, 0, 0);
    const dateStr = toISODate(dObj);
    calendarDays.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
      isPast: dObj < today,
    });
  }

  // Handle day click
  const handleDayClick = (dateStr: string) => {
    if (selectingTarget === "pickup") {
      setPickupDate(dateStr);
      // If returnDate exists and is before new pickup, reset returnDate
      if (returnDate && returnDate < dateStr) {
        setReturnDate("");
      }
      // Automatically prompt user to select return date next
      setSelectingTarget("return");
    } else {
      // selecting return date
      if (dateStr < pickupDate) {
        // If clicked date is before pickup, treat it as new pickup date
        setPickupDate(dateStr);
        setSelectingTarget("return");
      } else {
        setReturnDate(dateStr);
        // Both selected! Close popover after brief feedback
        setTimeout(() => setIsCalendarOpen(false), 250);
      }
    }
  };

  // Quick preset shortcuts
  const applyPreset = (daysDuration: number) => {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + daysDuration);

    setPickupDate(toISODate(start));
    setReturnDate(toISODate(end));
    setIsCalendarOpen(false);
  };

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

  // Calculate rental duration in days
  const rentalDaysCount =
    pickupDate && returnDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(returnDate).getTime() - new Date(pickupDate).getTime()) / (1000 * 60 * 60 * 24)
          )
        )
      : null;

  return (
    <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 w-full">
      <form
        onSubmit={handleSearch}
        className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-black/80 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative">
          
          {/* 1. Location */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 flex-shrink-0">
              <MapPin className="w-5 h-5" />
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

          {/* 2. Interactive Calendar Date Range Picker */}
          <div ref={calendarRef} className="relative">
            <div
              className={`p-3 bg-slate-950/80 border rounded-2xl flex items-center gap-3 transition-colors cursor-pointer select-none ${
                isCalendarOpen ? "border-blue-400 ring-2 ring-blue-400/20" : "border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Calendar Icon Button: Click to open/close calendar */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCalendarOpen((prev) => !prev);
                }}
                title="Click to select dates on visual calendar"
                className="w-10 h-10 rounded-xl bg-blue-400/10 hover:bg-blue-400/20 active:scale-95 flex items-center justify-center text-blue-400 flex-shrink-0 transition-transform cursor-pointer"
              >
                <CalendarIcon className="w-5 h-5" />
              </button>

              {/* Date Display Columns */}
              <div
                onClick={() => setIsCalendarOpen(true)}
                className="flex-1 grid grid-cols-2 gap-2 min-w-0"
              >
                {/* Pickup Field */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectingTarget("pickup");
                    setIsCalendarOpen(true);
                  }}
                  className={`p-1 rounded-lg transition ${
                    isCalendarOpen && selectingTarget === "pickup"
                      ? "bg-blue-500/10 text-blue-300"
                      : ""
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Pickup
                  </span>
                  <div className="text-xs font-bold text-white truncate">
                    {pickupDate ? formatDisplayDate(pickupDate) : (
                      <span className="text-slate-500 font-normal">Select date</span>
                    )}
                  </div>
                </div>

                {/* Return Field */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectingTarget("return");
                    setIsCalendarOpen(true);
                  }}
                  className={`p-1 rounded-lg transition ${
                    isCalendarOpen && selectingTarget === "return"
                      ? "bg-blue-500/10 text-blue-300"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Return
                    </span>
                    {rentalDaysCount && (
                      <span className="text-[9px] font-mono text-amber-400 font-bold">
                        {rentalDaysCount}d
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {returnDate ? formatDisplayDate(returnDate) : (
                      <span className="text-slate-500 font-normal">Select date</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* FLOATING INTERACTIVE CALENDAR POPOVER */}
            <AnimatePresence>
              {isCalendarOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 z-50 w-[320px] sm:w-[350px] p-4 bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl shadow-black/90 backdrop-blur-2xl text-slate-100"
                >
                  {/* Header: Instruction & Target Toggle */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setSelectingTarget("pickup")}
                        className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                          selectingTarget === "pickup"
                            ? "bg-blue-500 text-white shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Pickup: {pickupDate ? formatDisplayDate(pickupDate) : "—"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectingTarget("return")}
                        className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                          selectingTarget === "return"
                            ? "bg-blue-500 text-white shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Return: {returnDate ? formatDisplayDate(returnDate) : "—"}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsCalendarOpen(false)}
                      className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Month Navigation */}
                  <div className="flex items-center justify-between py-3">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-white tracking-wide">
                      {MONTH_NAMES[viewMonth]} {viewYear}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Day of Week Labels */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 pb-1">
                    {DAY_NAMES.map((day) => (
                      <div key={day} className="py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Empty placeholder slots for previous month offset */}
                    {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-8" />
                    ))}

                    {/* Active Month Days */}
                    {calendarDays.map((d) => {
                      const isPickup = d.dateStr === pickupDate;
                      const isReturn = d.dateStr === returnDate;
                      const isInRange =
                        pickupDate && returnDate && d.dateStr > pickupDate && d.dateStr < returnDate;

                      let cellStyle =
                        "text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg";
                      if (d.isPast) {
                        cellStyle = "text-slate-600 opacity-40 cursor-not-allowed pointer-events-none";
                      } else if (isPickup || isReturn) {
                        cellStyle =
                          "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20 rounded-lg scale-105";
                      } else if (isInRange) {
                        cellStyle = "bg-amber-400/20 text-amber-200 font-bold rounded-none";
                      }

                      return (
                        <button
                          key={d.dateStr}
                          type="button"
                          disabled={d.isPast}
                          onClick={() => handleDayClick(d.dateStr)}
                          className={`h-8 text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${cellStyle}`}
                        >
                          {d.dayNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Select Preset Chips */}
                  <div className="pt-3.5 mt-3 border-t border-slate-800/80 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Quick Selection Shortcuts:
                    </span>
                    <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                      {[
                        { label: "1 Day", days: 1 },
                        { label: "3 Days", days: 3 },
                        { label: "1 Week", days: 7 },
                        { label: "2 Weeks", days: 14 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => applyPreset(preset.days)}
                          className="py-1 px-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 font-bold text-center transition cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Footer status message */}
                  <div className="pt-2 text-[10px] text-slate-400 text-center">
                    {selectingTarget === "pickup" ? (
                      <span className="text-amber-400 font-medium">Click on a date to set Pickup</span>
                    ) : (
                      <span className="text-blue-400 font-medium">Click on a date to set Return</span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Category */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center text-purple-400 flex-shrink-0">
              <Car className="w-5 h-5" />
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
                <UserCheck className="w-4 h-4 text-amber-400" />
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
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}

export default FleetSearchBar;
