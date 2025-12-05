-- Create running_sessions table for GPS tracking
CREATE TABLE public.running_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  distance_meters NUMERIC,
  avg_pace_seconds_per_km NUMERIC,
  calories_burned INTEGER,
  route_coordinates JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.running_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own runs" ON public.running_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own runs" ON public.running_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own runs" ON public.running_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own runs" ON public.running_sessions FOR DELETE USING (auth.uid() = user_id);