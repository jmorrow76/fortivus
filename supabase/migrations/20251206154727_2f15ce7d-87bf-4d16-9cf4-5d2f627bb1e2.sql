
-- Create function to notify partner when a prayer request is added
CREATE OR REPLACE FUNCTION public.notify_partner_on_prayer_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  partner_id uuid;
  submitter_name text;
BEGIN
  -- Find the partner's user_id from the partnership
  SELECT 
    CASE 
      WHEN ap.user1_id = NEW.user_id THEN ap.user2_id
      ELSE ap.user1_id
    END INTO partner_id
  FROM accountability_partnerships ap
  WHERE ap.id = NEW.partnership_id;

  -- Get submitter's display name
  SELECT COALESCE(display_name, 'Your accountability partner') INTO submitter_name
  FROM profiles
  WHERE user_id = NEW.user_id;

  -- Create notification for partner
  IF partner_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES (
      partner_id,
      'prayer_request',
      'New Prayer Request',
      submitter_name || ' added a prayer request to your shared journal',
      '/accountability',
      jsonb_build_object(
        'entry_id', NEW.id,
        'partnership_id', NEW.partnership_id,
        'submitter_id', NEW.user_id
      )
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger for prayer journal entries
CREATE TRIGGER notify_partner_on_prayer_request
AFTER INSERT ON public.prayer_journal_entries
FOR EACH ROW
EXECUTE FUNCTION public.notify_partner_on_prayer_request();
