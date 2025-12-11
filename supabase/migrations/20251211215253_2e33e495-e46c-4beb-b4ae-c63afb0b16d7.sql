-- Add landing page preference to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS landing_page_preference text DEFAULT 'dashboard';

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.landing_page_preference IS 'User preferred landing page after login: dashboard or fitness-journey';