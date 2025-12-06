-- Create accountability check-ins table
CREATE TABLE public.accountability_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id uuid NOT NULL REFERENCES public.accountability_partnerships(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  prayed_for_partner boolean DEFAULT false,
  partner_progress_note text,
  personal_update text,
  prayer_request text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.accountability_checkins ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view check-ins for their partnerships" ON public.accountability_checkins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM accountability_partnerships ap
      WHERE ap.id = accountability_checkins.partnership_id
      AND (ap.user1_id = auth.uid() OR ap.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can create check-ins for their partnerships" ON public.accountability_checkins
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM accountability_partnerships ap
      WHERE ap.id = accountability_checkins.partnership_id
      AND (ap.user1_id = auth.uid() OR ap.user2_id = auth.uid())
      AND ap.status = 'active'
    )
  );

-- Add last_checkin_reminder column to partnerships
ALTER TABLE public.accountability_partnerships 
ADD COLUMN last_checkin_reminder timestamp with time zone;