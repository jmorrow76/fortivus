
-- Add image_url column to dm_messages
ALTER TABLE public.dm_messages ADD COLUMN image_url text;

-- Create storage bucket for DM images
INSERT INTO storage.buckets (id, name, public)
VALUES ('dm-images', 'dm-images', true);

-- Storage policies for dm-images bucket
CREATE POLICY "Users can view images in their conversations"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'dm-images' AND
  EXISTS (
    SELECT 1 FROM public.dm_participants dp
    JOIN public.dm_messages dm ON dm.conversation_id = dp.conversation_id
    WHERE dp.user_id = auth.uid()
    AND dm.image_url LIKE '%' || storage.objects.name
  )
);

CREATE POLICY "Users can upload images to their conversations"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'dm-images' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own uploaded images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'dm-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
