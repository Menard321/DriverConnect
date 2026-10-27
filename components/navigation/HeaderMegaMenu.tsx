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
  MapPin,
  LogIn,
  User,
  LogOut,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type ActiveMenu = "services" | "rentals" | "sales" | "more" | null;

export function HeaderMegaMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const isAccountRoute = pathname?.startsWith("/account");
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Authentication & Profile States
  const [user, setUser] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 1. Fetch live user & wallet balance on mount and subscribe to changes
  useEffect(() => {
    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchWallet(session.user.id, session.user);
        } else {
          setUser(null);
          setWalletBalance(null);
        }
        setAuthLoading(false);
      }
    );

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
    }, 180);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link className="flex items-center gap-2 group" href="/">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Car className="w-6 h-6 text-slate-950"/>
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
          <nav className="hidden lg:flex items-center gap-1 h-full" onMouseLeave={handleMouseLeave}>
            <Link className="px-4 py-2 rounded-lg text-sm font-semibold hover:text-amber-400 transition" href="/">
              Home
            </Link>

            <div className="relative h-full flex items-center" onMouseEnter={() => handleMouseEnter("services")}>
              <button className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                activeMenu === "services" ? "text-amber-400 bg-slate-900" : "text-slate-200 hover:text-amber-400"
              }`}>
                <span>Services & Repairs</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeMenu === "services" ? "rotate-180 text-amber-400" : ""}`} />
              </button>
            </div>

            <div className="relative h-full flex items-center" onMouseEnter={() => handleMouseEnter("rentals")}>
              <button className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                activeMenu === "rentals" ? "text-amber-400 bg-slate-900" : "text-slate-200 hover:text-amber-400"
              }`}>
                <span>Rent a Car</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeMenu === "rentals" ? "rotate-180 text-amber-400" : ""}`} />
              </button>
            </div>

            <div className="relative h-full flex items-center" onMouseEnter={() => handleMouseEnter("sales")}>
              <button className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                activeMenu === "sales" ? "text-amber-400 bg-slate-900" : "text-slate-200 hover:text-amber-400"
              }`}>
                <span>Buy & Sell</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeMenu === "sales" ? "rotate-180 text-amber-400" : ""}`} />
              </button>
            </div>

            <div className="relative h-full flex items-center" onMouseEnter={() => handleMouseEnter("more")}>
              <button className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                activeMenu === "more" ? "text-amber-400 bg-slate-900" : "text-slate-200 hover:text-amber-400"
              }`}>
                <span>More</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeMenu === "more" ? "rotate-180 text-amber-400" : ""}`} />
              </button>
            </div>
          </nav>

          {/* User Status & Action Controls */}
          <div className="flex items-center gap-3">
            
            {/* 1. Wallet Balance: Rendered on all pages EXCEPT /account/* where dashboard capsule is already present */}
            {!authLoading && user && walletBalance !== null && !isAccountRoute && (
              <Link className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold hover:border-amber-400/50 transition group shadow-inner" href="/account/dashboard?tab=wallet">
                <Wallet className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform"/>
                <span className="text-slate-400">Wallet:</span>
                <span className="text-amber-400 font-bold font-mono">
                  TZS {walletBalance.toLocaleString()}
                </span>
              </Link>
            )}

            {/* 3. Conditional Auth Gateway */}
            {authLoading ? (
              <div className="w-24 h-9 bg-slate-900 animate-pulse rounded-lg" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 transition text-white" href="/account/dashboard">
                  <User className="w-3.5 h-3.5 text-amber-400"/>
                  <span className="hidden sm:inline">My Account</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-500/30 text-slate-400 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4"/>
                </button>
              </div>
            ) : (
              <Link className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 transition shadow-lg shadow-amber-400/20 cursor-pointer" href="/login">
                <LogIn className="w-3.5 h-3.5"/>
                <span>Sign In</span>
              </Link>
            )}

          </div>
        </div>
      </div>

      {/* Flyout Mega Menu Dropdown */}
      <AnimatePresence>
        {activeMenu && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onMouseEnter={() => handleMouseEnter(activeMenu)}
            onMouseLeave={handleMouseLeave}
            className="absolute left-0 right-0 top-full w-full bg-slate-950 border-b border-slate-800 shadow-2xl overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {activeMenu === "services" && (
                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-4 border-r border-slate-800 pr-8 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5"/> Maintenance Operations
                    </span>
                    <h3 className="text-lg font-bold text-white">Workshop & Technical Services</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Precision maintenance with transparent pricing in Tanzanian Shillings, certified mechanics, and live bay scheduling.
                    </p>
                    <div className="space-y-2 pt-2">
                      <Link className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400/50 transition group" href="/repair">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-amber-400"/>
                          <span className="text-xs font-semibold text-white">Book a Repair Slot</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform"/>
                      </Link>
                    </div>
                  </div>

                  <div className="col-span-5 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Popular Packages</span>
                    <div className="grid grid-cols-1 gap-2.5">
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">Full Synthetic Oil & Filter Service</h4>
                          <span className="text-[11px] text-slate-400">45 mins &bull; Multi-point safety scan</span>
                        </div>
                        <span className="text-xs font-extrabold text-amber-400">TZS 85,000</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">Front & Rear Brake Pad Overhaul</h4>
                          <span className="text-[11px] text-slate-400">90 mins &bull; Rotor resurfacing check</span>
                        </div>
                        <span className="text-xs font-extrabold text-amber-400">TZS 120,000</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                        <Clock className="w-3.5 h-3.5"/> Working Hours
                      </div>
                      <p className="text-xs font-semibold text-white">Mon – Sat: 08:00 – 18:00</p>
                      <p className="text-[11px] text-slate-400 mt-1">Sundays reserved for emergency fleet repairs.</p>
                    </div>
                    <Link className="mt-4 text-center py-2 px-3 rounded-lg bg-slate-800 text-xs font-bold text-amber-400 hover:bg-slate-750 transition" href="/repair">
                      View Workshop Schedule &rarr;
                    </Link>
                  </div>
                </div>
              )}

              {activeMenu === "rentals" && (
                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-4 border-r border-slate-800 pr-8 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5"/> Fleet Rentals
                    </span>
                    <h3 className="text-lg font-bold text-white">Chauffeur & Self-Drive Fleet</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Select self-drive or add an accredited chauffeur. Choose between an instant 20% deposit hold or full payment with a 5% discount.
                    </p>
                  </div>

                  <div className="col-span-5 space-y-2.5">
                    <Link className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:bg-slate-900 transition flex justify-between items-center group" href="/rent?type=economy">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-400">Economy (Toyota IST, Vitz)</h4>
                        <span className="text-[11px] text-slate-400">5 Seats &bull; Automatic</span>
                      </div>
                      <span className="text-xs font-extrabold text-amber-400">TZS 75,000 / day</span>
                    </Link>
                    <Link className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:bg-slate-900 transition flex justify-between items-center group" href="/rent?type=suv">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-400">Mid-Size SUV (Toyota Vanguard, RAV4)</h4>
                        <span className="text-[11px] text-slate-400">7 Seats &bull; 4WD</span>
                      </div>
                      <span className="text-xs font-extrabold text-amber-400">TZS 150,000 / day</span>
                    </Link>
                  </div>

                  <div className="col-span-3 bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block mb-1">Doorstep Delivery</span>
                      <p className="text-xs text-slate-400">Calculated transparently at TZS 3,500 / km across Dar es Salaam.</p>
                    </div>
                    <Link className="mt-4 text-center py-2.5 px-3 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition" href="/rent">
                      Browse Full Fleet &rarr;
                    </Link>
                  </div>
                </div>
              )}

              {activeMenu === "sales" && (
                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-4 border-r border-slate-800 pr-8 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5"/> Marketplace
                    </span>
                    <h3 className="text-lg font-bold text-white">Verified Automotive Sales</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Every showroom vehicle and P2P listing includes a 150-point inspection report and clear TRA title guarantee.
                    </p>
                  </div>

                  <div className="col-span-5 space-y-2.5">
                    <Link className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400/50 transition flex items-center justify-between group" href="/buy">
                      <div className="flex items-center gap-3">
                        <Car className="w-4 h-4 text-amber-400"/>
                        <div>
                          <h4 className="text-xs font-bold text-white">Browse Certified Inventory</h4>
                          <p className="text-[11px] text-slate-400">Clean titles & verified Tanzania TRA tax status</p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform"/>
                    </Link>
                    <Link className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400/50 transition flex items-center justify-between group" href="/account/list-car">
                      <div className="flex items-center gap-3">
                        <FileCheck2 className="w-4 h-4 text-blue-400"/>
                        <div>
                          <h4 className="text-xs font-bold text-white">List Your Car (P2P Seller)</h4>
                          <p className="text-[11px] text-slate-400">Approved in &lt;2 hrs by dealership staff</p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform"/>
                    </Link>
                  </div>

                  <div className="col-span-3 bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-400 block mb-1">Instant 72h Hold</span>
                      <p className="text-xs text-slate-400">Lock any sale car exclusively with a deductible TZS 1,300,000 reservation hold.</p>
                    </div>
                    <Link className="mt-4 text-center py-2 px-3 rounded-lg bg-slate-800 text-xs font-bold text-amber-400 hover:bg-slate-750 transition" href="/buy">
                      Marketplace &rarr;
                    </Link>
                  </div>
                </div>
              )}

              {activeMenu === "more" && (
                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-4 border-r border-slate-800 pr-8 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5"/> DriverConnect Help Desk
                    </span>
                    <h3 className="text-lg font-bold text-white">Support & Platform Operations</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Questions regarding M-Pesa payouts, vehicle delivery tracking, or TRA verification.
                    </p>
                  </div>
                  <div className="col-span-4 space-y-2">
                    <Link className="p-3 rounded-lg hover:bg-slate-900 transition flex items-center justify-between group" href="/how-it-works">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-400">How Car Rentals Work</span>
                      <ArrowRight className="w-3 h-3 text-slate-600 group-hover:translate-x-1 transition-transform"/>
                    </Link>
                    <Link className="p-3 rounded-lg hover:bg-slate-900 transition flex items-center justify-between group" href="/terms">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-400">3-Tier Refund & Cancellation Policy</span>
                      <ArrowRight className="w-3 h-3 text-slate-600 group-hover:translate-x-1 transition-transform"/>
                    </Link>
                  </div>
                  <div className="col-span-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-300 block mb-1">Central Helpline</span>
                      <p className="text-xs text-amber-400 font-extrabold flex items-center gap-1.5">
                        <PhoneCall className="w-3.5 h-3.5"/> +255 700 000 000
                      </p>
                      <p className="text-[11px] text-slate-400 mt-2">Active 24/7 for emergency roadside assistance.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default HeaderMegaMenu;
