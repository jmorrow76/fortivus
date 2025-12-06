-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- Service role can insert notifications (for triggers)
CREATE POLICY "Service can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- Create function to notify on achievement comment
CREATE OR REPLACE FUNCTION public.notify_achievement_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  commenter_name text;
  badge_name text;
BEGIN
  -- Don't notify if commenting on own achievement
  IF NEW.user_id = NEW.target_user_id THEN
    RETURN NEW;
  END IF;

  -- Get commenter's display name
  SELECT display_name INTO commenter_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  -- Get badge name if available
  IF NEW.badge_id IS NOT NULL THEN
    SELECT name INTO badge_name
    FROM public.badges
    WHERE id = NEW.badge_id;
  END IF;

  -- Insert notification
  INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
  VALUES (
    NEW.target_user_id,
    'achievement_comment',
    'New Comment on Your Achievement',
    COALESCE(commenter_name, 'Someone') || ' commented on your "' || COALESCE(badge_name, 'achievement') || '" badge',
    '/social',
    jsonb_build_object(
      'comment_id', NEW.id,
      'commenter_id', NEW.user_id,
      'badge_id', NEW.badge_id
    )
  );

  RETURN NEW;
END;
$$;

-- Create trigger for achievement comments
CREATE TRIGGER on_achievement_comment_created
  AFTER INSERT ON public.achievement_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_achievement_comment();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;