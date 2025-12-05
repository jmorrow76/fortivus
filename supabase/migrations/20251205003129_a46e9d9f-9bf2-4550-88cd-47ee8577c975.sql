-- Create table for linked social accounts
CREATE TABLE public.social_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  platform text NOT NULL,
  platform_username text,
  access_token text,
  refresh_token text,
  connected_at timestamp with time zone NOT NULL DEFAULT now(),
  auto_post_badges boolean NOT NULL DEFAULT true,
  auto_post_progress boolean NOT NULL DEFAULT false,
  auto_post_workouts boolean NOT NULL DEFAULT false,
  UNIQUE(user_id, platform)
);

-- Enable RLS
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own connections"
ON public.social_connections
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own connections"
ON public.social_connections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections"
ON public.social_connections
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections"
ON public.social_connections
FOR DELETE
USING (auth.uid() = user_id);