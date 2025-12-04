-- Create user follows table
CREATE TABLE public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create achievement comments table
CREATE TABLE public.achievement_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (char_length(comment) <= 500)
);

-- Create activity feed table for tracking achievements
CREATE TABLE public.activity_feed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  xp_earned INTEGER,
  streak_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_follows
CREATE POLICY "Users can view all follows" ON public.user_follows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can follow others" ON public.user_follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.user_follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- RLS Policies for achievement_comments
CREATE POLICY "Users can view all comments" ON public.achievement_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create comments" ON public.achievement_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.achievement_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for activity_feed
CREATE POLICY "Users can view all activities" ON public.activity_feed FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create own activities" ON public.activity_feed FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows(following_id);
CREATE INDEX idx_activity_feed_user ON public.activity_feed(user_id);
CREATE INDEX idx_activity_feed_created ON public.activity_feed(created_at DESC);
CREATE INDEX idx_achievement_comments_target ON public.achievement_comments(target_user_id);