-- Create table for saved personal plans
CREATE TABLE public.personal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goals TEXT NOT NULL,
  current_stats JSONB,
  preferences JSONB,
  plan_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.personal_plans ENABLE ROW LEVEL SECURITY;

-- Users can view their own plans
CREATE POLICY "Users can view their own plans"
ON public.personal_plans
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own plans
CREATE POLICY "Users can insert their own plans"
ON public.personal_plans
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own plans
CREATE POLICY "Users can delete their own plans"
ON public.personal_plans
FOR DELETE
USING (auth.uid() = user_id);

-- Index for faster user lookups
CREATE INDEX idx_personal_plans_user_id ON public.personal_plans(user_id);