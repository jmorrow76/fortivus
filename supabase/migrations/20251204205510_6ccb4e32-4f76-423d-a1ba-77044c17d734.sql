-- Create storage bucket for progress photos
INSERT INTO storage.buckets (id, name, public) VALUES ('progress-photos', 'progress-photos', true);

-- Create policies for progress photos storage
CREATE POLICY "Progress photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'progress-photos');

CREATE POLICY "Users can upload their own progress photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own progress photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create table to track progress photos with metadata
CREATE TABLE public.progress_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  photo_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight DECIMAL(5,1),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own progress photos"
ON public.progress_photos FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress photos"
ON public.progress_photos FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress photos"
ON public.progress_photos FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress photos"
ON public.progress_photos FOR DELETE
USING (auth.uid() = user_id);