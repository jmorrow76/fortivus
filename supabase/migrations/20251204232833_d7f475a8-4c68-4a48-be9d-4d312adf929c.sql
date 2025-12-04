-- Drop the existing view and recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.leaderboard_view;

CREATE VIEW public.leaderboard_view 
WITH (security_invoker = true)
AS
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

-- Also allow viewing profiles for leaderboard display
CREATE POLICY "Anyone can view profiles for leaderboard" ON public.profiles 
FOR SELECT TO authenticated
USING (true);