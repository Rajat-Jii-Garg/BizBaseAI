-- Notification when someone views your profile
CREATE OR REPLACE FUNCTION public.handle_profile_view_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE viewer_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.viewer_user_id IS NOT NULL AND NEW.viewer_user_id <> NEW.profile_user_id THEN
    IF NOT public.should_notify(NEW.profile_user_id, 'profileViews') THEN RETURN NEW; END IF;
    SELECT full_name INTO viewer_name FROM public.profiles WHERE id = NEW.viewer_user_id;
    PERFORM public.create_notification(
      NEW.profile_user_id, 'profile_view',
      COALESCE(viewer_name, 'Someone') || ' viewed your profile',
      COALESCE(viewer_name, 'Someone') || ' checked out your profile.',
      NULL, NEW.viewer_user_id
    );
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_profile_view ON public.profile_views;
CREATE TRIGGER trg_notify_profile_view AFTER INSERT ON public.profile_views
  FOR EACH ROW EXECUTE FUNCTION public.handle_profile_view_notification();

-- Notification when someone endorses your skill
CREATE OR REPLACE FUNCTION public.handle_endorsement_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE endorser_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.endorsed_user_id <> NEW.endorser_id THEN
    IF NOT public.should_notify(NEW.endorsed_user_id, 'endorsements') THEN RETURN NEW; END IF;
    SELECT full_name INTO endorser_name FROM public.profiles WHERE id = NEW.endorser_id;
    PERFORM public.create_notification(
      NEW.endorsed_user_id, 'endorsement',
      COALESCE(endorser_name, 'Someone') || ' endorsed your skill: ' || COALESCE(NEW.skill, ''),
      COALESCE(endorser_name, 'Someone') || ' endorsed you for ' || COALESCE(NEW.skill, 'a skill') || '.',
      NULL, NEW.endorser_id
    );
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_endorsement ON public.endorsements;
CREATE TRIGGER trg_notify_endorsement AFTER INSERT ON public.endorsements
  FOR EACH ROW EXECUTE FUNCTION public.handle_endorsement_notification();