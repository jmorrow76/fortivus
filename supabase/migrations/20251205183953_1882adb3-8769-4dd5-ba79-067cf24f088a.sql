-- Fix the security definer view issue by recreating with security_invoker
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public 
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  display_name,
  avatar_url
FROM public.profiles;