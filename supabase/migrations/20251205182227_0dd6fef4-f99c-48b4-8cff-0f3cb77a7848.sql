-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage grants" ON public.subscription_grants;

-- Create admin-only policies using the existing has_role function
CREATE POLICY "Admins can view subscription grants"
ON public.subscription_grants
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create subscription grants"
ON public.subscription_grants
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update subscription grants"
ON public.subscription_grants
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete subscription grants"
ON public.subscription_grants
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));