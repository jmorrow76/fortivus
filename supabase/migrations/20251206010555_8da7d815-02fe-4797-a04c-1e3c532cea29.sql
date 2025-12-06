-- Add image_url columns to forum tables
ALTER TABLE public.forum_topics ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS image_url text;

-- Create storage bucket for forum images
INSERT INTO storage.buckets (id, name, public)
VALUES ('forum-images', 'forum-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload forum images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'forum-images');

-- Allow anyone to view forum images
CREATE POLICY "Anyone can view forum images"
ON storage.objects FOR SELECT
USING (bucket_id = 'forum-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own forum images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'forum-images' AND auth.uid()::text = (storage.foldername(name))[1]);