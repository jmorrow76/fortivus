-- Add a flag to identify simulated users
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_simulated BOOLEAN DEFAULT false;

-- Add index for quick filtering
CREATE INDEX IF NOT EXISTS idx_profiles_simulated ON public.profiles(is_simulated) WHERE is_simulated = true;