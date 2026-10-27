import { RentalQuoteBreakdown } from './types';

export const PLATFORM_CONSTANTS = {
  CURRENCY: 'TZS',
  CURRENCY_SYMBOL: 'TSh',
  DRIVER_DAILY_RATE: 50000, // TZS 50,000 per day
  DELIVERY_FEE_PER_KM: 3500, // TZS 3,500 per km
  SALES_HOLD_AMOUNT: 1300000, // TZS 1,300,000 reservation hold
  UPFRONT_DISCOUNT_PERCENT: 5, // 5% discount for 100% upfront card pay
  DEPOSIT_PERCENT: 20, // 20% deposit hold
  CANCELLATION_CARD_FEE_PERCENT: 10, // 10% fee if refunding to card
};

/**
 * Formats a numeric amount to Tanzanian Shillings (e.g. "TZS 150,000")
 */
export function formatTZS(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'TZS 0';
  }
  return `TZS ${Math.round(amount).toLocaleString('en-US')}`;
}

/**
 * Formats an amount with standard TSh prefix (e.g. "TSh 150,000")
 */
export function formatTSh(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'TSh 0';
  }
  return `TSh ${Math.round(amount).toLocaleString('en-US')}`;
}

/**
 * Compact TZS format (e.g. "TZS 45M", "TZS 150K")
 */
export function formatTZSCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `TZS ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `TZS ${(amount / 1_000).toFixed(0)}K`;
  }
  return formatTZS(amount);
}

/**
 * Cleans and standardizes Tanzanian phone number to +255 format
 */
export function formatPhoneTZ(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('255')) {
    return `+${digits}`;
  }
  if (digits.startsWith('0')) {
    return `+255${digits.substring(1)}`;
  }
  if (digits.length === 9) {
    return `+255${digits}`;
  }
  return phone;
}

/**
 * Deterministic Rental Quote Calculator in TZS
 */
export function calculateRentalQuote(params: {
  dailyRate: number;
  startDate: Date | string;
  endDate: Date | string;
  hasDriver?: boolean;
  isDoorstepDelivery?: boolean;
  distanceKm?: number;
  isFullUpfront?: boolean;
}): RentalQuoteBreakdown {
  const start = new Date(params.startDate);
  const end = new Date(params.endDate);

  const diffTime = Math.abs(end.getTime() - start.getTime());
  let days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (days <= 0) days = 1;

  const baseRentalRate = params.dailyRate;
  const subtotalRental = baseRentalRate * days;

  const driverFee = params.hasDriver ? PLATFORM_CONSTANTS.DRIVER_DAILY_RATE * days : 0;
  const deliveryKm = params.isDoorstepDelivery ? Math.max(0, params.distanceKm || 0) : 0;
  const deliveryFee = deliveryKm * PLATFORM_CONSTANTS.DELIVERY_FEE_PER_KM;

  const grossTotal = subtotalRental + driverFee + deliveryFee;

  let discountAmount = 0;
  let finalAmount = grossTotal;

  if (params.isFullUpfront) {
    discountAmount = Math.round((grossTotal * PLATFORM_CONSTANTS.UPFRONT_DISCOUNT_PERCENT) / 100);
    finalAmount = grossTotal - discountAmount;
  }

  const depositAmount = Math.round((finalAmount * PLATFORM_CONSTANTS.DEPOSIT_PERCENT) / 100);
  const balanceDueOnPickup = finalAmount - depositAmount;

  return {
    days,
    baseRentalRate,
    subtotalRental,
    driverFee,
    deliveryFee,
    grossTotal,
    discountAmount,
    finalAmount,
    depositAmount,
    balanceDueOnPickup,
  };
}
