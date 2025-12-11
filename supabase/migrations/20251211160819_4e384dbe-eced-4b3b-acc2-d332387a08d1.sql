-- Create promo codes table for lifetime elite membership
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  redeemed_at timestamp with time zone,
  redeemed_by uuid REFERENCES auth.users(id),
  is_used boolean NOT NULL DEFAULT false,
  expires_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Only admins can view all promo codes
CREATE POLICY "Admins can view all promo codes"
ON public.promo_codes
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can create promo codes
CREATE POLICY "Admins can create promo codes"
ON public.promo_codes
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Authenticated users can update (redeem) unused codes
CREATE POLICY "Users can redeem promo codes"
ON public.promo_codes
FOR UPDATE
USING (is_used = false)
WITH CHECK (auth.uid() = redeemed_by AND is_used = true);