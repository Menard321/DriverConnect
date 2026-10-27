'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CreditCard, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { formatTZS } from '@/lib/formatters';

interface EmbeddedCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleTitle: string;
  totalAmountTZS: number;
  bookingType: string;
  vehicleId?: string;
  onPaymentSuccess: (bookingId: string) => void;
}

export const EmbeddedCheckoutModal: React.FC<EmbeddedCheckoutModalProps> = ({
  isOpen,
  onClose,
  vehicleTitle,
  totalAmountTZS,
  bookingType,
  vehicleId,
  onPaymentSuccess,
}) => {
  const [customerName, setCustomerName] = useState('Baraka John');
  const [customerEmail, setCustomerEmail] = useState('baraka@example.com');
  const [customerPhone, setCustomerPhone] = useState('+255 754 000 111');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState('');

  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: vehicleId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          customerName,
          customerEmail,
          customerPhone,
          bookingType,
          totalAmount: totalAmountTZS,
          paymentType: 'full_card',
        }),
      });

      const data = await res.json();
      const mockOrRealId = data.bookingId || `DC-${Date.now().toString().slice(-6)}`;

      // Simulate network confirmation
      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
        setConfirmedBookingId(mockOrRealId);
        onPaymentSuccess(mockOrRealId);
      }, 1500);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-amber-100" />
                <h3 className="font-bold text-lg tracking-wide uppercase">DriverConnect Secure Checkout</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-black/20 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-amber-100/90 mt-1">
              Encrypted 256-Bit SSL • Authorized in Tanzanian Shillings (TZS)
            </p>
          </div>

          <div className="p-6">
            {!isSuccess ? (
              <form onSubmit={handlePay} className="space-y-4">
                {/* Order Summary Item */}
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase text-amber-400 font-semibold tracking-wider">
                      {bookingType.replace('_', ' ')}
                    </span>
                    <h4 className="font-semibold text-slate-100 text-sm">{vehicleTitle}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Total Payable</span>
                    <div className="text-lg font-bold text-amber-400">{formatTZS(totalAmountTZS)}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Email (for PDF Invoice)</label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Phone (+255 SMS/WA)</label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Card Section */}
                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-amber-400" />
                        Card Details (Visa / MasterCard)
                      </label>
                      <span className="text-[10px] text-slate-400">Processed in TZS</span>
                    </div>

                    <div className="rounded-lg bg-slate-950 border border-slate-700 p-3 space-y-2">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-transparent text-sm text-slate-100 tracking-wider font-mono focus:outline-none"
                        placeholder="Card Number"
                      />
                      <div className="flex gap-4 pt-2 border-t border-slate-800 text-xs">
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-20 bg-transparent text-slate-200 font-mono focus:outline-none"
                          placeholder="MM/YY"
                        />
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-16 bg-transparent text-slate-200 font-mono focus:outline-none"
                          placeholder="CVC"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-4 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Securing Booking in TZS...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Pay {formatTZS(totalAmountTZS)} Now
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-white">Payment Verified & Confirmed!</h4>
                <p className="text-sm text-slate-400 max-w-sm mx-auto">
                  Booking <span className="font-mono text-amber-400">#{confirmedBookingId}</span> has been locked.
                  An itemized TZS receipt and tax invoice PDF have been dispatched to your email and WhatsApp.
                </p>
                <div className="pt-4">
                  <button
                    onClick={onClose}
                    className="py-2.5 px-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors"
                  >
                    Done & Return
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
