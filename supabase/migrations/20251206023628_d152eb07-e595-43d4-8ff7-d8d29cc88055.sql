
-- Create user onboarding table to store assessment quiz responses
CREATE TABLE public.user_onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  fitness_goal TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  age_range TEXT NOT NULL,
  workout_frequency TEXT NOT NULL,
  current_challenges TEXT[] DEFAULT '{}',
  available_equipment TEXT[] DEFAULT '{}',
  focus_areas TEXT[] DEFAULT '{}',
  dietary_preference TEXT,
  injuries_limitations TEXT,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

-- Users can only view their own onboarding data
CREATE POLICY "Users can view own onboarding"
ON public.user_onboarding
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own onboarding data
CREATE POLICY "Users can insert own onboarding"
ON public.user_onboarding
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own onboarding data
CREATE POLICY "Users can update own onboarding"
ON public.user_onboarding
FOR UPDATE
USING (auth.uid() = user_id);
