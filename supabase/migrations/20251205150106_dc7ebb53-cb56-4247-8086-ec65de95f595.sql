-- Insert running badges
INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value, xp_value) VALUES
('First Run', 'Complete your first run', 'footprints', 'milestone', 'running_sessions', 1, 25),
('5K Runner', 'Complete a 5km run in a single session', 'medal', 'milestone', 'running_distance_single', 5, 50),
('10K Runner', 'Complete a 10km run in a single session', 'medal', 'milestone', 'running_distance_single', 10, 100),
('Half Marathon', 'Complete a 21km run in a single session', 'trophy', 'milestone', 'running_distance_single', 21, 200),
('Marathon Runner', 'Complete a 42km run in a single session', 'crown', 'special', 'running_distance_single', 42, 500),
('Running Streak 3', 'Maintain a 3-day running streak', 'flame', 'streak', 'running_streak', 3, 30),
('Running Streak 7', 'Maintain a 7-day running streak', 'flame', 'streak', 'running_streak', 7, 75),
('Running Streak 14', 'Maintain a 14-day running streak', 'flame', 'streak', 'running_streak', 14, 150),
('Running Streak 30', 'Maintain a 30-day running streak', 'zap', 'streak', 'running_streak', 30, 300),
('Distance Pioneer', 'Run a total of 50km', 'map', 'milestone', 'running_total_distance', 50, 100),
('Century Runner', 'Run a total of 100km', 'map', 'milestone', 'running_total_distance', 100, 200),
('Road Warrior', 'Run a total of 500km', 'map', 'special', 'running_total_distance', 500, 500);

-- Insert running challenges (weekly reset)
INSERT INTO public.challenges (title, description, category, target_count, xp_reward, duration_days, reset_type, is_active) VALUES
('Run 3 Days', 'Complete runs on 3 different days this week', 'running', 3, 75, 7, 'weekly', true),
('Run 5 Days', 'Complete runs on 5 different days this week', 'running', 5, 150, 7, 'weekly', true),
('Weekly 10K', 'Run a total of 10km this week', 'running', 10, 100, 7, 'weekly', true),
('Weekly 25K', 'Run a total of 25km this week', 'running', 25, 200, 7, 'weekly', true),
('Weekly 50K', 'Run a total of 50km this week', 'running', 50, 350, 7, 'weekly', true);

-- Insert running challenges (monthly reset)
INSERT INTO public.challenges (title, description, category, target_count, xp_reward, duration_days, reset_type, is_active) VALUES
('Monthly Century', 'Run a total of 100km this month', 'running', 100, 400, 30, 'monthly', true),
('Run 15 Days', 'Complete runs on 15 different days this month', 'running', 15, 350, 30, 'monthly', true),
('Complete a 10K', 'Complete a single 10km run this month', 'running', 10, 150, 30, 'monthly', true);