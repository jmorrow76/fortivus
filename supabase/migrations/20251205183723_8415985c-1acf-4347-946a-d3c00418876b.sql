-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view profiles for leaderboard" ON public.profiles;

-- Add policy for authenticated users to view profiles (for leaderboard/social features)
CREATE POLICY "Authenticated users can view profiles for leaderboard"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);