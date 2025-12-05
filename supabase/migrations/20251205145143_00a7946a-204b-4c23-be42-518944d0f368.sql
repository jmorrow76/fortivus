-- Create running goals table
CREATE TABLE public.running_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  weekly_distance_km NUMERIC NOT NULL DEFAULT 10,
  weekly_runs INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.running_goals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own goals" ON public.running_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" ON public.running_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON public.running_goals
  FOR UPDATE USING (auth.uid() = user_id);

-- Add unique constraint for one goal per user
ALTER TABLE public.running_goals ADD CONSTRAINT running_goals_user_id_unique UNIQUE (user_id);