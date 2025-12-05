-- Create coaching conversations table
CREATE TABLE public.coaching_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'New Conversation',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create coaching messages table
CREATE TABLE public.coaching_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.coaching_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coaching_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view own conversations"
ON public.coaching_conversations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
ON public.coaching_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
ON public.coaching_conversations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
ON public.coaching_conversations FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for messages
CREATE POLICY "Users can view own messages"
ON public.coaching_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.coaching_conversations
  WHERE coaching_conversations.id = coaching_messages.conversation_id
  AND coaching_conversations.user_id = auth.uid()
));

CREATE POLICY "Users can create own messages"
ON public.coaching_messages FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.coaching_conversations
  WHERE coaching_conversations.id = coaching_messages.conversation_id
  AND coaching_conversations.user_id = auth.uid()
));

-- Update timestamp trigger
CREATE TRIGGER update_coaching_conversations_updated_at
BEFORE UPDATE ON public.coaching_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();