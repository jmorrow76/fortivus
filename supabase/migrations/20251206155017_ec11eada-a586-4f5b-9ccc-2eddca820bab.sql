
-- Create testimonies table for community prayer testimonies
CREATE TABLE public.testimonies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_featured boolean NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view testimonies"
ON public.testimonies FOR SELECT
USING (true);

CREATE POLICY "Users can create own testimonies"
ON public.testimonies FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own testimonies"
ON public.testimonies FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own testimonies"
ON public.testimonies FOR DELETE
USING (auth.uid() = user_id);

-- Update trigger
CREATE TRIGGER update_testimonies_updated_at
BEFORE UPDATE ON public.testimonies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
