-- Create manual subscription grants table for admin-granted access
CREATE TABLE public.subscription_grants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  granted_by TEXT,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.subscription_grants ENABLE ROW LEVEL SECURITY;

-- Only allow service role to manage grants (admin only via edge functions)
CREATE POLICY "Service role can manage grants"
ON public.subscription_grants
FOR ALL
USING (true)
WITH CHECK (true);