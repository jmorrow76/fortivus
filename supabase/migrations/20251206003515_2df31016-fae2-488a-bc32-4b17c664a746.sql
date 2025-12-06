-- Add grant_type column to subscription_grants to distinguish between Elite and Lifetime
ALTER TABLE public.subscription_grants 
ADD COLUMN IF NOT EXISTS grant_type text NOT NULL DEFAULT 'elite' 
CHECK (grant_type IN ('elite', 'lifetime'));