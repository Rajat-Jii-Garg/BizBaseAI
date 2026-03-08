
-- Trigger for connection requests
CREATE OR REPLACE FUNCTION public.handle_connection_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  requester_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT full_name INTO requester_name FROM public.profiles WHERE id = NEW.requester_id;
    
    PERFORM public.create_notification(
      NEW.addressee_id,
      'connection',
      COALESCE(requester_name, 'Someone') || ' sent you a connection request',
      COALESCE(requester_name, 'Someone') || ' wants to connect with you.',
      NULL,
      NEW.requester_id
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    SELECT full_name INTO requester_name FROM public.profiles WHERE id = NEW.addressee_id;
    
    PERFORM public.create_notification(
      NEW.requester_id,
      'connection',
      COALESCE(requester_name, 'Someone') || ' accepted your connection request',
      COALESCE(requester_name, 'Someone') || ' is now connected with you.',
      NULL,
      NEW.addressee_id
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_connection_change
  AFTER INSERT OR UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.handle_connection_notification();

-- Trigger for follows
CREATE OR REPLACE FUNCTION public.handle_follow_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  follower_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT full_name INTO follower_name FROM public.profiles WHERE id = NEW.follower_id;
    
    IF NEW.follower_id != NEW.following_id THEN
      PERFORM public.create_notification(
        NEW.following_id,
        'follow',
        COALESCE(follower_name, 'Someone') || ' started following you',
        COALESCE(follower_name, 'Someone') || ' is now following you.',
        NULL,
        NEW.follower_id
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_follow_insert
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_follow_notification();

-- Trigger for reposts
CREATE OR REPLACE FUNCTION public.handle_repost_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  post_owner_id UUID;
  reposter_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT p.user_id INTO post_owner_id FROM public.posts p WHERE p.id = NEW.post_id;
    SELECT pr.full_name INTO reposter_name FROM public.profiles pr WHERE pr.id = NEW.user_id;
    
    IF post_owner_id IS NOT NULL AND post_owner_id != NEW.user_id THEN
      PERFORM public.create_notification(
        post_owner_id,
        'repost',
        COALESCE(reposter_name, 'Someone') || ' reposted your post',
        COALESCE(reposter_name, 'Someone') || ' reposted your post.',
        NEW.post_id,
        NEW.user_id
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_repost_insert
  AFTER INSERT ON public.post_reposts
  FOR EACH ROW EXECUTE FUNCTION public.handle_repost_notification();

-- Trigger for event registration
CREATE OR REPLACE FUNCTION public.handle_event_attendee_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_owner_id UUID;
  event_title TEXT;
  attendee_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT e.user_id, e.title INTO event_owner_id, event_title FROM public.events e WHERE e.id = NEW.event_id;
    SELECT pr.full_name INTO attendee_name FROM public.profiles pr WHERE pr.id = NEW.user_id;
    
    IF event_owner_id IS NOT NULL AND event_owner_id != NEW.user_id THEN
      PERFORM public.create_notification(
        event_owner_id,
        'event',
        COALESCE(attendee_name, 'Someone') || ' registered for your event',
        COALESCE(attendee_name, 'Someone') || ' registered for "' || COALESCE(event_title, 'your event') || '".',
        NULL,
        NEW.user_id
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_event_attendee_insert
  AFTER INSERT ON public.event_attendees
  FOR EACH ROW EXECUTE FUNCTION public.handle_event_attendee_notification();

-- Trigger for job applications
CREATE OR REPLACE FUNCTION public.handle_job_application_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  job_owner_id UUID;
  job_title TEXT;
  applicant_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT j.employer_id, j.title INTO job_owner_id, job_title FROM public.jobs j WHERE j.id = NEW.job_id;
    SELECT pr.full_name INTO applicant_name FROM public.profiles pr WHERE pr.id = NEW.applicant_id;
    
    IF job_owner_id IS NOT NULL AND job_owner_id != NEW.applicant_id THEN
      PERFORM public.create_notification(
        job_owner_id,
        'job_application',
        COALESCE(applicant_name, 'Someone') || ' applied to your job',
        COALESCE(applicant_name, 'Someone') || ' applied for "' || COALESCE(job_title, 'your job') || '".',
        NULL,
        NEW.applicant_id
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_job_application_insert
  AFTER INSERT ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_job_application_notification();

-- Trigger for community join
CREATE OR REPLACE FUNCTION public.handle_community_join_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  community_owner_id UUID;
  community_name TEXT;
  member_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT c.user_id, c.name INTO community_owner_id, community_name FROM public.communities c WHERE c.id = NEW.community_id;
    SELECT pr.full_name INTO member_name FROM public.profiles pr WHERE pr.id = NEW.user_id;
    
    IF community_owner_id IS NOT NULL AND community_owner_id != NEW.user_id THEN
      PERFORM public.create_notification(
        community_owner_id,
        'community',
        COALESCE(member_name, 'Someone') || ' joined your community',
        COALESCE(member_name, 'Someone') || ' joined "' || COALESCE(community_name, 'your community') || '".',
        NULL,
        NEW.user_id
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_community_member_insert
  AFTER INSERT ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_community_join_notification();

-- Also create triggers for the existing notification functions that don't have triggers yet
CREATE TRIGGER on_post_like_notification
  AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_like_notification();

CREATE TRIGGER on_post_comment_notification
  AFTER INSERT ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_comment_notification();

CREATE TRIGGER on_post_share_notification
  AFTER INSERT ON public.post_shares
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_share_notification();
