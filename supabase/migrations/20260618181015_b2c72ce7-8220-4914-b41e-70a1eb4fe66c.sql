
-- 1. Preference helper
CREATE OR REPLACE FUNCTION public.should_notify(_user_id uuid, _pref_key text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  prefs jsonb;
BEGIN
  IF _user_id IS NULL THEN RETURN false; END IF;
  SELECT notification_preferences INTO prefs FROM public.profiles WHERE id = _user_id;
  IF prefs IS NULL THEN RETURN true; END IF; -- default on
  IF prefs ? _pref_key THEN
    RETURN COALESCE((prefs ->> _pref_key)::boolean, true);
  END IF;
  RETURN true;
END;
$$;

-- 2. Update notification trigger functions to honor preferences
CREATE OR REPLACE FUNCTION public.handle_post_like_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE post_owner_id UUID; liker_name TEXT;
BEGIN
  IF TG_OP='INSERT' THEN
    SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
    IF post_owner_id IS NULL OR post_owner_id = NEW.user_id THEN RETURN NEW; END IF;
    IF NOT public.should_notify(post_owner_id, 'postLikes') THEN RETURN NEW; END IF;
    SELECT full_name INTO liker_name FROM public.profiles WHERE id = NEW.user_id;
    PERFORM public.create_notification(post_owner_id, 'like',
      COALESCE(liker_name,'Someone')||' liked your post',
      COALESCE(liker_name,'Someone')||' liked your post.',
      NEW.post_id, NEW.user_id);
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.handle_post_comment_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE post_owner_id UUID; commenter_name TEXT;
BEGIN
  IF TG_OP='INSERT' THEN
    SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
    IF post_owner_id IS NULL OR post_owner_id = NEW.user_id THEN RETURN NEW; END IF;
    IF NOT public.should_notify(post_owner_id, 'postComments') THEN RETURN NEW; END IF;
    SELECT full_name INTO commenter_name FROM public.profiles WHERE id = NEW.user_id;
    PERFORM public.create_notification(post_owner_id, 'comment',
      COALESCE(commenter_name,'Someone')||' commented on your post',
      COALESCE(commenter_name,'Someone')||' commented on your post.',
      NEW.post_id, NEW.user_id);
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.handle_post_share_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE post_owner_id UUID; sharer_name TEXT;
BEGIN
  IF TG_OP='INSERT' THEN
    SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
    IF post_owner_id IS NULL OR post_owner_id = NEW.user_id THEN RETURN NEW; END IF;
    IF NOT public.should_notify(post_owner_id, 'postShares') THEN RETURN NEW; END IF;
    SELECT full_name INTO sharer_name FROM public.profiles WHERE id = NEW.user_id;
    PERFORM public.create_notification(post_owner_id, 'share',
      COALESCE(sharer_name,'Someone')||' shared your post',
      COALESCE(sharer_name,'Someone')||' shared your post.',
      NEW.post_id, NEW.user_id);
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.handle_connection_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE requester_name TEXT; addressee_name TEXT;
BEGIN
  IF TG_OP='INSERT' THEN
    IF NOT public.should_notify(NEW.addressee_id, 'connectionRequests') THEN RETURN NEW; END IF;
    SELECT full_name INTO requester_name FROM public.profiles WHERE id = NEW.requester_id;
    PERFORM public.create_notification(NEW.addressee_id, 'connection',
      COALESCE(requester_name,'Someone')||' sent you a connection request',
      COALESCE(requester_name,'Someone')||' wants to connect with you.',
      NULL, NEW.requester_id);
  ELSIF TG_OP='UPDATE' AND NEW.status='accepted' AND OLD.status='pending' THEN
    IF NOT public.should_notify(NEW.requester_id, 'connectionRequests') THEN RETURN NEW; END IF;
    SELECT full_name INTO addressee_name FROM public.profiles WHERE id = NEW.addressee_id;
    PERFORM public.create_notification(NEW.requester_id, 'connection',
      COALESCE(addressee_name,'Someone')||' accepted your connection request',
      COALESCE(addressee_name,'Someone')||' is now connected with you.',
      NULL, NEW.addressee_id);
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.handle_follow_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE follower_name TEXT;
BEGIN
  IF TG_OP='INSERT' AND NEW.follower_id <> NEW.following_id THEN
    IF NOT public.should_notify(NEW.following_id, 'networkUpdates') THEN RETURN NEW; END IF;
    SELECT full_name INTO follower_name FROM public.profiles WHERE id = NEW.follower_id;
    PERFORM public.create_notification(NEW.following_id, 'follow',
      COALESCE(follower_name,'Someone')||' started following you',
      COALESCE(follower_name,'Someone')||' is now following you.',
      NULL, NEW.follower_id);
  END IF;
  RETURN NEW;
END; $$;

-- Message notification trigger function (new)
CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE sender_name TEXT; preview TEXT;
BEGIN
  IF TG_OP='INSERT' AND NEW.receiver_id IS NOT NULL AND NEW.receiver_id <> NEW.sender_id THEN
    SELECT full_name INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
    preview := substring(COALESCE(NEW.content,''), 1, 80);
    PERFORM public.create_notification(NEW.receiver_id, 'message',
      'New message from '||COALESCE(sender_name,'someone'),
      preview, NULL, NEW.sender_id);
  END IF;
  RETURN NEW;
END; $$;

-- 3. Create triggers (drop if exist first)
DROP TRIGGER IF EXISTS trg_notify_post_like ON public.post_likes;
CREATE TRIGGER trg_notify_post_like AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_like_notification();

DROP TRIGGER IF EXISTS trg_notify_post_comment ON public.post_comments;
CREATE TRIGGER trg_notify_post_comment AFTER INSERT ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_comment_notification();

DROP TRIGGER IF EXISTS trg_notify_post_share ON public.post_shares;
CREATE TRIGGER trg_notify_post_share AFTER INSERT ON public.post_shares
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_share_notification();

DROP TRIGGER IF EXISTS trg_notify_post_repost ON public.post_reposts;
CREATE TRIGGER trg_notify_post_repost AFTER INSERT ON public.post_reposts
  FOR EACH ROW EXECUTE FUNCTION public.handle_repost_notification();

DROP TRIGGER IF EXISTS trg_notify_connection ON public.connections;
CREATE TRIGGER trg_notify_connection AFTER INSERT OR UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.handle_connection_notification();

DROP TRIGGER IF EXISTS trg_notify_follow ON public.follows;
CREATE TRIGGER trg_notify_follow AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_follow_notification();

DROP TRIGGER IF EXISTS trg_notify_event_attendee ON public.event_attendees;
CREATE TRIGGER trg_notify_event_attendee AFTER INSERT ON public.event_attendees
  FOR EACH ROW EXECUTE FUNCTION public.handle_event_attendee_notification();

DROP TRIGGER IF EXISTS trg_notify_job_application ON public.job_applications;
CREATE TRIGGER trg_notify_job_application AFTER INSERT ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_job_application_notification();

DROP TRIGGER IF EXISTS trg_notify_community_join ON public.community_members;
CREATE TRIGGER trg_notify_community_join AFTER INSERT ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_community_join_notification();

DROP TRIGGER IF EXISTS trg_notify_new_message ON public.messages;
CREATE TRIGGER trg_notify_new_message AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_message_notification();

-- 4. Realtime publication for notifications
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='notifications') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications';
  END IF;
END $$;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- 5. Digest tracking
CREATE TABLE IF NOT EXISTS public.notification_email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  notification_count int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.notification_email_log TO authenticated;
GRANT ALL ON public.notification_email_log TO service_role;
ALTER TABLE public.notification_email_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own email log" ON public.notification_email_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_notif_email_log_user_sent ON public.notification_email_log(user_id, sent_at DESC);
