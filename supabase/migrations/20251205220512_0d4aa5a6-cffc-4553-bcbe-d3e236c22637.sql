-- Add image_url column to articles table
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS image_url text;