-- Add banned_at column to profiles for tracking banned users
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned_at timestamp with time zone DEFAULT NULL;

-- Create index for efficient banned user queries
CREATE INDEX IF NOT EXISTS idx_profiles_banned_at ON public.profiles(banned_at) WHERE banned_at IS NOT NULL;