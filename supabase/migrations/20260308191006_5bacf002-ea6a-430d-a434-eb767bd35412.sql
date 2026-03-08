
-- Create a secure function to award BizCoins (prevents race conditions)
CREATE OR REPLACE FUNCTION public.award_bizcoins(_user_id uuid, _amount integer, _reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF _user_id IS NULL OR _amount <= 0 THEN RETURN; END IF;
  
  UPDATE public.profiles
  SET bizcoins = COALESCE(bizcoins, 0) + _amount
  WHERE id = _user_id;
END;
$$;

-- Trigger: Award coins on post creation (+10)
CREATE OR REPLACE FUNCTION public.handle_bizcoins_post()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_bizcoins(NEW.user_id, 10);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bizcoins_post ON public.posts;
CREATE TRIGGER trg_bizcoins_post
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_bizcoins_post();

-- Trigger: Award coins on like (+2)
CREATE OR REPLACE FUNCTION public.handle_bizcoins_like()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_bizcoins(NEW.user_id, 2);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bizcoins_like ON public.post_likes;
CREATE TRIGGER trg_bizcoins_like
  AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_bizcoins_like();

-- Trigger: Award coins on comment/feedback (+5)
CREATE OR REPLACE FUNCTION public.handle_bizcoins_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_bizcoins(NEW.user_id, 5);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bizcoins_comment ON public.post_comments;
CREATE TRIGGER trg_bizcoins_comment
  AFTER INSERT ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_bizcoins_comment();

-- Trigger: Award coins on share (+15)
CREATE OR REPLACE FUNCTION public.handle_bizcoins_share()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_bizcoins(NEW.user_id, 15);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bizcoins_share ON public.post_shares;
CREATE TRIGGER trg_bizcoins_share
  AFTER INSERT ON public.post_shares
  FOR EACH ROW EXECUTE FUNCTION public.handle_bizcoins_share();

-- Trigger: Award coins on repost (+10)
CREATE OR REPLACE FUNCTION public.handle_bizcoins_repost()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_bizcoins(NEW.user_id, 10);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bizcoins_repost ON public.post_reposts;
CREATE TRIGGER trg_bizcoins_repost
  AFTER INSERT ON public.post_reposts
  FOR EACH ROW EXECUTE FUNCTION public.handle_bizcoins_repost();

-- Trigger: Award coins on connection accepted (+5 to both)
CREATE OR REPLACE FUNCTION public.handle_bizcoins_connection()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Award requester for sending request
    PERFORM public.award_bizcoins(NEW.requester_id, 2);
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Award both on acceptance
    PERFORM public.award_bizcoins(NEW.requester_id, 5);
    PERFORM public.award_bizcoins(NEW.addressee_id, 5);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bizcoins_connection ON public.connections;
CREATE TRIGGER trg_bizcoins_connection
  AFTER INSERT OR UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.handle_bizcoins_connection();

-- Trigger: Award coins on follow (+3)
CREATE OR REPLACE FUNCTION public.handle_bizcoins_follow()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_bizcoins(NEW.follower_id, 3);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bizcoins_follow ON public.follows;
CREATE TRIGGER trg_bizcoins_follow
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_bizcoins_follow();

-- Trigger: Award coins on event creation (+20)
CREATE OR REPLACE FUNCTION public.handle_bizcoins_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_bizcoins(NEW.user_id, 20);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bizcoins_event ON public.events;
CREATE TRIGGER trg_bizcoins_event
  AFTER INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_bizcoins_event();

-- Trigger: Award coins on job posted (+25)
CREATE OR REPLACE FUNCTION public.handle_bizcoins_job()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_bizcoins(NEW.employer_id, 25);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bizcoins_job ON public.jobs;
CREATE TRIGGER trg_bizcoins_job
  AFTER INSERT ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.handle_bizcoins_job();

-- Trigger: Award coins on community creation (+15)
CREATE OR REPLACE FUNCTION public.handle_bizcoins_community_create()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_bizcoins(NEW.user_id, 15);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bizcoins_community_create ON public.communities;
CREATE TRIGGER trg_bizcoins_community_create
  AFTER INSERT ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.handle_bizcoins_community_create();

-- Trigger: Award coins on joining a community (+3)
CREATE OR REPLACE FUNCTION public.handle_bizcoins_community_join()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_bizcoins(NEW.user_id, 3);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bizcoins_community_join ON public.community_members;
CREATE TRIGGER trg_bizcoins_community_join
  AFTER INSERT ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_bizcoins_community_join();

-- Trigger: Award coins on event attendance (+5)
CREATE OR REPLACE FUNCTION public.handle_bizcoins_event_attend()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_bizcoins(NEW.user_id, 5);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bizcoins_event_attend ON public.event_attendees;
CREATE TRIGGER trg_bizcoins_event_attend
  AFTER INSERT ON public.event_attendees
  FOR EACH ROW EXECUTE FUNCTION public.handle_bizcoins_event_attend();

-- Trigger: Award coins on job application (+5)
CREATE OR REPLACE FUNCTION public.handle_bizcoins_job_apply()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_bizcoins(NEW.applicant_id, 5);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bizcoins_job_apply ON public.job_applications;
CREATE TRIGGER trg_bizcoins_job_apply
  AFTER INSERT ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_bizcoins_job_apply();

-- Trigger: Award coins on endorsement given (+3) and received (+5)
CREATE OR REPLACE FUNCTION public.handle_bizcoins_endorsement()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_bizcoins(NEW.endorser_id, 3);
    PERFORM public.award_bizcoins(NEW.endorsed_user_id, 5);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bizcoins_endorsement ON public.endorsements;
CREATE TRIGGER trg_bizcoins_endorsement
  AFTER INSERT ON public.endorsements
  FOR EACH ROW EXECUTE FUNCTION public.handle_bizcoins_endorsement();
