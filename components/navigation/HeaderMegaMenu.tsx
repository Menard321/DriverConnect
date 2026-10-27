"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Car,
  Tag,
  Info,
  Calendar,
  ShieldCheck,
  ChevronDown,
  PhoneCall,
  Clock,
  Sparkles,
  ArrowRight,
  Wallet,
  FileCheck2,
  LogIn,
  User,
  LogOut,
  HelpCircle,
  Truck,
  Users,
  Key,
  Compass,
  CheckCircle2,
  Menu,
  X,
  Gauge,
  Disc,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type ActiveMenu = "services" | "rentals" | "sales" | "more" | null;

export function HeaderMegaMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const isAccountRoute = pathname?.startsWith("/account");
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navContainerRef = useRef<HTMLDivElement | null>(null);

  // Authentication & Profile States
  const [user, setUser] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Close dropdown on route change
  useEffect(() => {
    setActiveMenu(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        navContainerRef.current &&
        !navContainerRef.current.contains(event.target as Node)
      ) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch live user & wallet balance on mount and subscribe to changes
  useEffect(() => {
    async function initAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchWallet(session.user.id, session.user);
        } else {
          setUser(null);
          setWalletBalance(null);
        }
      } catch (err) {
        console.warn("[Header auth init note]:", err);
        setUser(null);
        setWalletBalance(null);
      } finally {
        setAuthLoading(false);
      }
    }

    async function fetchWallet(userId: string, currentUser?: any) {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("wallet_balance")
          .eq("id", userId)
          .single();
        if (data && typeof data.wallet_balance === "number") {
          setWalletBalance(data.wallet_balance);
          return;
        }
      } catch (err) {
        console.warn("[Header fetch wallet note]:", err);
      }

      if (currentUser?.user_metadata?.wallet_balance !== undefined) {
        setWalletBalance(Number(currentUser.user_metadata.wallet_balance));
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchWallet(session.user.id, session.user);
      } else {
        setUser(null);
        setWalletBalance(null);
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setWalletBalance(null);
    router.push("/");
    router.refresh();
  };

  const handleMouseEnter = (menu: ActiveMenu) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 200);
  };

  const toggleMenu = (menu: ActiveMenu) => {
    setActiveMenu((prev) => (prev === menu ? null : menu));
  };

  const handleTriggerVoice = () => {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("trigger-voice-concierge");
      window.dispatchEvent(event);
    }
  };

  return (
    <header
      ref={navContainerRef}
      className="sticky top-0 z-50 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link className="flex items-center gap-2 group" href="/">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Car className="w-6 h-6 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                Driver<span className="text-amber-400">Connect</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Tanzania &bull; TZS
              </span>
            </div>
          </Link>

          {/* Desktop Mega Navigation */}
          <nav
            className="hidden lg:flex items-center gap-1 h-full"
            onMouseLeave={handleMouseLeave}
          >
            <Link
              className="px-3.5 py-2 rounded-lg text-sm font-semibold hover:text-amber-400 transition"
              href="/"
            >
              Home
            </Link>

            {/* 1. Repair & Service Mega Menu Trigger */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => handleMouseEnter("services")}
            >
              <button
                type="button"
                onClick={() => toggleMenu("services")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                  activeMenu === "services"
                    ? "text-amber-400 bg-slate-900"
                    : "text-slate-200 hover:text-amber-400"
                }`}
              >
                <span>Repair &amp; Service</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeMenu === "services" ? "rotate-180 text-amber-400" : ""
                  }`}
                />
              </button>
            </div>

            {/* 2. Rent a Car Mega Menu Trigger */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => handleMouseEnter("rentals")}
            >
              <button
                type="button"
                onClick={() => toggleMenu("rentals")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                  activeMenu === "rentals"
                    ? "text-amber-400 bg-slate-900"
                    : "text-slate-200 hover:text-amber-400"
                }`}
              >
                <span>Rent a Car</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeMenu === "rentals" ? "rotate-180 text-amber-400" : ""
                  }`}
                />
              </button>
            </div>

            {/* 3. Buy a Car Mega Menu Trigger */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => handleMouseEnter("sales")}
            >
              <button
                type="button"
                onClick={() => toggleMenu("sales")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                  activeMenu === "sales"
                    ? "text-amber-400 bg-slate-900"
                    : "text-slate-200 hover:text-amber-400"
                }`}
              >
                <span>Buy a Car</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeMenu === "sales" ? "rotate-180 text-amber-400" : ""
                  }`}
                />
              </button>
            </div>

            {/* 4. More Trigger */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => handleMouseEnter("more")}
            >
              <button
                type="button"
                onClick={() => toggleMenu("more")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                  activeMenu === "more"
                    ? "text-amber-400 bg-slate-900"
                    : "text-slate-200 hover:text-amber-400"
                }`}
              >
                <span>More</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeMenu === "more" ? "rotate-180 text-amber-400" : ""
                  }`}
                />
              </button>
            </div>
          </nav>

          {/* User Status & Action Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Phone Helpline */}
            <a
              href="tel:+255700000000"
              className="hidden xl:flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-amber-400 font-mono tracking-tight transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span>+255 700 000 000</span>
            </a>

            {/* Wallet Balance Chip */}
            {!authLoading && user && walletBalance !== null && !isAccountRoute && (
              <Link
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold hover:border-amber-400/50 transition group shadow-inner"
                href="/account/dashboard?tab=wallet"
              >
                <Wallet className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-400">Wallet:</span>
                <span className="text-amber-400 font-bold font-mono">
                  TZS {walletBalance.toLocaleString()}
                </span>
              </Link>
            )}

            {/* Conditional Auth Gateway */}
            {authLoading ? (
              <div className="w-24 h-9 bg-slate-900 animate-pulse rounded-lg" />
            ) : user ? (
              <div className="flex items-center gap-2">
                {user?.user_metadata?.role === "admin" ? (
                  <Link
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20 transition text-amber-400"
                    href="/admin"
                    title="Administrator Control Console"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Console</span>
                  </Link>
                ) : (
                  <Link
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 transition text-white"
                    href="/account/dashboard"
                  >
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">My Account</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-500/30 text-slate-400 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 transition shadow-lg shadow-amber-400/20 cursor-pointer"
                href="/login"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-200 hover:text-amber-400 transition cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP MEGA MENU FLYOUTS                                                 */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeMenu && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            onMouseEnter={() => handleMouseEnter(activeMenu)}
            onMouseLeave={handleMouseLeave}
            className="hidden lg:block absolute left-0 right-0 top-full w-full bg-slate-950/98 border-b border-slate-800 shadow-2xl backdrop-blur-xl z-50 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

              {/* ----------------------------------------------------------------- */}
              {/* 1. REPAIR & SERVICE MEGA MENU                                     */}
              {/* ----------------------------------------------------------------- */}
              {activeMenu === "services" && (
                <div className="grid grid-cols-12 gap-6">
                  {/* Left Column: Core Navigation Links */}
                  <div className="col-span-3 border-r border-slate-800/80 pr-6 space-y-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5" /> Workshop Central
                    </span>
                    <h3 className="text-base font-extrabold text-white leading-tight">
                      Diagnostics, Service &amp; Maintenance
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Certified bay slots, live tracking, and guaranteed transparent rates in Tanzanian Shillings.
                    </p>

                    <div className="space-y-1.5 pt-1">
                      <Link
                        href="/repair"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-400/50 hover:bg-slate-900 transition group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                            Book a Repair Slot
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
                      </Link>

                      <Link
                        href="/repair#services"
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 transition group text-slate-300 hover:text-white"
                      >
                        <span className="text-xs font-medium">All Services &amp; Prices</span>
                        <ArrowRight className="w-3 h-3 text-slate-500 group-hover:translate-x-1 transition-transform" />
                      </Link>

                      <Link
                        href="/account/dashboard?tab=repairs"
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 transition group text-slate-300 hover:text-white"
                      >
                        <span className="text-xs font-medium">Track My Repair</span>
                        <ArrowRight className="w-3 h-3 text-slate-500 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>

                  {/* Center Section: Featured Services Grid with TZS Pricing */}
                  <div className="col-span-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Featured Workshop Services
                      </span>
                      <Link
                        href="/repair"
                        className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <span>View all</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Service 1: Oil & Filter */}
                      <Link
                        href="/repair?service=oil-change"
                        className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-amber-400/60 hover:bg-slate-900 transition group flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400">
                            <Gauge className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-extrabold text-amber-400 font-mono">
                            TZS 85,000
                          </span>
                        </div>
                        <div className="mt-3">
                          <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                            Oil &amp; Filter Change
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Synthetic lube + 45-min multi-point scan
                          </p>
                        </div>
                      </Link>

                      {/* Service 2: Engine Diagnostics */}
                      <Link
                        href="/repair?service=diagnostics"
                        className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-amber-400/60 hover:bg-slate-900 transition group flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-extrabold text-amber-400 font-mono">
                            TZS 50,000
                          </span>
                        </div>
                        <div className="mt-3">
                          <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                            Engine Diagnostics
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            OBD-II live telemetry &amp; fault scan
                          </p>
                        </div>
                      </Link>

                      {/* Service 3: Brake Inspection */}
                      <Link
                        href="/repair?service=brake-overhaul"
                        className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-amber-400/60 hover:bg-slate-900 transition group flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                            <Disc className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-extrabold text-amber-400 font-mono">
                            TZS 120,000
                          </span>
                        </div>
                        <div className="mt-3">
                          <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                            Brake Inspection &amp; Pads
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Rotor surfacing &amp; hydraulic fluid check
                          </p>
                        </div>
                      </Link>

                      {/* Service 4: Tyre Fitting & Alignment */}
                      <Link
                        href="/repair?service=tyre-fitting"
                        className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-amber-400/60 hover:bg-slate-900 transition group flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-extrabold text-amber-400 font-mono">
                            TZS 40,000
                          </span>
                        </div>
                        <div className="mt-3">
                          <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                            Tyre Fitting &amp; Alignment
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            High-speed spin balance &amp; laser alignment
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Right Section: Garage Info Card */}
                  <div className="col-span-3 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                        <Clock className="w-3.5 h-3.5" /> Working Hours
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Mon – Sat: 08:00 – 18:00</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Emergency breakdown bay open 24/7.
                        </p>
                      </div>

                      <div className="border-t border-slate-800 pt-3">
                        <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" /> Certified Mechanics
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Genuine OEM parts with 90-day workshop repair warranty.
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/repair"
                      className="mt-4 text-center py-2.5 px-4 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition shadow-md"
                    >
                      Book Workshop Slot &rarr;
                    </Link>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------------- */}
              {/* 2. RENT A CAR MEGA MENU (Two-Column Layout with Featured Cars)    */}
              {/* ----------------------------------------------------------------- */}
              {activeMenu === "rentals" && (
                <div className="grid grid-cols-12 gap-8">
                  {/* Left Column: Actions & Guides */}
                  <div className="col-span-5 border-r border-slate-800/80 pr-8 space-y-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5" /> Self-Drive &amp; Chauffeur
                      </span>
                      <h3 className="text-base font-extrabold text-white mt-1">
                        Rent Cars in Tanzania
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Instant reservations in TZS with zero double bookings and 20% deposit holds.
                      </p>
                    </div>

                    <div className="space-y-2 pt-1">
                      <Link
                        href="/rent"
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-900 transition group"
                      >
                        <Compass className="w-4 h-4 text-amber-400 mt-0.5 group-hover:scale-110 transition-transform" />
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                            Find a Car
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Search our luxury SUVs, Safari 4x4s, sedans, and vans
                          </p>
                        </div>
                      </Link>

                      <Link
                        href="/how-it-works"
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-900 transition group"
                      >
                        <HelpCircle className="w-4 h-4 text-blue-400 mt-0.5 group-hover:scale-110 transition-transform" />
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                            How Renting Works
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            20% deposit hold, digital handover, and transparent terms
                          </p>
                        </div>
                      </Link>

                      <Link
                        href="/rent?filter=chauffeur"
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-900 transition group"
                      >
                        <Truck className="w-4 h-4 text-emerald-400 mt-0.5 group-hover:scale-110 transition-transform" />
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                            Delivery &amp; Drivers
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Doorstep delivery (TZS 3,500/km) &amp; licensed chauffeurs (TZS 50,000/day)
                          </p>
                        </div>
                      </Link>

                      <Link
                        href="/account/list-car"
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-900 transition group"
                      >
                        <Key className="w-4 h-4 text-purple-400 mt-0.5 group-hover:scale-110 transition-transform" />
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                            Rent Out Your Car
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Earn passive income with verified driver protection
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: Featured Cars Showcase */}
                  <div className="col-span-7 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Featured Cars Ready to Rent
                      </span>
                      <Link
                        href="/rent"
                        className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <span>View full fleet</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Featured Car 1: Toyota Prado */}
                      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-400/50 transition group flex flex-col justify-between">
                        <div className="relative h-28 w-full bg-slate-950 overflow-hidden">
                          <img
                            src="/images/cars/toyota-prado.webp"
                            alt="Toyota Land Cruiser Prado TX-L"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-amber-400 uppercase">
                            Popular 4x4
                          </div>
                        </div>
                        <div className="p-3.5 space-y-2">
                          <div>
                            <h4 className="text-xs font-black text-white group-hover:text-amber-400 transition-colors">
                              Toyota Land Cruiser Prado TX-L
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              SUV &bull; Automatic &bull; 7-Seater
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                            <div>
                              <span className="text-[10px] text-slate-500 block leading-tight">Daily Rate</span>
                              <span className="text-xs font-extrabold text-amber-400 font-mono">
                                TZS 350,000
                              </span>
                            </div>
                            <Link
                              href="/rent/f47ac10b-58cc-4372-a567-0e02b2c3d479"
                              className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-[11px] hover:bg-amber-300 transition"
                            >
                              Rent Now
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Featured Car 2: Toyota Harrier */}
                      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-400/50 transition group flex flex-col justify-between">
                        <div className="relative h-28 w-full bg-slate-950 overflow-hidden">
                          <img
                            src="https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80"
                            alt="Toyota Harrier Elegance"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-white uppercase">
                            Executive
                          </div>
                        </div>
                        <div className="p-3.5 space-y-2">
                          <div>
                            <h4 className="text-xs font-black text-white group-hover:text-amber-400 transition-colors">
                              Toyota Harrier Elegance
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              Crossover &bull; Automatic &bull; 5-Seater
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                            <div>
                              <span className="text-[10px] text-slate-500 block leading-tight">Daily Rate</span>
                              <span className="text-xs font-extrabold text-amber-400 font-mono">
                                TZS 150,000
                              </span>
                            </div>
                            <Link
                              href="/rent/7c9e6679-7425-40de-944b-e07fc1f90ae7"
                              className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-[11px] hover:bg-amber-300 transition"
                            >
                              Rent Now
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------------- */}
              {/* 3. BUY A CAR MEGA MENU (Two-Column Layout with Latest Arrivals)   */}
              {/* ----------------------------------------------------------------- */}
              {activeMenu === "sales" && (
                <div className="grid grid-cols-12 gap-8">
                  {/* Left Column: Sales Actions */}
                  <div className="col-span-5 border-r border-slate-800/80 pr-8 space-y-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" /> Verified Showroom &amp; P2P
                      </span>
                      <h3 className="text-base font-extrabold text-white mt-1">
                        Buy &amp; Sell Cars
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        150-point roadworthy checks, clear TRA title guarantees, and 72-hour holds.
                      </p>
                    </div>

                    <div className="space-y-2 pt-1">
                      <Link
                        href="/buy"
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-900 transition group"
                      >
                        <Car className="w-4 h-4 text-amber-400 mt-0.5 group-hover:scale-110 transition-transform" />
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                            Cars for Sale
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Explore certified dealership and private seller listings
                          </p>
                        </div>
                      </Link>

                      <Link
                        href="/contact?subject=test-drive"
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-900 transition group"
                      >
                        <Calendar className="w-4 h-4 text-blue-400 mt-0.5 group-hover:scale-110 transition-transform" />
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                            Book a Test Drive
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Schedule a 45-minute unaccompanied or guided showroom test
                          </p>
                        </div>
                      </Link>

                      <Link
                        href="/account/list-car"
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-900 transition group"
                      >
                        <FileCheck2 className="w-4 h-4 text-emerald-400 mt-0.5 group-hover:scale-110 transition-transform" />
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                            Sell Your Car
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Get your car inspected and approved for sale in under 2 hours
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: Latest Arrivals Showcase */}
                  <div className="col-span-7 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Latest Arrivals On Sale
                      </span>
                      <Link
                        href="/buy"
                        className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <span>View all marketplace</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Sale Car 1 */}
                      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-400/50 transition group flex flex-col justify-between">
                        <div className="relative h-28 w-full bg-slate-950 overflow-hidden">
                          <img
                            src="/images/cars/toyota-prado.webp"
                            alt="Toyota Land Cruiser Prado TX-L 2021"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase">
                            72-Hr Hold Ready
                          </div>
                        </div>
                        <div className="p-3.5 space-y-2">
                          <div>
                            <h4 className="text-xs font-black text-white group-hover:text-amber-400 transition-colors">
                              Toyota Prado TX-L (2021)
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              42,000 km &bull; Diesel &bull; Clear TRA Title
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                            <div>
                              <span className="text-[10px] text-slate-500 block leading-tight">Full Price</span>
                              <span className="text-xs font-extrabold text-amber-400 font-mono">
                                TZS 145M
                              </span>
                            </div>
                            <Link
                              href="/buy/f47ac10b-58cc-4372-a567-0e02b2c3d479"
                              className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-[11px] hover:bg-amber-300 transition"
                            >
                              Hold TZS 1.3M
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Sale Car 2 */}
                      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-400/50 transition group flex flex-col justify-between">
                        <div className="relative h-28 w-full bg-slate-950 overflow-hidden">
                          <img
                            src="https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=80"
                            alt="Toyota Alphard Executive Lounge"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase">
                            VIP Luxury
                          </div>
                        </div>
                        <div className="p-3.5 space-y-2">
                          <div>
                            <h4 className="text-xs font-black text-white group-hover:text-amber-400 transition-colors">
                              Toyota Alphard Executive (2017)
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              54,000 km &bull; Petrol &bull; Captain Recliners
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                            <div>
                              <span className="text-[10px] text-slate-500 block leading-tight">Full Price</span>
                              <span className="text-xs font-extrabold text-amber-400 font-mono">
                                TZS 62M
                              </span>
                            </div>
                            <Link
                              href="/buy/2b0e6e70-6211-11eb-ae93-0242ac130002"
                              className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-[11px] hover:bg-amber-300 transition"
                            >
                              Hold TZS 1.3M
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------------- */}
              {/* 4. MORE DROPDOWN MENU                                             */}
              {/* ----------------------------------------------------------------- */}
              {activeMenu === "more" && (
                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-4 border-r border-slate-800 pr-8 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" /> DriverConnect Hub
                    </span>
                    <h3 className="text-lg font-bold text-white">Support &amp; Platform Operations</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Questions regarding M-Pesa &amp; bank payouts, vehicle delivery dispatch, or TRA clearance.
                    </p>
                    <div className="pt-2">
                      <a
                        href="tel:+255700000000"
                        className="inline-flex items-center gap-2 text-xs font-extrabold text-amber-400 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl hover:border-amber-400/50 transition"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> +255 700 000 000
                      </a>
                    </div>
                  </div>

                  <div className="col-span-4 space-y-2">
                    <Link
                      className="p-3 rounded-lg hover:bg-slate-900 transition flex items-center justify-between group"
                      href="/how-it-works"
                    >
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-400">
                        How Car Rentals Work
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-600 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      className="p-3 rounded-lg hover:bg-slate-900 transition flex items-center justify-between group"
                      href="/account/list-car"
                    >
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-400">
                        Car Owner Guide &amp; Earnings
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-600 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      className="p-3 rounded-lg hover:bg-slate-900 transition flex items-center justify-between group"
                      href="/terms"
                    >
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-400">
                        3-Tier Refund &amp; Cancellation Policy
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-600 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      className="p-3 rounded-lg hover:bg-slate-900 transition flex items-center justify-between group"
                      href="/contact"
                    >
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-400">
                        Contact Support &amp; Office Visit
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-600 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* AI Assistant Highlight Card */}
                  <div className="col-span-4 bg-slate-900/70 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        Voice Assistant
                      </span>
                      <h4 className="text-sm font-extrabold text-white">
                        Prefer to talk? Ava books for you
                      </h4>
                      <p className="text-xs text-slate-400">
                        Tap &ldquo;Talk to us&rdquo; at the bottom of any page to search, book, or check repairs by voice 24/7.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleTriggerVoice}
                      className="mt-4 text-center py-2.5 px-4 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Talk with Ava</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MOBILE COLLAPSIBLE DRAWER ACCORDION                                      */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-3 max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 text-sm font-bold text-slate-200 hover:text-amber-400 rounded-lg hover:bg-slate-900 transition"
            >
              Home
            </Link>

            {/* Mobile: Repair & Service Accordion */}
            <div className="border-b border-slate-900 pb-1">
              <button
                type="button"
                onClick={() =>
                  setMobileExpanded((prev) => (prev === "repair" ? null : "repair"))
                }
                className="w-full flex items-center justify-between py-2 px-3 text-sm font-bold text-slate-200 hover:text-amber-400 rounded-lg hover:bg-slate-900 transition"
              >
                <span>Repair &amp; Service</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    mobileExpanded === "repair" ? "rotate-180 text-amber-400" : ""
                  }`}
                />
              </button>
              {mobileExpanded === "repair" && (
                <div className="pl-5 pr-2 py-2 space-y-2 bg-slate-900/40 rounded-xl my-1">
                  <Link
                    href="/repair"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs font-semibold text-amber-400 py-1"
                  >
                    &bull; Book a Repair Slot
                  </Link>
                  <Link
                    href="/repair#services"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs text-slate-300 py-1"
                  >
                    &bull; All Services &amp; Prices
                  </Link>
                  <Link
                    href="/account/dashboard?tab=repairs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs text-slate-300 py-1"
                  >
                    &bull; Track My Repair
                  </Link>
                  <Link
                    href="/repair?service=oil-change"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs text-slate-300 py-1"
                  >
                    &bull; Oil &amp; Filter Change (TZS 85,000)
                  </Link>
                  <Link
                    href="/repair?service=diagnostics"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs text-slate-300 py-1"
                  >
                    &bull; Engine Diagnostics (TZS 50,000)
                  </Link>
                  <Link
                    href="/repair?service=brake-overhaul"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs text-slate-300 py-1"
                  >
                    &bull; Brake Inspection (TZS 120,000)
                  </Link>
                  <Link
                    href="/repair?service=tyre-fitting"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs text-slate-300 py-1"
                  >
                    &bull; Tyre Fitting &amp; Alignment (TZS 40,000)
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile: Rent a Car Accordion */}
            <div className="border-b border-slate-900 pb-1">
              <button
                type="button"
                onClick={() =>
                  setMobileExpanded((prev) => (prev === "rent" ? null : "rent"))
                }
                className="w-full flex items-center justify-between py-2 px-3 text-sm font-bold text-slate-200 hover:text-amber-400 rounded-lg hover:bg-slate-900 transition"
              >
                <span>Rent a Car</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    mobileExpanded === "rent" ? "rotate-180 text-amber-400" : ""
                  }`}
                />
              </button>
              {mobileExpanded === "rent" && (
                <div className="pl-5 pr-2 py-2 space-y-2 bg-slate-900/40 rounded-xl my-1">
                  <Link
                    href="/rent"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs font-semibold text-amber-400 py-1"
                  >
                    &bull; Find a Car (Full Fleet)
                  </Link>
                  <Link
                    href="/how-it-works"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs text-slate-300 py-1"
                  >
                    &bull; How Renting Works
                  </Link>
                  <Link
                    href="/rent?filter=chauffeur"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs text-slate-300 py-1"
                  >
                    &bull; Delivery &amp; Drivers
                  </Link>
                  <Link
                    href="/account/list-car"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs text-slate-300 py-1"
                  >
                    &bull; Rent Out Your Car
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile: Buy a Car Accordion */}
            <div className="border-b border-slate-900 pb-1">
              <button
                type="button"
                onClick={() =>
                  setMobileExpanded((prev) => (prev === "buy" ? null : "buy"))
                }
                className="w-full flex items-center justify-between py-2 px-3 text-sm font-bold text-slate-200 hover:text-amber-400 rounded-lg hover:bg-slate-900 transition"
              >
                <span>Buy a Car</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    mobileExpanded === "buy" ? "rotate-180 text-amber-400" : ""
                  }`}
                />
              </button>
              {mobileExpanded === "buy" && (
                <div className="pl-5 pr-2 py-2 space-y-2 bg-slate-900/40 rounded-xl my-1">
                  <Link
                    href="/buy"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs font-semibold text-amber-400 py-1"
                  >
                    &bull; Cars for Sale (Certified)
                  </Link>
                  <Link
                    href="/contact?subject=test-drive"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs text-slate-300 py-1"
                  >
                    &bull; Book a Test Drive
                  </Link>
                  <Link
                    href="/account/list-car"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs text-slate-300 py-1"
                  >
                    &bull; Sell Your Car (P2P)
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile: Direct More Links */}
            <div className="pt-2 space-y-1">
              <Link
                href="/account/dashboard?tab=wallet"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-3 text-xs font-semibold text-slate-300 hover:text-amber-400"
              >
                <Wallet className="w-4 h-4 text-amber-400" />
                <span>Wallet Dashboard</span>
              </Link>
              <a
                href="tel:+255700000000"
                className="flex items-center gap-2 py-2 px-3 text-xs font-semibold text-amber-400"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Helpline (+255 700 000 000)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default HeaderMegaMenu;
