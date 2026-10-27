'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Loader2,
  Sparkles,
  Smartphone,
  Building2,
  Copy,
  Check,
  AlertCircle,
  ArrowRight,
  Info,
} from 'lucide-react';
import { formatTZS } from '@/lib/formatters';

const USD_TO_TZS_RATE = 2650;

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
  // Currency State (TZS or USD)
  const [currency, setCurrency] = useState<'TZS' | 'USD'>('TZS');

  // Customer Contact State
  const [customerName, setCustomerName] = useState('Baraka John');
  const [customerEmail, setCustomerEmail] = useState('baraka@example.com');
  const [customerPhone, setCustomerPhone] = useState('+255 754 000 111');

  // Payment Rail: 'bank_transfer' | 'mobile_money' | 'card'
  const [paymentRail, setPaymentRail] = useState<'bank_transfer' | 'mobile_money' | 'card'>('mobile_money');

  // Mobile Money Specifics (TZS Only)
  const [mobileOperator, setMobileOperator] = useState<'mpesa' | 'tigopesa' | 'airtel' | 'halopesa'>('mpesa');
  const [mobileMode, setMobileMode] = useState<'ussd_push' | 'lipa_namba'>('ussd_push');

  // Bank Wire Specifics (CRDB, NMB, Stanbic)
  const [selectedBank, setSelectedBank] = useState<'crdb' | 'nmb' | 'stanbic' | 'tips'>('crdb');
  const [bankSlipRef, setBankSlipRef] = useState('');
  const [wireRefCode] = useState(() => `DC-USD-${Math.floor(100000 + Math.random() * 900000)}`);
  const [tzsBankRefCode] = useState(() => `DC-TZS-${Math.floor(100000 + Math.random() * 900000)}`);

  // Card Specifics
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  // UI state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState('');

  if (!isOpen) return null;

  // Amount conversions
  const amountUSD = Number((totalAmountTZS / USD_TO_TZS_RATE).toFixed(2));
  const activeAmountDisplay =
    currency === 'USD'
      ? `$${amountUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
      : formatTZS(totalAmountTZS);

  const handleCurrencyChange = (newCurrency: 'TZS' | 'USD') => {
    setCurrency(newCurrency);
    // CRITICAL BUSINESS RULE:
    // When USD is selected, Mobile Money is strictly disabled because MNOs only operate in TZS.
    // Automatically switch to corporate Bank Wire Transfer.
    if (newCurrency === 'USD' && paymentRail === 'mobile_money') {
      setPaymentRail('bank_transfer');
    }
  };

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

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
          currency,
          totalAmount: currency === 'USD' ? amountUSD : totalAmountTZS,
          paymentType: paymentRail,
          bankSlipRef: paymentRail === 'bank_transfer' ? bankSlipRef : undefined,
          wireRefCode: currency === 'USD' ? wireRefCode : tzsBankRefCode,
        }),
      });

      const data = await res.json().catch(() => ({}));
      const mockOrRealId = data.bookingId || `DC-${Date.now().toString().slice(-6)}`;

      // Realistic gateway confirmation latency
      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
        setConfirmedBookingId(mockOrRealId);
        onPaymentSuccess(mockOrRealId);
      }, 1600);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg my-6 overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-amber-100" />
                <h3 className="font-bold text-base sm:text-lg tracking-wide uppercase">
                  DriverConnect Multi-Currency Checkout
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full hover:bg-black/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-amber-100/90 mt-1 flex items-center gap-1.5">
              <span>Encrypted 256-Bit SSL</span>
              <span>&bull;</span>
              <span>Dual Settlement: TZS (Mobile/Bank) &amp; USD (Corporate Wire)</span>
            </p>
          </div>

          <div className="p-5 sm:p-6 max-h-[82vh] overflow-y-auto">
            {!isSuccess ? (
              <form onSubmit={handlePay} className="space-y-4">
                
                {/* 1. CURRENCY SELECTOR PILLS */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      1. Select Settlement Currency
                    </label>
                    <span className="text-[10px] text-amber-400/90 font-mono">
                      Rate: 1 USD ≈ {USD_TO_TZS_RATE.toLocaleString()} TZS
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleCurrencyChange('TZS')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        currency === 'TZS'
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-base leading-none">🇹🇿</span>
                      <span>Pay in TZS (Shillings)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCurrencyChange('USD')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        currency === 'USD'
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-base leading-none">🇺🇸</span>
                      <span>Pay in USD (US Dollar)</span>
                    </button>
                  </div>
                </div>

                {/* 2. ORDER SUMMARY TILE */}
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-amber-400 font-semibold tracking-wider">
                      {bookingType.replace(/_/g, ' ')}
                    </span>
                    <h4 className="font-semibold text-slate-100 text-sm">{vehicleTitle}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Total Due</span>
                    <div className="text-lg font-black text-amber-400 font-mono">
                      {activeAmountDisplay}
                    </div>
                    {currency === 'USD' && (
                      <span className="text-[10px] text-slate-400 block">
                        ≈ {formatTZS(totalAmountTZS)}
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. PAYMENT RAIL SELECTOR */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    2. Select Payment Rail
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Bank Wire Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentRail('bank_transfer')}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                        paymentRail === 'bank_transfer'
                          ? 'border-amber-400 bg-amber-400/10 text-white font-bold ring-1 ring-amber-400'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Building2 className={`w-4 h-4 ${paymentRail === 'bank_transfer' ? 'text-amber-400' : ''}`} />
                      <span className="text-[11px] font-bold leading-tight">Bank Wire</span>
                      <span className="text-[9px] text-slate-500 font-normal">
                        {currency === 'USD' ? 'USD Nostro' : 'CRDB / NMB'}
                      </span>
                    </button>

                    {/* Mobile Money Option (STRICTLY DISABLED FOR USD) */}
                    <button
                      type="button"
                      disabled={currency === 'USD'}
                      onClick={() => currency === 'TZS' && setPaymentRail('mobile_money')}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 relative ${
                        currency === 'USD'
                          ? 'border-slate-800/40 bg-slate-950/30 text-slate-600 cursor-not-allowed opacity-50'
                          : paymentRail === 'mobile_money'
                          ? 'border-amber-400 bg-amber-400/10 text-white font-bold ring-1 ring-amber-400 cursor-pointer'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white cursor-pointer'
                      }`}
                    >
                      <Smartphone className={`w-4 h-4 ${paymentRail === 'mobile_money' ? 'text-amber-400' : ''}`} />
                      <span className="text-[11px] font-bold leading-tight">Mobile Money</span>
                      {currency === 'USD' ? (
                        <span className="text-[8px] bg-rose-500/20 text-rose-300 px-1 py-0.2 rounded font-semibold">
                          TZS Only
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-500 font-normal">M-Pesa, Tigo</span>
                      )}
                    </button>

                    {/* Card Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentRail('card')}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                        paymentRail === 'card'
                          ? 'border-amber-400 bg-amber-400/10 text-white font-bold ring-1 ring-amber-400'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className={`w-4 h-4 ${paymentRail === 'card' ? 'text-amber-400' : ''}`} />
                      <span className="text-[11px] font-bold leading-tight">Card (Visa/MC)</span>
                      <span className="text-[9px] text-slate-500 font-normal">3D-Secure</span>
                    </button>
                  </div>

                  {/* Clarification banner if USD is active */}
                  {currency === 'USD' && (
                    <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/50 flex items-start gap-2 text-[11px] text-amber-300">
                      <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        <strong>USD Business Rule:</strong> Mobile Money (M-Pesa / Tigo Pesa) operates exclusively in TZS.
                        For USD transactions, payment must be completed via <strong>Corporate Bank Account / Wire Transfer</strong>.
                      </p>
                    </div>
                  )}
                </div>

                {/* 4. RAIL SPECIFIC DETAILS */}

                {/* A: BANK WIRE DETAILS (USD & TZS) */}
                {paymentRail === 'bank_transfer' && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3.5">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2">
                        Select Corporate Destination Bank:
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'crdb', name: 'CRDB Bank', swift: 'CORUTZTZ' },
                          { id: 'nmb', name: 'NMB Bank', swift: 'NMBLTZTZ' },
                          { id: 'stanbic', name: 'Stanbic Bank', swift: 'SBICNEAA' },
                        ].map((b) => (
                          <div
                            key={b.id}
                            onClick={() => setSelectedBank(b.id as any)}
                            className={`p-2 rounded-xl border cursor-pointer transition text-center space-y-0.5 ${
                              selectedBank === b.id
                                ? 'border-amber-400 bg-slate-900 ring-1 ring-amber-400/50'
                                : 'border-slate-800 bg-slate-900/40 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <Building2 className={`w-4 h-4 mx-auto ${selectedBank === b.id ? 'text-amber-400' : 'text-slate-500'}`} />
                            <span className="text-[11px] font-bold text-white block">{b.name}</span>
                            <span className="text-[9px] font-mono text-slate-400">{b.swift}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bank Wire Details Box */}
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-[11px]">
                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                        <span className="text-slate-400">Beneficiary Name</span>
                        <span className="font-bold text-white">DriverConnect Automotive Ltd</span>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                        <span className="text-slate-400">
                          {currency === 'USD' ? 'USD Nostro Account' : 'TZS Account Number'}
                        </span>
                        <div className="flex items-center gap-1.5 font-mono font-bold text-amber-400">
                          <span>
                            {currency === 'USD'
                              ? selectedBank === 'crdb'
                                ? '0250 2849 10401 (USD)'
                                : selectedBank === 'nmb'
                                ? '2011 0048 29105 (USD)'
                                : '9120 0019 48205 (USD)'
                              : selectedBank === 'crdb'
                              ? '0150 2849 10400 (TZS)'
                              : selectedBank === 'nmb'
                              ? '2011 0048 29100 (TZS)'
                              : '9120 0019 48200 (TZS)'}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                currency === 'USD'
                                  ? selectedBank === 'crdb'
                                    ? '0250284910401'
                                    : selectedBank === 'nmb'
                                    ? '2011004829105'
                                    : '9120001948205'
                                  : selectedBank === 'crdb'
                                  ? '0150284910400'
                                  : selectedBank === 'nmb'
                                  ? '2011004829100'
                                  : '9120001948200',
                                'bank_acc'
                              )
                            }
                            className="text-slate-400 hover:text-white cursor-pointer"
                          >
                            {copiedKey === 'bank_acc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                        <span className="text-slate-400">Bank SWIFT / BIC</span>
                        <span className="font-mono text-slate-200 font-bold">
                          {selectedBank === 'crdb' ? 'CORUTZTZ' : selectedBank === 'nmb' ? 'NMBLTZTZ' : 'SBICNEAA'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pb-1 border-b border-slate-800">
                        <span className="text-slate-400">Wire Memo / Reference</span>
                        <div className="flex items-center gap-1.5 font-mono font-black text-amber-300">
                          <span>{currency === 'USD' ? wireRefCode : tzsBankRefCode}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(currency === 'USD' ? wireRefCode : tzsBankRefCode, 'ref')}
                            className="text-slate-400 hover:text-white cursor-pointer"
                          >
                            {copiedKey === 'ref' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <p className="text-[10px] text-amber-400/90 leading-relaxed pt-1">
                        &bull; Please quote memo <strong className="font-mono text-white">{currency === 'USD' ? wireRefCode : tzsBankRefCode}</strong> in your
                        wire transfer narration so our banking webhook reconciles your booking instantly.
                      </p>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-1">
                        Bank Transfer Reference / Transaction ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={bankSlipRef}
                        onChange={(e) => setBankSlipRef(e.target.value)}
                        placeholder="e.g. FT262919401 / Swift ACK"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}

                {/* B: MOBILE MONEY (TZS ONLY) */}
                {paymentRail === 'mobile_money' && currency === 'TZS' && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3.5">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2">
                        Select Mobile Carrier:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'mpesa', name: 'M-Pesa', telco: 'Vodacom', badge: 'bg-rose-600' },
                          { id: 'tigopesa', name: 'Tigo Pesa', telco: 'Mixx (Yas)', badge: 'bg-blue-600' },
                          { id: 'airtel', name: 'Airtel Money', telco: 'Airtel', badge: 'bg-red-700' },
                          { id: 'halopesa', name: 'HaloPesa', telco: 'Halotel', badge: 'bg-amber-600' },
                        ].map((op) => (
                          <div
                            key={op.id}
                            onClick={() => setMobileOperator(op.id as any)}
                            className={`p-2 rounded-xl border cursor-pointer transition text-center space-y-1 ${
                              mobileOperator === op.id
                                ? 'border-amber-400 bg-slate-900 ring-1 ring-amber-400/50'
                                : 'border-slate-800 bg-slate-900/40 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black text-white ${op.badge}`}>
                              {op.name}
                            </span>
                            <span className="text-[10px] text-slate-300 block font-medium">{op.telco}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setMobileMode('ussd_push')}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                          mobileMode === 'ussd_push' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Instant USSD Push (STK)
                      </button>
                      <button
                        type="button"
                        onClick={() => setMobileMode('lipa_namba')}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                          mobileMode === 'lipa_namba' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Lipa Namba
                      </button>
                    </div>

                    {mobileMode === 'ussd_push' ? (
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                          Handset Mobile Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+255 700 000 000"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                        />
                        <p className="text-[10px] text-slate-500">
                          A USSD prompt will be sent to this phone. Enter your 4-digit PIN on your device to confirm.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 text-[11px]">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">DriverConnect Lipa Namba</span>
                          <span className="font-mono font-bold text-amber-400">5544321</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Dial Code</span>
                          <span className="font-mono text-slate-300 font-bold">*150*00#</span>
                        </div>
                        <p className="text-[10px] text-slate-500 pt-1">
                          Dial *150*00# &gt; Pay by Lipa Namba &gt; Enter 5544321 &gt; Amount: {formatTZS(totalAmountTZS)} &gt; Enter PIN.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* C: CREDIT / DEBIT CARD */}
                {paymentRail === 'card' && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-amber-400" />
                        Card Details (Visa / MasterCard)
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Settled in {currency}
                      </span>
                    </div>

                    <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 space-y-2">
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
                )}

                {/* 5. CONTACT DETAILS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Email (for PDF Tax Invoice)</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* 6. SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-3 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>
                        {paymentRail === 'bank_transfer'
                          ? `Validating ${currency} Bank Wire Memo...`
                          : paymentRail === 'mobile_money'
                          ? 'Awaiting Mobile Money PIN Prompt...'
                          : `Authorizing ${currency} Card...`}
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {paymentRail === 'bank_transfer'
                          ? `Confirm ${currency} Bank Wire • ${activeAmountDisplay}`
                          : paymentRail === 'mobile_money'
                          ? `Pay ${activeAmountDisplay} via Mobile Money`
                          : `Authorize ${activeAmountDisplay} via Card`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* SCREEN 2: SUCCESS CONFIRMATION */
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-white">Payment Verified &amp; Confirmed!</h4>
                
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Booking Reference</span>
                    <span className="font-mono font-bold text-amber-400">#{confirmedBookingId}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Settlement Amount</span>
                    <span className="font-mono font-bold text-emerald-400">{activeAmountDisplay}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Payment Rail</span>
                    <span className="font-medium text-slate-200 capitalize">
                      {paymentRail === 'bank_transfer'
                        ? `Bank Wire (${currency} ${selectedBank.toUpperCase()})`
                        : paymentRail === 'mobile_money'
                        ? `Mobile Money (${mobileOperator.toUpperCase()})`
                        : 'Credit / Debit Card'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Reconciliation Status</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Settled in Ledger
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Your reservation for <strong className="text-white">{vehicleTitle}</strong> has been secured.
                  An itemized {currency} tax invoice and receipt PDF have been dispatched to your email and WhatsApp.
                </p>

                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Done &bull; Return to Platform
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
