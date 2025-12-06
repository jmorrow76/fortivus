
-- Create function to notify partner when a prayer is marked as answered
CREATE OR REPLACE FUNCTION public.notify_partner_on_prayer_answered()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  partner_id uuid;
  updater_name text;
BEGIN
  -- Only trigger if is_answered changed from false to true
  IF OLD.is_answered = false AND NEW.is_answered = true THEN
    -- Find the partner's user_id (the one who didn't update)
    SELECT 
      CASE 
        WHEN ap.user1_id = NEW.user_id THEN ap.user2_id
        ELSE ap.user1_id
      END INTO partner_id
    FROM accountability_partnerships ap
    WHERE ap.id = NEW.partnership_id;

    -- Get updater's display name
    SELECT COALESCE(display_name, 'Your accountability partner') INTO updater_name
    FROM profiles
    WHERE user_id = NEW.user_id;

    -- Create notification for partner (only if they're different from updater)
    IF partner_id IS NOT NULL AND partner_id != NEW.user_id THEN
      INSERT INTO notifications (user_id, type, title, message, link, metadata)
      VALUES (
        partner_id,
        'prayer_answered',
        'Prayer Answered!',
        updater_name || ' marked a prayer as answered in your shared journal',
        '/accountability',
        jsonb_build_object(
          'entry_id', NEW.id,
          'partnership_id', NEW.partnership_id,
          'updater_id', NEW.user_id
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger for prayer answered
CREATE TRIGGER notify_partner_on_prayer_answered
AFTER UPDATE ON public.prayer_journal_entries
FOR EACH ROW
EXECUTE FUNCTION public.notify_partner_on_prayer_answered();
