-- ==============================================================================
-- DRIVERCONNECT: 3-TIER SELF-SERVICE CANCELLATIONS, PROMO COUPONS & REFUND RPC
-- ==============================================================================

-- 1. Create coupons table for promotional and refund vouchers
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL DEFAULT 'fixed_amount' CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (discount_value >= 0.00),
    min_booking_amount NUMERIC(14, 2) DEFAULT 0.00 CHECK (min_booking_amount >= 0.00),
    usage_limit INTEGER DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    per_user_limit INTEGER DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

-- RLS for Coupons Table
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can query active coupons" 
    ON public.coupons FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Admins have full access to coupons" 
    ON public.coupons FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 2. Atomic 3-Tier Self-Service Refund & Cancellation Stored Procedure
CREATE OR REPLACE FUNCTION public.process_self_service_refund(
  p_booking_id uuid,
  p_user_id uuid,
  p_refund_mode text -- 'wallet_credit' (100%), 'coupon_code' (100%), 'gateway_reversal' (90%)
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking record;
  v_user_balance numeric(14, 2);
  v_refund_amount numeric(14, 2);
  v_new_balance numeric(14, 2);
  v_generated_coupon text;
BEGIN
  -- 1. Fetch and lock booking record
  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id AND (customer_id = p_user_id OR customer_email = auth.jwt() ->> 'email')
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Booking not found or unauthorized.');
  END IF;

  IF v_booking.status NOT IN ('pending', 'confirmed') THEN
    RETURN jsonb_build_object('success', false, 'message', 'This booking can no longer be self-refunded.');
  END IF;

  -- 2. Fetch current wallet balance
  SELECT COALESCE(wallet_balance, 0.00) INTO v_user_balance
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    v_user_balance := 0.00;
  END IF;

  -- 3. Calculate refund tiers
  IF p_refund_mode = 'wallet_credit' THEN
    v_refund_amount := v_booking.total_amount; -- 100% Refund
    v_new_balance := COALESCE(v_user_balance, 0.00) + v_refund_amount;

    -- Update Profile Wallet
    UPDATE public.profiles
    SET wallet_balance = v_new_balance, updated_at = now()
    WHERE id = p_user_id;

    -- Record Audit Ledger
    INSERT INTO public.wallet_ledgers (
      profile_id, booking_id, amount, running_balance, reason
    ) VALUES (
      p_user_id, p_booking_id, v_refund_amount, v_new_balance,
      '100% Self-service cancellation refund for booking #' || substr(p_booking_id::text, 1, 8)
    );

  ELSIF p_refund_mode = 'coupon_code' THEN
    v_refund_amount := v_booking.total_amount; -- 100% Value
    v_generated_coupon := 'REFUND-' || upper(substr(md5(random()::text), 1, 8));

    -- Generate unexpiring single-use promo code
    INSERT INTO public.coupons (
      code, description, discount_type, discount_value, min_booking_amount,
      usage_limit, per_user_limit, is_active
    ) VALUES (
      v_generated_coupon, 'Refund voucher for booking #' || substr(p_booking_id::text, 1, 8),
      'fixed_amount', v_refund_amount, 0, 1, 1, true
    );

  ELSIF p_refund_mode = 'gateway_reversal' THEN
    v_refund_amount := round(v_booking.total_amount * 0.90, 2); -- 90% Refund (10% Admin deduction)
    -- In production, trigger Stripe/ClickPesa reversal API here
  ELSE
    RETURN jsonb_build_object('success', false, 'message', 'Invalid refund method.');
  END IF;

  -- 4. Mark booking cancelled
  UPDATE public.bookings
  SET status = 'cancelled', updated_at = now()
  WHERE id = p_booking_id;

  RETURN jsonb_build_object(
    'success', true,
    'refund_mode', p_refund_mode,
    'refund_amount', v_refund_amount,
    'coupon_code', v_generated_coupon,
    'message', 'Booking successfully cancelled and refund initiated.'
  );
END;
$$;

-- 3. Execution permissions
GRANT EXECUTE ON FUNCTION public.process_self_service_refund(UUID, UUID, TEXT) TO authenticated, service_role, anon;
