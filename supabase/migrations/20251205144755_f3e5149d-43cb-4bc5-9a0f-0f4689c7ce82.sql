-- Add running badges
INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value, xp_value) VALUES
('First Steps', 'Complete your first run', 'footprints', 'milestone', 'runs_completed', 1, 50),
('5K Club', 'Run a total of 5 kilometers', 'map-pin', 'milestone', 'total_distance_km', 5, 75),
('10K Achievement', 'Run a total of 10 kilometers', 'map', 'milestone', 'total_distance_km', 10, 100),
('Half Marathon', 'Run a total of 21 kilometers', 'trophy', 'milestone', 'total_distance_km', 21, 150),
('Marathon Legend', 'Run a total of 42 kilometers', 'medal', 'special', 'total_distance_km', 42, 250),
('Speed Demon', 'Complete a run under 6 min/km pace', 'zap', 'special', 'pace_under_6', 1, 100),
('Endurance Runner', 'Complete a run over 30 minutes', 'clock', 'milestone', 'run_duration_30', 1, 75),
('Distance King', 'Complete a single run over 5km', 'crown', 'milestone', 'single_run_5km', 1, 100),
('Consistent Runner', 'Complete 10 runs', 'repeat', 'milestone', 'runs_completed', 10, 150),
('Running Warrior', 'Complete 25 runs', 'shield', 'special', 'runs_completed', 25, 250)
ON CONFLICT DO NOTHING;