-- Add delete policy for admins to delete promo codes
CREATE POLICY "Admins can delete promo codes"
ON public.promo_codes
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));