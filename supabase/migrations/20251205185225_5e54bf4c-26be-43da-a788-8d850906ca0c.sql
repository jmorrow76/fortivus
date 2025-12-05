-- Drop any overly permissive SELECT policies on profiles
DROP POLICY IF EXISTS "Authenticated users can view profiles for leaderboard" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles for leaderboard" ON public.profiles;

-- Ensure the owner-only SELECT policy exists
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);