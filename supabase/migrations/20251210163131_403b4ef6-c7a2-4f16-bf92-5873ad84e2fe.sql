-- Enable RLS on running_sessions table (if not already enabled)
ALTER TABLE public.running_sessions ENABLE ROW LEVEL SECURITY;

-- Drop any existing public policies that might exist
DROP POLICY IF EXISTS "Anyone can view running sessions" ON public.running_sessions;
DROP POLICY IF EXISTS "Public can view running sessions" ON public.running_sessions;

-- Create secure policies - users can only access their own running data
CREATE POLICY "Users can view own running sessions"
ON public.running_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own running sessions"
ON public.running_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own running sessions"
ON public.running_sessions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own running sessions"
ON public.running_sessions
FOR DELETE
USING (auth.uid() = user_id);