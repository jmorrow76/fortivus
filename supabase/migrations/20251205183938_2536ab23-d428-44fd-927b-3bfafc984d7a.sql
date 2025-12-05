-- Create a public view with only non-sensitive profile fields
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT 
  user_id,
  display_name,
  avatar_url
FROM public.profiles;

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view profiles for leaderboard" ON public.profiles;

-- Keep only owner-only SELECT for the full profiles table
-- (The "Users can view their own profile" policy already exists)