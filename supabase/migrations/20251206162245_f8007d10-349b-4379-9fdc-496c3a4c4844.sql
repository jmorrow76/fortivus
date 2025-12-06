-- Add is_weekly_spotlight column to testimonies table
ALTER TABLE public.testimonies 
ADD COLUMN is_weekly_spotlight boolean NOT NULL DEFAULT false;

-- Create a function to ensure only one testimony can be weekly spotlight at a time
CREATE OR REPLACE FUNCTION public.ensure_single_weekly_spotlight()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_weekly_spotlight = true THEN
    -- Remove weekly spotlight from all other testimonies
    UPDATE public.testimonies 
    SET is_weekly_spotlight = false 
    WHERE id != NEW.id AND is_weekly_spotlight = true;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to enforce single weekly spotlight
CREATE TRIGGER enforce_single_weekly_spotlight
BEFORE INSERT OR UPDATE ON public.testimonies
FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_weekly_spotlight();