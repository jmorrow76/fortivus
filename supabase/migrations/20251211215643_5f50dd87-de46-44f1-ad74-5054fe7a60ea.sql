-- Add has_seen_tour flag to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_seen_tour boolean DEFAULT false;

COMMENT ON COLUMN public.profiles.has_seen_tour IS 'Whether the user has completed the welcome tour';