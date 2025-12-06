-- Create prayer journal entries table for accountability partners
CREATE TABLE public.prayer_journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID NOT NULL REFERENCES public.accountability_partnerships(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  request_text TEXT NOT NULL,
  is_answered BOOLEAN NOT NULL DEFAULT false,
  answered_at TIMESTAMP WITH TIME ZONE,
  answered_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prayer_journal_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view entries for their partnerships
CREATE POLICY "Users can view prayer journal entries for their partnerships"
ON public.prayer_journal_entries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM accountability_partnerships ap
    WHERE ap.id = prayer_journal_entries.partnership_id
    AND (ap.user1_id = auth.uid() OR ap.user2_id = auth.uid())
    AND ap.status = 'active'
  )
);

-- Policy: Users can create entries for their partnerships
CREATE POLICY "Users can create prayer journal entries for their partnerships"
ON public.prayer_journal_entries
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM accountability_partnerships ap
    WHERE ap.id = prayer_journal_entries.partnership_id
    AND (ap.user1_id = auth.uid() OR ap.user2_id = auth.uid())
    AND ap.status = 'active'
  )
);

-- Policy: Users can update entries in their partnerships (to mark answered)
CREATE POLICY "Users can update prayer journal entries for their partnerships"
ON public.prayer_journal_entries
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM accountability_partnerships ap
    WHERE ap.id = prayer_journal_entries.partnership_id
    AND (ap.user1_id = auth.uid() OR ap.user2_id = auth.uid())
    AND ap.status = 'active'
  )
);

-- Policy: Users can delete their own entries
CREATE POLICY "Users can delete their own prayer journal entries"
ON public.prayer_journal_entries
FOR DELETE
USING (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX idx_prayer_journal_partnership ON public.prayer_journal_entries(partnership_id);
CREATE INDEX idx_prayer_journal_created ON public.prayer_journal_entries(created_at DESC);