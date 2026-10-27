export type UserRole = 'customer' | 'admin' | 'fleet_driver' | 'vehicle_owner';
export type TransmissionType = 'automatic' | 'manual';
export type BookingVerticalType = 'rental' | 'sale_reservation' | 'repair_service';
export type PaymentSettlementType = 'full_card' | 'deposit_card' | 'internal_wallet' | 'cash_on_delivery';
export type BookingLifecycleStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type VehicleStatus = 'available' | 'reserved' | 'rented' | 'maintenance' | 'sold';

export interface Profile {
  id: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  wallet_balance: number; // in TZS
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  owner_id?: string | null;
  title: string;
  brand: string;
  model: string;
  year: number;
  body_type: string;
  transmission: TransmissionType;
  seats: number;
  doors: number;
  fuel_type: string;
  mileage_km: number;
  license_plate: string;
  daily_rate: number; // in TZS
  weekly_rate?: number | null; // in TZS
  sale_price?: number | null; // in TZS
  is_for_rent: boolean;
  is_for_sale: boolean;
  is_approved: boolean;
  status: VehicleStatus;
  cover_image: string;
  gallery_images: string[];
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  profile_id: string;
  license_number: string;
  daily_wage: number; // in TZS (default 50,000)
  is_active: boolean;
  profile?: Profile;
  created_at: string;
  updated_at: string;
}

export interface RepairService {
  id: string;
  name: string;
  category: string;
  base_price: number; // in TZS
  estimated_duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  vehicle_id?: string | null;
  driver_id?: string | null;
  customer_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_type: BookingVerticalType;
  pickup_date: string;
  return_date: string;
  date_range?: string;
  total_amount: number; // in TZS
  payment_type: PaymentSettlementType;
  status: BookingLifecycleStatus;
  hold_expires_at?: string | null;
  stripe_payment_intent_id?: string | null;
  delivery_address?: string | null;
  distance_km: number;
  service_ids: string[];
  created_at: string;
  updated_at: string;
  vehicle?: Vehicle;
  driver?: Driver;
}

export interface WalletLedger {
  id: string;
  profile_id: string;
  booking_id?: string | null;
  amount: number; // in TZS (+ or -)
  running_balance: number; // in TZS
  reason: string;
  created_at: string;
}

export interface RentalQuoteBreakdown {
  days: number;
  baseRentalRate: number; // in TZS
  subtotalRental: number; // in TZS
  driverFee: number; // in TZS (days * 50,000 if selected)
  deliveryFee: number; // in TZS (distance_km * 3,500 if delivery)
  grossTotal: number; // in TZS
  discountAmount: number; // in TZS (5% if full upfront)
  finalAmount: number; // in TZS
  depositAmount: number; // in TZS (20% hold if deposit option)
  balanceDueOnPickup: number; // in TZS
}

export type ThemeAccent = 'amber' | 'emerald' | 'blue' | 'rose';
export type CornerRadius = 'sharp' | 'rounded' | 'pill';
export type LayoutDensity = 'compact' | 'classic' | 'spacious';

export interface PlatformAppearance {
  id: string;
  theme_accent: ThemeAccent;
  corner_radius: CornerRadius;
  layout_density: LayoutDensity;
  show_testimonials: boolean;
  background_image_url: string;
  delivery_rate_per_km: number; // in TZS
  driver_daily_rate: number; // in TZS
  sale_reservation_fee: number; // in TZS
  updated_at?: string;
}

