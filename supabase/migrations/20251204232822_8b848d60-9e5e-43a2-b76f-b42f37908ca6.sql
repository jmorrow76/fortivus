-- Allow authenticated users to view all streaks for leaderboard
CREATE POLICY "Anyone can view streaks for leaderboard" ON public.user_streaks 
FOR SELECT TO authenticated
USING (true);

-- Add opt-in column for leaderboard visibility
ALTER TABLE public.user_streaks ADD COLUMN show_on_leaderboard BOOLEAN NOT NULL DEFAULT true;

-- Create a view for leaderboard with profile info
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT 
  us.user_id,
  us.current_streak,
  us.longest_streak,
  us.total_xp,
  us.total_checkins,
  p.display_name,
  p.avatar_url
FROM public.user_streaks us
LEFT JOIN public.profiles p ON us.user_id = p.user_id
WHERE us.show_on_leaderboard = true
ORDER BY us.total_xp DESC;