'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/themeContext';
import { formatTZS } from '@/lib/formatters';
import {
  Car,
  ShoppingBag,
  Wrench,
  Wallet,
  Shield,
  Sun,
  Moon,
  ChevronDown,
  Sparkles,
  MapPin,
  Phone,
  FileText,
  UserCheck,
  Truck,
  PlusCircle,
  Clock,
  Layers,
  Palette,
  CheckCircle2,
  Menu,
  X,
  ArrowRight,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { theme, setTheme, isDark, setIsDark, walletBalance, appearance } = useTheme();
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (menuKey: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setActiveMegaMenu(menuKey);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 200);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-amber-300 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            DC
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-wider uppercase text-foreground">
              Driver<span className="text-primary">Connect</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground -mt-1">
              Tanzania • TZS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation with Hover Mega Menu Triggers */}
        <nav className="hidden lg:flex items-center gap-1">
          {/* 1. Rentals Mega Menu Trigger */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('rentals')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMegaMenu === 'rentals' || pathname.startsWith('/rent')
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              <Car className="w-4 h-4" />
              Rentals
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeMegaMenu === 'rentals' ? 'rotate-180 text-primary' : ''}`} />
            </button>

            <AnimatePresence>
              {activeMegaMenu === 'rentals' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 top-full pt-2 w-[540px]"
                >
                  <div className="p-5 rounded-3xl bg-card border border-border shadow-2xl glass-dropdown space-y-4">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Fleet Rentals in Tanzania</h4>
                        <p className="text-xs text-muted-foreground">Doorstep delivery & professional chauffeur services</p>
                      </div>
                      <span className="text-[11px] font-bold text-primary uppercase bg-primary/10 px-2.5 py-0.5 rounded-full">
                        TZS Guaranteed
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/#inventory-grid"
                        onClick={() => setActiveMegaMenu(null)}
                        className="p-3 rounded-2xl bg-secondary/40 hover:bg-secondary/80 border border-border/50 transition-all space-y-1 group"
                      >
                        <div className="text-xs font-bold text-foreground group-hover:text-primary flex items-center justify-between">
                          <span>Compact & Economy</span>
                          <span className="text-[10px] text-primary">From 75K/day</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Toyota IST, Vitz, Passo with high fuel economy (1.5L).</p>
                      </Link>

                      <Link
                        href="/#inventory-grid"
                        onClick={() => setActiveMegaMenu(null)}
                        className="p-3 rounded-2xl bg-secondary/40 hover:bg-secondary/80 border border-border/50 transition-all space-y-1 group"
                      >
                        <div className="text-xs font-bold text-foreground group-hover:text-primary flex items-center justify-between">
                          <span>Executive SUVs</span>
                          <span className="text-[10px] text-primary">From 150K/day</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Toyota Harrier, RAV4, Vanguard with modern luxury.</p>
                      </Link>

                      <Link
                        href="/#inventory-grid"
                        onClick={() => setActiveMegaMenu(null)}
                        className="p-3 rounded-2xl bg-secondary/40 hover:bg-secondary/80 border border-border/50 transition-all space-y-1 group"
                      >
                        <div className="text-xs font-bold text-foreground group-hover:text-primary flex items-center justify-between">
                          <span>Safari 4x4 & Luxury</span>
                          <span className="text-[10px] text-primary">From 350K/day</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Prado TX-L, Land Cruiser V8, heavy-duty Hilux 4x4.</p>
                      </Link>

                      <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
                        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-primary" />
                          <span>Chauffeur Service</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Add an experienced driver for <strong>TZS 50,000 / day</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-background border border-border flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Truck className="w-4 h-4 text-primary" />
                        <span>Doorstep Delivery: <strong>TZS 3,500 / km</strong></span>
                      </div>
                      <Link
                        href="/#inventory-grid"
                        onClick={() => setActiveMegaMenu(null)}
                        className="font-bold text-primary flex items-center gap-1 hover:underline"
                      >
                        Browse All Cars <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Sales & Marketplace Mega Menu Trigger */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('sales')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMegaMenu === 'sales' || pathname.startsWith('/buy')
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Sales & Marketplace
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeMegaMenu === 'sales' ? 'rotate-180 text-primary' : ''}`} />
            </button>

            <AnimatePresence>
              {activeMegaMenu === 'sales' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 top-full pt-2 w-[540px]"
                >
                  <div className="p-5 rounded-3xl bg-card border border-border shadow-2xl glass-dropdown space-y-4">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Vehicle Sales & P2P Portal</h4>
                        <p className="text-xs text-muted-foreground">Certified 150-point inspection and instant reservation hold</p>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                        72-hr Hold
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/buy"
                        onClick={() => setActiveMegaMenu(null)}
                        className="p-3 rounded-2xl bg-secondary/40 hover:bg-secondary/80 border border-border/50 transition-all space-y-1 group"
                      >
                        <div className="text-xs font-bold text-foreground group-hover:text-primary">
                          Verified Vehicles For Sale
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Pre-owned cars with TRA verified title cards and roadworthiness certificates.
                        </p>
                      </Link>

                      <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
                        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-primary" />
                          <span>Anti-Double-Sale Lock</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Hold any vehicle for 72 hrs with <strong>TZS 1,300,000 hold</strong> via Stripe.
                        </p>
                      </div>

                      <Link
                        href="/buy/f47ac10b-58cc-4372-a567-0e02b2c3d479"
                        onClick={() => setActiveMegaMenu(null)}
                        className="p-3 rounded-2xl bg-secondary/40 hover:bg-secondary/80 border border-border/50 transition-all space-y-1 group"
                      >
                        <div className="text-xs font-bold text-foreground group-hover:text-primary">
                          Schedule Showroom Test Drive
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Test-drive at Masaki Hub (Dar) or Njiro Hub (Arusha).
                        </p>
                      </Link>

                      <Link
                        href="/account/list-car"
                        onClick={() => setActiveMegaMenu(null)}
                        className="p-3 rounded-2xl bg-secondary/40 hover:bg-secondary/80 border border-border/50 transition-all space-y-1 group"
                      >
                        <div className="text-xs font-bold text-foreground group-hover:text-primary flex items-center gap-1.5">
                          <PlusCircle className="w-3.5 h-3.5 text-primary" />
                          <span>Sell Your Car (P2P)</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          List for sale or rental with admin review queue protection.
                        </p>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Auto Repair Mega Menu Trigger */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('repair')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMegaMenu === 'repair' || pathname.startsWith('/repair')
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              <Wrench className="w-4 h-4" />
              Repair & Bays
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeMegaMenu === 'repair' ? 'rotate-180 text-primary' : ''}`} />
            </button>

            <AnimatePresence>
              {activeMegaMenu === 'repair' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 top-full pt-2 w-[520px]"
                >
                  <div className="p-5 rounded-3xl bg-card border border-border shadow-2xl glass-dropdown space-y-4">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Workshop Diagnostics & Bay Booking</h4>
                        <p className="text-xs text-muted-foreground">Certified technician bays • Pay online or at shop</p>
                      </div>
                      <span className="text-[11px] font-bold text-primary uppercase bg-primary/10 px-2.5 py-0.5 rounded-full">
                        Victoria Hub
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/repair"
                        onClick={() => setActiveMegaMenu(null)}
                        className="p-3 rounded-2xl bg-secondary/40 hover:bg-secondary/80 border border-border/50 transition-all space-y-1 group"
                      >
                        <div className="text-xs font-bold text-foreground group-hover:text-primary flex items-center justify-between">
                          <span>Computerized Diagnostics</span>
                          <span className="text-[10px] text-primary">TZS 50,000</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Full OBD-II ECU code scanning and live telemetry readout.</p>
                      </Link>

                      <Link
                        href="/repair"
                        onClick={() => setActiveMegaMenu(null)}
                        className="p-3 rounded-2xl bg-secondary/40 hover:bg-secondary/80 border border-border/50 transition-all space-y-1 group"
                      >
                        <div className="text-xs font-bold text-foreground group-hover:text-primary flex items-center justify-between">
                          <span>Synthetic Oil Service</span>
                          <span className="text-[10px] text-primary">TZS 85,000</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">OEM filter replacement and 100% synthetic fluid flush.</p>
                      </Link>

                      <Link
                        href="/repair"
                        onClick={() => setActiveMegaMenu(null)}
                        className="p-3 rounded-2xl bg-secondary/40 hover:bg-secondary/80 border border-border/50 transition-all space-y-1 group"
                      >
                        <div className="text-xs font-bold text-foreground group-hover:text-primary flex items-center justify-between">
                          <span>AC Recharge & Leaks</span>
                          <span className="text-[10px] text-primary">TZS 95,000</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">R134a gas refrigerant top-up and condenser pressure test.</p>
                      </Link>

                      <Link
                        href="/repair"
                        onClick={() => setActiveMegaMenu(null)}
                        className="p-3 rounded-2xl bg-secondary/40 hover:bg-secondary/80 border border-border/50 transition-all space-y-1 group"
                      >
                        <div className="text-xs font-bold text-foreground group-hover:text-primary flex items-center justify-between">
                          <span>Brake Systems & Discs</span>
                          <span className="text-[10px] text-primary">TZS 120,000</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Ceramic pads replacement, rotor machining, and bleed.</p>
                      </Link>
                    </div>

                    <div className="p-3 rounded-2xl bg-background border border-border flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>Operating Hours: <strong>Mon - Sat (08:00 - 17:00)</strong></span>
                      </div>
                      <Link
                        href="/repair"
                        onClick={() => setActiveMegaMenu(null)}
                        className="font-bold text-primary hover:underline"
                      >
                        Book Bay Slot →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. Support & Hubs Mega Menu Trigger */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('support')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMegaMenu === 'support'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              <Shield className="w-4 h-4" />
              Support & Hubs
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeMegaMenu === 'support' ? 'rotate-180 text-primary' : ''}`} />
            </button>

            <AnimatePresence>
              {activeMegaMenu === 'support' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 top-full pt-2 w-[500px]"
                >
                  <div className="p-5 rounded-3xl bg-card border border-border shadow-2xl glass-dropdown space-y-4">
                    <div className="border-b border-border/60 pb-3">
                      <h4 className="text-sm font-bold text-foreground">DriverConnect Tanzania Hubs</h4>
                      <p className="text-xs text-muted-foreground">24/7 Roadside Assistance & Customer Concierge</p>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="p-3 rounded-2xl bg-secondary/40 border border-border/40 flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-foreground">Dar es Salaam Main Hub</div>
                          <div className="text-muted-foreground">Masaki Peninsula & Victoria Service Station</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-secondary/40 border border-border/40 flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-foreground">Arusha Safari Hub</div>
                          <div className="text-muted-foreground">Njiro Complex, Safari Departure Point</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between text-foreground font-semibold">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary" />
                          <span>24/7 Hotline: +255 700 000 000</span>
                        </div>
                        <span className="text-[10px] text-primary uppercase font-bold">SMS & WA</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Direct Links */}
          <Link
            href="/account/dashboard"
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              pathname.startsWith('/account/dashboard')
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Dashboard
          </Link>

          <Link
            href="/admin"
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              pathname.startsWith('/admin')
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Admin
          </Link>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Appearance Studio Shortcut */}
          <Link
            href="/admin/appearance"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary border border-border hover:border-primary/40 text-foreground text-xs font-bold transition-all"
            title="Appearance & Branding Studio"
          >
            <Palette className="w-3.5 h-3.5 text-primary" />
            <span>Studio</span>
          </Link>

          {/* Digital Wallet Badge */}
          <Link
            href="/account/dashboard"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all text-xs font-bold"
            title="DriverConnect Digital Wallet Balance"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wallet:</span>
            <span>{formatTZS(walletBalance)}</span>
          </Link>

          {/* Theme Accent Dots */}
          <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-secondary border border-border text-xs">
            <button
              onClick={() => setTheme('amber')}
              className={`w-5 h-5 rounded-lg bg-amber-500 transition-all ${
                theme === 'amber' ? 'ring-2 ring-primary ring-offset-1' : 'opacity-70 hover:opacity-100'
              }`}
              title="Amber Gold"
            />
            <button
              onClick={() => setTheme('emerald')}
              className={`w-5 h-5 rounded-lg bg-emerald-600 transition-all ${
                theme === 'emerald' ? 'ring-2 ring-primary ring-offset-1' : 'opacity-70 hover:opacity-100'
              }`}
              title="Emerald Green"
            />
            <button
              onClick={() => setTheme('blue')}
              className={`w-5 h-5 rounded-lg bg-blue-600 transition-all ${
                theme === 'blue' ? 'ring-2 ring-primary ring-offset-1' : 'opacity-70 hover:opacity-100'
              }`}
              title="Electric Blue"
            />
            <button
              onClick={() => setTheme('rose')}
              className={`w-5 h-5 rounded-lg bg-rose-600 transition-all ${
                theme === 'rose' ? 'ring-2 ring-primary ring-offset-1' : 'opacity-70 hover:opacity-100'
              }`}
              title="Rose Crimson"
            />
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-xl bg-secondary border border-border text-foreground hover:bg-muted transition-colors"
            title="Toggle Dark / Light Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Mobile Drawer Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-secondary border border-border text-foreground"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden p-4 border-t border-border bg-card/95 backdrop-blur-2xl space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-border">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-secondary text-xs font-bold text-foreground flex items-center gap-2"
            >
              <Car className="w-4 h-4 text-primary" /> Rentals
            </Link>
            <Link
              href="/buy"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-secondary text-xs font-bold text-foreground flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-primary" /> Buy a Car
            </Link>
            <Link
              href="/repair"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-secondary text-xs font-bold text-foreground flex items-center gap-2"
            >
              <Wrench className="w-4 h-4 text-primary" /> Auto Repair
            </Link>
            <Link
              href="/account/list-car"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-secondary text-xs font-bold text-foreground flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-primary" /> List Car (P2P)
            </Link>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              href="/account/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              My Dashboard
            </Link>
            <Link
              href="/admin/appearance"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-bold text-primary hover:underline"
            >
              Appearance Studio →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
