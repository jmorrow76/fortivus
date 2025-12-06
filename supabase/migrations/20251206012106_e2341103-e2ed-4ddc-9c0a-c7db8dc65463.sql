
-- Create DM conversations table
CREATE TABLE public.dm_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create participants table to link users to conversations
CREATE TABLE public.dm_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.dm_conversations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  last_read_at timestamp with time zone DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Create messages table
CREATE TABLE public.dm_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.dm_conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_read boolean NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.dm_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_messages ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_dm_participants_user ON public.dm_participants(user_id);
CREATE INDEX idx_dm_participants_conversation ON public.dm_participants(conversation_id);
CREATE INDEX idx_dm_messages_conversation ON public.dm_messages(conversation_id);
CREATE INDEX idx_dm_messages_created ON public.dm_messages(created_at DESC);

-- RLS Policies for dm_conversations
CREATE POLICY "Users can view conversations they're part of"
ON public.dm_conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.dm_participants
    WHERE conversation_id = dm_conversations.id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create conversations"
ON public.dm_conversations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for dm_participants
CREATE POLICY "Users can view participants in their conversations"
ON public.dm_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.dm_participants p
    WHERE p.conversation_id = dm_participants.conversation_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add participants to conversations"
ON public.dm_participants FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own participation"
ON public.dm_participants FOR UPDATE
USING (user_id = auth.uid());

-- RLS Policies for dm_messages
CREATE POLICY "Users can view messages in their conversations"
ON public.dm_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.dm_participants
    WHERE conversation_id = dm_messages.conversation_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their conversations"
ON public.dm_messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.dm_participants
    WHERE conversation_id = dm_messages.conversation_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update messages they sent"
ON public.dm_messages FOR UPDATE
USING (sender_id = auth.uid());

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_messages;

-- Trigger to update conversation updated_at
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.dm_conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_new_message
AFTER INSERT ON public.dm_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_timestamp();

-- Function to create notification on new message
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  sender_name text;
  recipient_id uuid;
BEGIN
  -- Get sender's display name
  SELECT display_name INTO sender_name
  FROM public.profiles
  WHERE user_id = NEW.sender_id;

  -- Get the other participant(s)
  FOR recipient_id IN
    SELECT user_id FROM public.dm_participants
    WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
    VALUES (
      recipient_id,
      'direct_message',
      'New Message',
      COALESCE(sender_name, 'Someone') || ' sent you a message',
      '/messages',
      jsonb_build_object(
        'message_id', NEW.id,
        'conversation_id', NEW.conversation_id,
        'sender_id', NEW.sender_id
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_new_dm_notification
AFTER INSERT ON public.dm_messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_message();
