-- Create fasting_logs table for tracking fasting periods
CREATE TABLE public.fasting_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  fasting_type TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  target_duration_hours INTEGER,
  actual_duration_minutes INTEGER,
  prayer_intentions TEXT,
  scripture_focus TEXT,
  notes TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fasting_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own fasting logs"
  ON public.fasting_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own fasting logs"
  ON public.fasting_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fasting logs"
  ON public.fasting_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fasting logs"
  ON public.fasting_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Create fasting_goals table for tracking streaks and goals
CREATE TABLE public.fasting_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  weekly_fasts_goal INTEGER DEFAULT 1,
  preferred_fast_type TEXT DEFAULT 'sunrise_sunset',
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_fasts_completed INTEGER DEFAULT 0,
  total_hours_fasted INTEGER DEFAULT 0,
  last_fast_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fasting_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own fasting goals"
  ON public.fasting_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own fasting goals"
  ON public.fasting_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fasting goals"
  ON public.fasting_goals FOR UPDATE
  USING (auth.uid() = user_id);