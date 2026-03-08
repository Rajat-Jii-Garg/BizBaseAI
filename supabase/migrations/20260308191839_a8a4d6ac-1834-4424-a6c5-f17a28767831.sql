
-- Change bizcoins column from integer to numeric to support decimals
ALTER TABLE public.profiles ALTER COLUMN bizcoins TYPE numeric(10,2) USING COALESCE(bizcoins, 0)::numeric(10,2);
ALTER TABLE public.profiles ALTER COLUMN bizcoins SET DEFAULT 0;

-- Update award_bizcoins function to accept numeric
CREATE OR REPLACE FUNCTION public.award_bizcoins(_user_id uuid, _amount numeric, _reason text DEFAULT NULL)
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

-- Update all BizCoin trigger functions with decimal values

-- Post: +0.35
CREATE OR REPLACE FUNCTION public.handle_bizcoins_post()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN PERFORM public.award_bizcoins(NEW.user_id, 0.35); END IF;
  RETURN NEW;
END;
$$;

-- Like: +0.20
CREATE OR REPLACE FUNCTION public.handle_bizcoins_like()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN PERFORM public.award_bizcoins(NEW.user_id, 0.20); END IF;
  RETURN NEW;
END;
$$;

-- Comment: +0.45
CREATE OR REPLACE FUNCTION public.handle_bizcoins_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN PERFORM public.award_bizcoins(NEW.user_id, 0.45); END IF;
  RETURN NEW;
END;
$$;

-- Share: +1.02
CREATE OR REPLACE FUNCTION public.handle_bizcoins_share()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN PERFORM public.award_bizcoins(NEW.user_id, 1.02); END IF;
  RETURN NEW;
END;
$$;

-- Repost: +0.24
CREATE OR REPLACE FUNCTION public.handle_bizcoins_repost()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN PERFORM public.award_bizcoins(NEW.user_id, 0.24); END IF;
  RETURN NEW;
END;
$$;

-- Follow: +1.05
CREATE OR REPLACE FUNCTION public.handle_bizcoins_follow()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN PERFORM public.award_bizcoins(NEW.follower_id, 1.05); END IF;
  RETURN NEW;
END;
$$;

-- Connection request: +0.15, acceptance: +0.50 each
CREATE OR REPLACE FUNCTION public.handle_bizcoins_connection()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_bizcoins(NEW.requester_id, 0.15);
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    PERFORM public.award_bizcoins(NEW.requester_id, 0.50);
    PERFORM public.award_bizcoins(NEW.addressee_id, 0.50);
  END IF;
  RETURN NEW;
END;
$$;

-- Event created: +1.50
CREATE OR REPLACE FUNCTION public.handle_bizcoins_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN PERFORM public.award_bizcoins(NEW.user_id, 1.50); END IF;
  RETURN NEW;
END;
$$;

-- Event attend: +0.40
CREATE OR REPLACE FUNCTION public.handle_bizcoins_event_attend()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN PERFORM public.award_bizcoins(NEW.user_id, 0.40); END IF;
  RETURN NEW;
END;
$$;

-- Job posted: +2.00
CREATE OR REPLACE FUNCTION public.handle_bizcoins_job()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN PERFORM public.award_bizcoins(NEW.employer_id, 2.00); END IF;
  RETURN NEW;
END;
$$;

-- Job apply: +0.35
CREATE OR REPLACE FUNCTION public.handle_bizcoins_job_apply()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN PERFORM public.award_bizcoins(NEW.applicant_id, 0.35); END IF;
  RETURN NEW;
END;
$$;

-- Community create: +1.25
CREATE OR REPLACE FUNCTION public.handle_bizcoins_community_create()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN PERFORM public.award_bizcoins(NEW.user_id, 1.25); END IF;
  RETURN NEW;
END;
$$;

-- Community join: +0.30
CREATE OR REPLACE FUNCTION public.handle_bizcoins_community_join()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN PERFORM public.award_bizcoins(NEW.user_id, 0.30); END IF;
  RETURN NEW;
END;
$$;

-- Endorsement: giver +0.25, receiver +0.40
CREATE OR REPLACE FUNCTION public.handle_bizcoins_endorsement()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_bizcoins(NEW.endorser_id, 0.25);
    PERFORM public.award_bizcoins(NEW.endorsed_user_id, 0.40);
  END IF;
  RETURN NEW;
END;
$$;
