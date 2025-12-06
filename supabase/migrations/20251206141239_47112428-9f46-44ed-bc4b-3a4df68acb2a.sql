-- Add RLS policies for user_onboarding table
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

-- Users can insert their own onboarding data
CREATE POLICY "Users can insert their own onboarding"
ON public.user_onboarding
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own onboarding data
CREATE POLICY "Users can view their own onboarding"
ON public.user_onboarding
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own onboarding data
CREATE POLICY "Users can update their own onboarding"
ON public.user_onboarding
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own onboarding data (for retake functionality)
CREATE POLICY "Users can delete their own onboarding"
ON public.user_onboarding
FOR DELETE
USING (auth.uid() = user_id);