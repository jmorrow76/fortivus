-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view streaks for leaderboard" ON public.user_streaks;

-- Create a new policy that respects the show_on_leaderboard flag
CREATE POLICY "Public can view opted-in streaks for leaderboard" 
ON public.user_streaks 
FOR SELECT 
USING (show_on_leaderboard = true OR auth.uid() = user_id);