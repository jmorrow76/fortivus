-- Create table for exercise favorites
CREATE TABLE public.exercise_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Create table for exercise playlists
CREATE TABLE public.exercise_playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for playlist items
CREATE TABLE public.exercise_playlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.exercise_playlists(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, video_id)
);

-- Enable RLS
ALTER TABLE public.exercise_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_playlist_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for exercise_favorites
CREATE POLICY "Users can view own favorites" ON public.exercise_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own favorites" ON public.exercise_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.exercise_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for exercise_playlists
CREATE POLICY "Users can view own playlists" ON public.exercise_playlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own playlists" ON public.exercise_playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists" ON public.exercise_playlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists" ON public.exercise_playlists
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for exercise_playlist_items
CREATE POLICY "Users can view own playlist items" ON public.exercise_playlist_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.exercise_playlists 
    WHERE id = exercise_playlist_items.playlist_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create own playlist items" ON public.exercise_playlist_items
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.exercise_playlists 
    WHERE id = exercise_playlist_items.playlist_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own playlist items" ON public.exercise_playlist_items
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.exercise_playlists 
    WHERE id = exercise_playlist_items.playlist_id AND user_id = auth.uid()
  ));

-- Trigger for updating updated_at on playlists
CREATE TRIGGER update_exercise_playlists_updated_at
  BEFORE UPDATE ON public.exercise_playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();