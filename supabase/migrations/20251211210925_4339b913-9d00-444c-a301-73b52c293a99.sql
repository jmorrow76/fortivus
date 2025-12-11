-- Create a table to store body analysis results
CREATE TABLE public.body_analysis_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  body_fat_percentage NUMERIC,
  body_fat_category TEXT,
  muscle_assessment TEXT,
  strengths TEXT[],
  areas_to_improve TEXT[],
  nutrition_recommendation TEXT,
  training_recommendation TEXT,
  recovery_recommendation TEXT,
  estimated_timeframe TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.body_analysis_results ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own analysis results" 
ON public.body_analysis_results 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analysis results" 
ON public.body_analysis_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analysis results" 
ON public.body_analysis_results 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add index for faster lookups
CREATE INDEX idx_body_analysis_user_id ON public.body_analysis_results(user_id);
CREATE INDEX idx_body_analysis_created_at ON public.body_analysis_results(created_at DESC);