-- Add running streak columns to running_goals table
ALTER TABLE public.running_goals 
ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_run_date DATE,
ADD COLUMN IF NOT EXISTS streak_type TEXT NOT NULL DEFAULT 'daily';