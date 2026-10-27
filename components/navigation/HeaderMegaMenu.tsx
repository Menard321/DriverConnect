"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Car,
  ChevronDown,
  LogIn,
  Wallet,
  UserPlus,
  HelpCircle,
  ShieldCheck,
  PhoneCall,
  User,
  ArrowRight,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export function HeaderMegaMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const isAccountRoute = pathname?.startsWith("/account");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Authentication & Profile States
  const [user, setUser] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 1. Fetch live user & wallet balance on mount and subscribe to changes
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

  const handleMouseEnter = (menu: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 180);
  };

  const handleTriggerVoice = () => {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("trigger-voice-concierge");
      window.dispatchEvent(event);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 text-gray-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo */}
          <Link className="flex items-center gap-2 group" href="/">
            <div className="w-8 h-8 rounded-lg bg-[#e0533c] flex items-center justify-center text-white shadow-sm group-hover:bg-[#d04631] transition-colors">
              <Car className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900">
              Driver<span className="text-[#e0533c]">Connect</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-8 h-full"
            onMouseLeave={handleMouseLeave}
          >
            <Link
              className="text-sm font-semibold text-gray-700 hover:text-[#e0533c] transition-colors"
              href="/"
            >
              Home
            </Link>
            <Link
              className="text-sm font-semibold text-gray-700 hover:text-[#e0533c] transition-colors"
              href="/repair"
            >
              Repair &amp; Service
            </Link>
            <Link
              className="text-sm font-semibold text-gray-700 hover:text-[#e0533c] transition-colors"
              href="/rent"
            >
              Rent a Car
            </Link>
            <Link
              className="text-sm font-semibold text-gray-700 hover:text-[#e0533c] transition-colors"
              href="/buy"
            >
              Buy a Car
            </Link>

            {/* "More" Flyout Dropdown Trigger */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => handleMouseEnter("more")}
            >
              <button
                type="button"
                className={`flex items-center gap-1 text-sm font-semibold transition cursor-pointer ${
                  activeMenu === "more"
                    ? "text-[#e0533c]"
                    : "text-gray-700 hover:text-[#e0533c]"
                }`}
              >
                <span>More</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    activeMenu === "more" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* 2-Column "More" Flyout Dropdown (720px wide) */}
              {activeMenu === "more" && (
                <div
                  onMouseEnter={() => handleMouseEnter("more")}
                  onMouseLeave={handleMouseLeave}
                  className="absolute right-0 top-full mt-1 w-[720px] bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 z-50 grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  {/* Left Column: Menu Links with Subtitles */}
                  <div className="col-span-6 space-y-4 pr-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                      More
                    </span>

                    <Link
                      className="flex items-start gap-3 group"
                      href={user ? "/account/dashboard" : "/login"}
                    >
                      <LogIn className="w-4 h-4 text-gray-400 mt-0.5 group-hover:text-[#e0533c] transition-colors" />
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 group-hover:text-[#e0533c] transition-colors">
                          {user ? "My Dashboard" : "Sign in"}
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Bookings, payments and invoices
                        </p>
                      </div>
                    </Link>

                    <Link
                      className="flex items-start gap-3 group"
                      href="/account/dashboard?tab=wallet"
                    >
                      <Wallet className="w-4 h-4 text-gray-400 mt-0.5 group-hover:text-[#e0533c] transition-colors" />
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 group-hover:text-[#e0533c] transition-colors">
                          Wallet
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Add money and pay faster
                        </p>
                      </div>
                    </Link>

                    <Link
                      className="flex items-start gap-3 group"
                      href="/login?mode=signup"
                    >
                      <UserPlus className="w-4 h-4 text-gray-400 mt-0.5 group-hover:text-[#e0533c] transition-colors" />
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 group-hover:text-[#e0533c] transition-colors">
                          Create an account
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Takes a minute
                        </p>
                      </div>
                    </Link>

                    <Link
                      className="flex items-start gap-3 group"
                      href="/how-it-works"
                    >
                      <HelpCircle className="w-4 h-4 text-gray-400 mt-0.5 group-hover:text-[#e0533c] transition-colors" />
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 group-hover:text-[#e0533c] transition-colors">
                          How it works
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Booking, payments and cancellations
                        </p>
                      </div>
                    </Link>

                    <Link
                      className="flex items-start gap-3 group"
                      href="/account/list-car"
                    >
                      <ShieldCheck className="w-4 h-4 text-gray-400 mt-0.5 group-hover:text-[#e0533c] transition-colors" />
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 group-hover:text-[#e0533c] transition-colors">
                          Car owner guide
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Commission, payouts and policy
                        </p>
                      </div>
                    </Link>

                    <Link className="flex items-start gap-3 group" href="/contact">
                      <PhoneCall className="w-4 h-4 text-gray-400 mt-0.5 group-hover:text-[#e0533c] transition-colors" />
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 group-hover:text-[#e0533c] transition-colors">
                          Contact us
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Call +255 700 000 000 or visit us
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Right Column: AI Assistant Card */}
                  <div className="col-span-6 bg-[#fbf5f2] border border-[#f0ded8] rounded-2xl p-6 flex flex-col justify-between">
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#e0533c]">
                        Prefer to Talk?
                      </span>
                      <h3 className="text-base font-extrabold text-gray-900 leading-snug">
                        Our AI assistant books for you
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Tap &ldquo;Talk to us&rdquo; at the bottom of any page &mdash; 24/7.
                      </p>

                      <div className="w-full flex justify-center py-4">
                        <div className="relative w-36 h-20 bg-[#e0533c]/10 rounded-xl flex items-center justify-center">
                          <Car className="w-12 h-12 text-[#e0533c]" />
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/"
                      className="inline-flex items-center justify-center gap-1 w-full py-2.5 rounded-xl bg-[#e0533c] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#d04631] transition shadow-md cursor-pointer"
                    >
                      <span>Back to home</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Header: Phone & Sign In / Account */}
          <div className="flex items-center gap-4 sm:gap-6">
            <a
              href="tel:+255700000000"
              className="hidden lg:block text-xs font-bold text-gray-700 hover:text-[#e0533c] font-mono tracking-tight transition-colors"
            >
              +255 700 000 000
            </a>

            {/* Wallet Balance Chip for Logged In User */}
            {!authLoading && user && walletBalance !== null && !isAccountRoute && (
              <Link
                href="/account/dashboard?tab=wallet"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fbf5f2] border border-[#f0ded8] text-xs font-bold text-gray-700 hover:text-[#e0533c] transition"
              >
                <Wallet className="w-3.5 h-3.5 text-[#e0533c]" />
                <span>TZS {walletBalance.toLocaleString()}</span>
              </Link>
            )}

            {/* Conditional Auth Gateway */}
            {authLoading ? (
              <div className="w-20 h-8 bg-gray-100 animate-pulse rounded-lg" />
            ) : user ? (
              <div className="flex items-center gap-2">
                {user?.user_metadata?.role === "admin" ? (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-[#e0533c]/10 text-[#e0533c] border border-[#e0533c]/20 hover:bg-[#e0533c]/20 transition"
                    title="Administrator Control Console"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </Link>
                ) : (
                  <Link
                    href="/account/dashboard"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-gray-100 text-gray-800 hover:text-[#e0533c] hover:bg-gray-200 transition"
                  >
                    <User className="w-4 h-4 text-[#e0533c]" />
                    <span className="hidden sm:inline">My Account</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-red-50 hover:text-[#e0533c] text-gray-500 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-[#e0533c] transition"
              >
                <User className="w-4 h-4" />
                <span>Sign in</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-gray-200 text-gray-700 hover:text-[#e0533c] transition cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-sm font-bold text-gray-800 hover:text-[#e0533c] transition"
            >
              Home
            </Link>
            <Link
              href="/repair"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-sm font-bold text-gray-800 hover:text-[#e0533c] transition"
            >
              Repair &amp; Service
            </Link>
            <Link
              href="/rent"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-sm font-bold text-gray-800 hover:text-[#e0533c] transition"
            >
              Rent a Car
            </Link>
            <Link
              href="/buy"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-sm font-bold text-gray-800 hover:text-[#e0533c] transition"
            >
              Buy a Car
            </Link>
            <div className="border-t border-gray-100 my-2 pt-2 space-y-2">
              <Link
                href="/account/dashboard?tab=wallet"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-1.5 text-xs font-semibold text-gray-700 hover:text-[#e0533c]"
              >
                <Wallet className="w-4 h-4 text-[#e0533c]" />
                <span>Wallet</span>
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-1.5 text-xs font-semibold text-gray-700 hover:text-[#e0533c]"
              >
                <HelpCircle className="w-4 h-4 text-[#e0533c]" />
                <span>How it works</span>
              </Link>
              <Link
                href="/account/list-car"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-1.5 text-xs font-semibold text-gray-700 hover:text-[#e0533c]"
              >
                <ShieldCheck className="w-4 h-4 text-[#e0533c]" />
                <span>Car owner guide</span>
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-1.5 text-xs font-semibold text-gray-700 hover:text-[#e0533c]"
              >
                <PhoneCall className="w-4 h-4 text-[#e0533c]" />
                <span>Contact us (+255 700 000 000)</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default HeaderMegaMenu;
