-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can read subscribers" ON public.newsletter_subscribers;

-- Add admin-only read access
CREATE POLICY "Admins can view subscribers" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));