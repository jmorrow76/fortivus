-- Drop existing SELECT policy on user_streaks that allows public access
DROP POLICY IF EXISTS "Users can view leaderboard data" ON public.user_streaks;

-- Create new policy that requires authentication for viewing leaderboard data
CREATE POLICY "Authenticated users can view leaderboard data"
ON public.user_streaks
FOR SELECT
TO authenticated
USING (
  show_on_leaderboard = true 
  OR auth.uid() = user_id
);