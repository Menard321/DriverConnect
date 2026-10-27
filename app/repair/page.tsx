'use client';

import React, { useState } from 'react';
import {
  Wrench,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  MapPin,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { INITIAL_SERVICES } from '@/lib/mockData';
import { formatTZS } from '@/lib/formatters';
import { EmbeddedCheckoutModal } from '@/components/checkout/EmbeddedCheckoutModal';

export default function RepairBookingPage() {
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(['s1-diag']);
  const [licensePlate, setLicensePlate] = useState<string>('T 419 DWL');
  const [odometerKm, setOdometerKm] = useState<string>('68000');
  const [serviceNotes, setServiceNotes] = useState<string>('Check front right suspension clunk and change oil.');
  const [appointmentDate, setAppointmentDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [bayTimeSlot, setBayTimeSlot] = useState<string>('09:00 AM - 10:30 AM');
  const [workshopBranch, setWorkshopBranch] = useState<string>('Victoria Service Center, Dar es Salaam');
  const [paymentRouting, setPaymentRouting] = useState<'pay_online' | 'pay_at_shop'>('pay_online');

  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [bookingSuccessId, setBookingSuccessId] = useState<string | null>(null);

  // Toggle selected repair service
  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Calculate total price and estimated duration in TZS
  const selectedServices = INITIAL_SERVICES.filter((s) => selectedServiceIds.includes(s.id));
  const totalAmountTZS = selectedServices.reduce((sum, s) => sum + s.base_price, 0);
  const totalDurationMinutes = selectedServices.reduce((sum, s) => sum + s.estimated_duration_minutes, 0);

  const handleBookAtShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServiceIds.length === 0) {
      alert('Please select at least one repair or diagnostic service.');
      return;
    }
    const mockId = `DC-REP-${Date.now().toString().slice(-6)}`;
    setBookingSuccessId(mockId);
  };

  const timeSlots = [
    '08:30 AM - 10:00 AM',
    '10:30 AM - 12:00 PM',
    '01:00 PM - 02:30 PM',
    '03:00 PM - 04:30 PM',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
          <Wrench className="w-4 h-4" />
          Master Automotive Diagnostics & Service Bays • Tanzania
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-foreground">
          Auto Repair & Diagnostics
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Book certified mechanics with digital bay scheduling. Clear pricing in TZS with genuine OEM parts, transparent labor quotes, and digital health checklists.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Multi-Service Selector */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-border bg-card shadow-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">1. Select Maintenance & Repair Services</h2>
                <p className="text-xs text-muted-foreground">Select one or more specialized procedures</p>
              </div>
              <span className="text-xs font-bold text-primary px-3 py-1 rounded-full bg-primary/10">
                {selectedServiceIds.length} Selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {INITIAL_SERVICES.map((srv) => {
                const isSelected = selectedServiceIds.includes(srv.id);
                return (
                  <div
                    key={srv.id}
                    onClick={() => toggleService(srv.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-primary/10 border-primary shadow-md shadow-primary/10'
                        : 'bg-background border-border hover:bg-secondary/60'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                          {srv.category}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                            isSelected
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-border'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                      </div>
                      <h4 className="font-bold text-sm text-foreground">{srv.name}</h4>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                      <span className="text-xs font-black text-primary">{formatTZS(srv.base_price)}</span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {srv.estimated_duration_minutes} mins
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vehicle Information Inputs */}
          <div className="rounded-3xl border border-border bg-card shadow-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-foreground">2. Vehicle Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                  License Plate
                </label>
                <input
                  type="text"
                  required
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  placeholder="e.g. T 419 DWL"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-semibold uppercase focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                  Current Odometer (km)
                </label>
                <input
                  type="number"
                  value={odometerKm}
                  onChange={(e) => setOdometerKm(e.target.value)}
                  placeholder="e.g. 68000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-semibold focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                Symptoms / Specific Notes for Mechanic
              </label>
              <textarea
                rows={2}
                value={serviceNotes}
                onChange={(e) => setServiceNotes(e.target.value)}
                placeholder="Describe any noises, leaks, check engine light behavior..."
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Workshop Bay Slot & Payment Routing */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-border bg-card shadow-2xl p-6 space-y-6 backdrop-blur-xl">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground">3. Bay Slot & Schedule</h2>
              <p className="text-xs text-muted-foreground">Operating Hours: Mon - Sat (08:00 - 17:00)</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                  Service Center Location
                </label>
                <select
                  value={workshopBranch}
                  onChange={(e) => setWorkshopBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-semibold focus:outline-none focus:border-primary"
                >
                  <option>Victoria Service Center, Dar es Salaam</option>
                  <option>Masaki Main Workshop, Dar es Salaam</option>
                  <option>Njiro Industrial Hub, Arusha</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                  Appointment Date
                </label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">
                  Available Bay Time Slot
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setBayTimeSlot(slot)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                        bayTimeSlot === slot
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-background border-border text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Routing Choice */}
            <div className="space-y-3 pt-3 border-t border-border">
              <label className="text-xs font-bold uppercase text-muted-foreground block">
                Payment Option
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setPaymentRouting('pay_online')}
                  className={`p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                    paymentRouting === 'pay_online'
                      ? 'bg-primary/10 border-primary text-foreground'
                      : 'bg-background border-border text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 text-primary">
                    <Sparkles className="w-3.5 h-3.5" />
                    Pay Online Now
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Card / Instant lock</div>
                </div>

                <div
                  onClick={() => setPaymentRouting('pay_at_shop')}
                  className={`p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                    paymentRouting === 'pay_at_shop'
                      ? 'bg-primary/10 border-primary text-foreground'
                      : 'bg-background border-border text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 text-foreground">
                    <CreditCard className="w-3.5 h-3.5" />
                    Pay at Shop
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Pay upon drop-off</div>
                </div>
              </div>
            </div>

            {/* Total Summary */}
            <div className="p-4 rounded-2xl bg-background border border-border space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Selected Procedures:</span>
                <span className="font-bold text-foreground">{selectedServices.length}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Est. Shop Duration:</span>
                <span className="font-bold text-foreground">~{totalDurationMinutes} mins</span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between items-center text-sm font-bold text-foreground">
                <span>Total Service Estimate:</span>
                <span className="text-lg text-primary font-black">{formatTZS(totalAmountTZS)}</span>
              </div>
            </div>

            {/* Submit Action */}
            {paymentRouting === 'pay_online' ? (
              <button
                onClick={() => setIsCheckoutOpen(true)}
                disabled={totalAmountTZS === 0}
                className="w-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary-hover text-primary-foreground font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                Pay {formatTZS(totalAmountTZS)} Online
              </button>
            ) : (
              <button
                onClick={handleBookAtShop}
                disabled={totalAmountTZS === 0}
                className="w-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary-hover text-primary-foreground font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Bay Reservation (Pay at Shop)
              </button>
            )}

            {bookingSuccessId && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center space-y-1">
                <div className="font-bold text-sm">Bay Slot #{bookingSuccessId} Reserved!</div>
                <div>
                  Please bring your vehicle ({licensePlate}) to {workshopBranch} on {appointmentDate} at {bayTimeSlot}.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Checkout for Online Pay */}
      <EmbeddedCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        vehicleTitle={`Auto Repair (${selectedServices.map((s) => s.name).join(', ')})`}
        totalAmountTZS={totalAmountTZS}
        bookingType="repair_service"
        onPaymentSuccess={(id) => {
          setBookingSuccessId(id);
          setIsCheckoutOpen(false);
        }}
      />
    </div>
  );
}
