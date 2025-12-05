-- Create a view for running leaderboard showing weekly stats
CREATE OR REPLACE VIEW public.running_leaderboard_view AS
SELECT 
  rs.user_id,
  p.display_name,
  p.avatar_url,
  COUNT(rs.id) FILTER (WHERE rs.completed_at >= date_trunc('week', CURRENT_DATE)) as weekly_runs,
  COALESCE(SUM(rs.distance_meters) FILTER (WHERE rs.completed_at >= date_trunc('week', CURRENT_DATE)), 0) as weekly_distance_meters,
  COALESCE(SUM(rs.duration_seconds) FILTER (WHERE rs.completed_at >= date_trunc('week', CURRENT_DATE)), 0) as weekly_duration_seconds,
  COUNT(rs.id) as total_runs,
  COALESCE(SUM(rs.distance_meters), 0) as total_distance_meters
FROM running_sessions rs
JOIN profiles p ON p.user_id = rs.user_id
WHERE rs.completed_at IS NOT NULL
GROUP BY rs.user_id, p.display_name, p.avatar_url
ORDER BY weekly_distance_meters DESC;