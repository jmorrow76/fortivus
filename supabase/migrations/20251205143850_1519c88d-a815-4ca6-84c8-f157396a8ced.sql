-- Remove the foreign key constraint on profiles.user_id to allow simulated users
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;