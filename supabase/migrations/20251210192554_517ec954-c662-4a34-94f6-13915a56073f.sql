-- Remove the overly permissive public SELECT policy that exposes GPS coordinates
DROP POLICY IF EXISTS "Anyone can view running stats for leaderboard" ON public.running_sessions;

-- The running_leaderboard_view already provides aggregate stats for the leaderboard
-- without exposing sensitive route_coordinates data, so no replacement policy is needed