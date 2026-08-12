CREATE TABLE public.pods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  commitment TEXT NOT NULL,
  focus TEXT,
  meeting_rhythm TEXT NOT NULL DEFAULT 'daily',
  max_members INTEGER NOT NULL DEFAULT 5,
  created_by UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.pod_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pod_id UUID NOT NULL REFERENCES public.pods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pod_id, user_id)
);

CREATE TABLE public.pod_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pod_id UUID NOT NULL REFERENCES public.pods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  kept_commitment BOOLEAN NOT NULL DEFAULT false,
  note TEXT,
  prayer_request TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pod_id, user_id, checkin_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pods TO authenticated;
GRANT ALL ON public.pods TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pod_members TO authenticated;
GRANT ALL ON public.pod_members TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pod_checkins TO authenticated;
GRANT ALL ON public.pod_checkins TO service_role;

CREATE OR REPLACE FUNCTION public.is_pod_member(_pod_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.pod_members WHERE pod_id = _pod_id AND user_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.pod_member_count(_pod_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int FROM public.pod_members WHERE pod_id = _pod_id
$$;

ALTER TABLE public.pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view active pods" ON public.pods
FOR SELECT TO authenticated USING (is_active = true OR created_by = auth.uid() OR public.is_pod_member(id, auth.uid()));

CREATE POLICY "Users can create pods" ON public.pods
FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creators can update their pods" ON public.pods
FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creators can delete their pods" ON public.pods
FOR DELETE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Members can view pod rosters" ON public.pod_members
FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_pod_member(pod_id, auth.uid()));

CREATE POLICY "Users can join pods with space" ON public.pod_members
FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid()
  AND public.pod_member_count(pod_id) < (SELECT max_members FROM public.pods WHERE id = pod_id)
);

CREATE POLICY "Users can leave pods" ON public.pod_members
FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Pod members can view checkins" ON public.pod_checkins
FOR SELECT TO authenticated USING (public.is_pod_member(pod_id, auth.uid()));

CREATE POLICY "Members can add own checkins" ON public.pod_checkins
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.is_pod_member(pod_id, auth.uid()));

CREATE POLICY "Members can update own checkins" ON public.pod_checkins
FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members can delete own checkins" ON public.pod_checkins
FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER update_pods_updated_at BEFORE UPDATE ON public.pods
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();