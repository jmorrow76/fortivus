-- Create trigger function to notify partner on check-in
CREATE OR REPLACE FUNCTION public.notify_partner_on_checkin()
RETURNS TRIGGER AS $$
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
      'accountability_checkin',
      'Partner Check-In',
      submitter_name || ' submitted their weekly check-in. See how they''re doing!',
      '/accountability',
      jsonb_build_object(
        'checkin_id', NEW.id,
        'partnership_id', NEW.partnership_id,
        'submitter_id', NEW.user_id,
        'has_prayer_request', NEW.prayer_request IS NOT NULL AND NEW.prayer_request != ''
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS on_accountability_checkin_notify ON accountability_checkins;
CREATE TRIGGER on_accountability_checkin_notify
  AFTER INSERT ON accountability_checkins
  FOR EACH ROW
  EXECUTE FUNCTION notify_partner_on_checkin();