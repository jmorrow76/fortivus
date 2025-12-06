
-- Allow admins to update any testimony (for featuring)
CREATE POLICY "Admins can update any testimony"
ON public.testimonies FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));
