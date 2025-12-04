-- Add reset_type column to challenges
ALTER TABLE public.challenges 
ADD COLUMN reset_type TEXT DEFAULT 'none' CHECK (reset_type IN ('none', 'weekly', 'monthly'));

-- Add started_week column to user_challenges for tracking reset periods
ALTER TABLE public.user_challenges 
ADD COLUMN reset_week TEXT;