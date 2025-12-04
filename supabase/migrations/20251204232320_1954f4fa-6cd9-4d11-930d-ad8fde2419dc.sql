-- Create enum for badge types
CREATE TYPE public.badge_category AS ENUM ('streak', 'challenge', 'milestone', 'special');

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  duration_days INTEGER NOT NULL DEFAULT 7,
  target_count INTEGER NOT NULL DEFAULT 7,
  xp_reward INTEGER NOT NULL DEFAULT 100,
  badge_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_challenges table
CREATE TABLE public.user_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, challenge_id)
);

-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'award',
  category badge_category NOT NULL DEFAULT 'milestone',
  xp_value INTEGER NOT NULL DEFAULT 50,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create user_streaks table
CREATE TABLE public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_checkin_date DATE,
  total_checkins INTEGER NOT NULL DEFAULT 0,
  total_xp INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key from challenges to badges
ALTER TABLE public.challenges ADD CONSTRAINT challenges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.badges(id);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for challenges (public read)
CREATE POLICY "Anyone can view active challenges" ON public.challenges FOR SELECT USING (is_active = true);

-- RLS Policies for badges (public read)
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);

-- RLS Policies for user_challenges
CREATE POLICY "Users can view their own challenges" ON public.user_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can join challenges" ON public.user_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own challenges" ON public.user_challenges FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_badges
CREATE POLICY "Users can view their own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can earn badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_streaks
CREATE POLICY "Users can view their own streaks" ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their streak record" ON public.user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own streaks" ON public.user_streaks FOR UPDATE USING (auth.uid() = user_id);

-- Insert default badges
INSERT INTO public.badges (name, description, icon, category, xp_value, requirement_type, requirement_value) VALUES
('First Check-in', 'Complete your first daily check-in', 'calendar-check', 'milestone', 25, 'checkins', 1),
('Week Warrior', 'Maintain a 7-day streak', 'flame', 'streak', 100, 'streak', 7),
('Fortnight Fighter', 'Maintain a 14-day streak', 'flame', 'streak', 200, 'streak', 14),
('Monthly Master', 'Maintain a 30-day streak', 'crown', 'streak', 500, 'streak', 30),
('Century Club', 'Complete 100 total check-ins', 'trophy', 'milestone', 1000, 'checkins', 100),
('Consistency King', 'Maintain a 60-day streak', 'medal', 'streak', 1000, 'streak', 60),
('Challenge Champion', 'Complete your first challenge', 'target', 'challenge', 150, 'challenges', 1),
('Challenge Crusher', 'Complete 5 challenges', 'zap', 'challenge', 500, 'challenges', 5);

-- Insert default longevity-focused challenges
INSERT INTO public.challenges (title, description, category, duration_days, target_count, xp_reward) VALUES
('Morning Mobility', 'Complete 7 days of morning mobility routines to improve joint health', 'mobility', 7, 7, 150),
('Sleep Optimization', 'Log 7 nights of quality sleep (7+ hours) for recovery and longevity', 'recovery', 7, 7, 150),
('Hydration Hero', 'Track proper hydration for 14 consecutive days', 'nutrition', 14, 14, 200),
('Stress Mastery', 'Keep stress levels below 3 for 7 consecutive check-ins', 'mental', 7, 7, 175),
('Energy Excellence', 'Maintain high energy (4+) for 10 check-ins', 'vitality', 14, 10, 200),
('Recovery Protocol', 'Complete 5 recovery-focused workouts in 2 weeks', 'recovery', 14, 5, 175),
('Consistency Quest', 'Check in every day for 21 days straight', 'consistency', 21, 21, 350),
('Functional Fitness', 'Complete 12 strength workouts in 30 days', 'strength', 30, 12, 400);