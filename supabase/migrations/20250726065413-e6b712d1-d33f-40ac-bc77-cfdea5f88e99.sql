-- Create a function to create notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  recipient_id UUID,
  notification_type TEXT,
  notification_title TEXT,
  notification_content TEXT,
  related_post_id UUID DEFAULT NULL,
  related_user_id UUID DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    content,
    related_id,
    related_user_id
  ) VALUES (
    recipient_id,
    notification_type,
    notification_title,
    notification_content,
    related_post_id,
    related_user_id
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Create trigger function for post likes
CREATE OR REPLACE FUNCTION public.handle_post_like_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  post_owner_id UUID;
  liker_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Get post owner and liker information
    SELECT p.user_id INTO post_owner_id 
    FROM public.posts p 
    WHERE p.id = NEW.post_id;
    
    SELECT pr.full_name INTO liker_name
    FROM public.profiles pr
    WHERE pr.id = NEW.user_id;
    
    -- Only create notification if someone else liked the post
    IF post_owner_id != NEW.user_id THEN
      PERFORM public.create_notification(
        post_owner_id,
        'like',
        COALESCE(liker_name, 'Someone') || ' liked your post',
        COALESCE(liker_name, 'Someone') || ' liked your post.',
        NEW.post_id,
        NEW.user_id
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger function for post comments
CREATE OR REPLACE FUNCTION public.handle_post_comment_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  post_owner_id UUID;
  commenter_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Get post owner and commenter information
    SELECT p.user_id INTO post_owner_id 
    FROM public.posts p 
    WHERE p.id = NEW.post_id;
    
    SELECT pr.full_name INTO commenter_name
    FROM public.profiles pr
    WHERE pr.id = NEW.user_id;
    
    -- Only create notification if someone else commented on the post
    IF post_owner_id != NEW.user_id THEN
      PERFORM public.create_notification(
        post_owner_id,
        'comment',
        COALESCE(commenter_name, 'Someone') || ' commented on your post',
        COALESCE(commenter_name, 'Someone') || ' commented on your post.',
        NEW.post_id,
        NEW.user_id
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger function for post shares
CREATE OR REPLACE FUNCTION public.handle_post_share_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  post_owner_id UUID;
  sharer_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Get post owner and sharer information
    SELECT p.user_id INTO post_owner_id 
    FROM public.posts p 
    WHERE p.id = NEW.post_id;
    
    SELECT pr.full_name INTO sharer_name
    FROM public.profiles pr
    WHERE pr.id = NEW.user_id;
    
    -- Only create notification if someone else shared the post
    IF post_owner_id != NEW.user_id THEN
      PERFORM public.create_notification(
        post_owner_id,
        'share',
        COALESCE(sharer_name, 'Someone') || ' shared your post',
        COALESCE(sharer_name, 'Someone') || ' shared your post.',
        NEW.post_id,
        NEW.user_id
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers
CREATE TRIGGER trigger_post_like_notification
  AFTER INSERT ON public.post_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_post_like_notification();

CREATE TRIGGER trigger_post_comment_notification
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_post_comment_notification();

CREATE TRIGGER trigger_post_share_notification
  AFTER INSERT ON public.post_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_post_share_notification();