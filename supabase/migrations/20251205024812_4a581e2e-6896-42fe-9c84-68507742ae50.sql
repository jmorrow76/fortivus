-- Add macro goal columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN calorie_goal INTEGER DEFAULT 2000,
ADD COLUMN protein_goal INTEGER DEFAULT 150,
ADD COLUMN carbs_goal INTEGER DEFAULT 200,
ADD COLUMN fat_goal INTEGER DEFAULT 65;