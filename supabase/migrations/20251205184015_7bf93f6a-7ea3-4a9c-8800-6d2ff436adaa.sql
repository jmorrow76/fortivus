-- Drop the view approach
DROP VIEW IF EXISTS public.profiles_public;

-- Create a security definer function to get public profile fields
CREATE OR REPLACE FUNCTION public.get_public_profiles(user_ids uuid[])
RETURNS TABLE(user_id uuid, display_name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.display_name, p.avatar_url
  FROM public.profiles p
  WHERE p.user_id = ANY(user_ids)
$$;

-- Create a function to get a single public profile
CREATE OR REPLACE FUNCTION public.get_public_profile(target_user_id uuid)
RETURNS TABLE(user_id uuid, display_name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.display_name, p.avatar_url
  FROM public.profiles p
  WHERE p.user_id = target_user_id
$$;