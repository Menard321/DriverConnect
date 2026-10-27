import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, ShieldCheck, Clock, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border/80 bg-card/60 backdrop-blur-md text-card-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-amber-300 flex items-center justify-center text-slate-950 font-black text-lg shadow-md">
                DC
              </div>
              <span className="font-extrabold text-xl tracking-wider uppercase text-foreground">
                Driver<span className="text-primary">Connect</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tanzania’s premier unified automotive platform. Certified car rentals, peer-to-peer verified marketplace, computerized workshop repairs, and autonomous AI voice assistance in TZS.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <ShieldCheck className="w-4 h-4" />
              100% Guaranteed TZS Pricing & Instant Booking Lock
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Platform Verticals</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Car Rentals (Self-drive & Chauffeur)</Link></li>
              <li><Link href="/buy" className="hover:text-primary transition-colors">Vehicle Sales & 72-hr Hold</Link></li>
              <li><Link href="/repair" className="hover:text-primary transition-colors">Diagnostics & Mechanical Bays</Link></li>
              <li><Link href="/account/list-car" className="hover:text-primary transition-colors">List Your Car for Rent/Sale</Link></li>
            </ul>
          </div>

          {/* Pricing Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Tanzanian Pricing Standards</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center justify-between">
                <span>Driver Day Wage:</span>
                <span className="font-semibold text-foreground">TZS 50,000 / day</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Doorstep Delivery:</span>
                <span className="font-semibold text-foreground">TZS 3,500 / km</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Vehicle Reservation Hold:</span>
                <span className="font-semibold text-foreground">TZS 1,300,000</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Computerized Diagnostics:</span>
                <span className="font-semibold text-foreground">TZS 50,000</span>
              </li>
            </ul>
          </div>

          {/* Tanzanian Hubs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Hubs & Contact</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Masaki & Victoria, Dar es Salaam • Njiro, Arusha</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+255 700 000 000 / +255 680 112 233</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>concierge@driverconnect.co.tz</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span>24/7 Roadside Assistance & Booking Desk</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} DriverConnect Tanzania. All rights reserved. Multi-currency settlement in TZS & USD.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Chauffeur Standards</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
