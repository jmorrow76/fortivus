-- Create accountability partner requests table for users seeking partners
CREATE TABLE public.accountability_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  prayer_focus text[] DEFAULT '{}',
  fitness_goals text[] DEFAULT '{}',
  preferred_contact_frequency text DEFAULT 'weekly',
  bio text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Create accountability partnerships table
CREATE TABLE public.accountability_partnerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL,
  user2_id uuid NOT NULL,
  status text DEFAULT 'pending', -- pending, active, ended
  initiated_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone,
  UNIQUE(user1_id, user2_id)
);

-- Enable RLS
ALTER TABLE public.accountability_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accountability_partnerships ENABLE ROW LEVEL SECURITY;

-- RLS policies for accountability_requests
CREATE POLICY "Users can view all active requests" ON public.accountability_requests
  FOR SELECT USING (is_active = true OR auth.uid() = user_id);

CREATE POLICY "Users can create own request" ON public.accountability_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own request" ON public.accountability_requests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own request" ON public.accountability_requests
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for accountability_partnerships
CREATE POLICY "Users can view own partnerships" ON public.accountability_partnerships
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create partnerships" ON public.accountability_partnerships
  FOR INSERT WITH CHECK (auth.uid() = initiated_by);

CREATE POLICY "Users can update own partnerships" ON public.accountability_partnerships
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Trigger for updated_at
CREATE TRIGGER update_accountability_requests_updated_at
  BEFORE UPDATE ON public.accountability_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();