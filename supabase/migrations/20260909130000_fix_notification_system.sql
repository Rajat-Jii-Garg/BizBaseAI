BEGIN;

-- =========================================================
-- 1. REMOVE LEGACY DUPLICATE NOTIFICATION TRIGGERS
-- =========================================================

-- Post likes
DROP TRIGGER IF EXISTS trigger_post_like_notification
ON public.post_likes;

DROP TRIGGER IF EXISTS on_post_like_notification
ON public.post_likes;

DROP TRIGGER IF EXISTS trg_notify_post_like
ON public.post_likes;


-- Post comments
DROP TRIGGER IF EXISTS trigger_post_comment_notification
ON public.post_comments;

DROP TRIGGER IF EXISTS on_post_comment_notification
ON public.post_comments;

DROP TRIGGER IF EXISTS trg_notify_post_comment
ON public.post_comments;


-- Post shares
DROP TRIGGER IF EXISTS trigger_post_share_notification
ON public.post_shares;

DROP TRIGGER IF EXISTS on_post_share_notification
ON public.post_shares;

DROP TRIGGER IF EXISTS trg_notify_post_share
ON public.post_shares;


-- Reposts
DROP TRIGGER IF EXISTS on_repost_insert
ON public.post_reposts;

DROP TRIGGER IF EXISTS trg_notify_post_repost
ON public.post_reposts;


-- Connections
DROP TRIGGER IF EXISTS on_connection_change
ON public.connections;

DROP TRIGGER IF EXISTS trg_notify_connection
ON public.connections;


-- Follows
DROP TRIGGER IF EXISTS on_follow_insert
ON public.follows;

DROP TRIGGER IF EXISTS trg_notify_follow
ON public.follows;


-- Events
DROP TRIGGER IF EXISTS on_event_attendee_insert
ON public.event_attendees;

DROP TRIGGER IF EXISTS trg_notify_event_attendee
ON public.event_attendees;


-- Job applications
DROP TRIGGER IF EXISTS on_job_application_insert
ON public.job_applications;

DROP TRIGGER IF EXISTS trg_notify_job_application
ON public.job_applications;


-- Communities
DROP TRIGGER IF EXISTS on_community_member_insert
ON public.community_members;

DROP TRIGGER IF EXISTS trg_notify_community_join
ON public.community_members;


-- Messages
DROP TRIGGER IF EXISTS trg_notify_new_message
ON public.messages;


-- =========================================================
-- 2. REMOVE DUPLICATE POST COUNT TRIGGERS
-- =========================================================

DROP TRIGGER IF EXISTS update_likes_count
ON public.post_likes;

DROP TRIGGER IF EXISTS trigger_update_post_likes_count
ON public.post_likes;


DROP TRIGGER IF EXISTS update_comments_count
ON public.post_comments;

DROP TRIGGER IF EXISTS trigger_update_post_comments_count
ON public.post_comments;


DROP TRIGGER IF EXISTS update_shares_count
ON public.post_shares;

DROP TRIGGER IF EXISTS trigger_update_post_shares_count
ON public.post_shares;


-- =========================================================
-- 3. RECREATE ONE SINGLE POST COUNT TRIGGER PER ACTION
-- =========================================================

CREATE TRIGGER trg_update_post_likes_count
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_post_counts();


CREATE TRIGGER trg_update_post_comments_count
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_post_counts();


CREATE TRIGGER trg_update_post_shares_count
AFTER INSERT OR DELETE ON public.post_shares
FOR EACH ROW
EXECUTE FUNCTION public.update_post_counts();


-- =========================================================
-- 4. RECREATE ONE SINGLE NOTIFICATION TRIGGER PER ACTION
-- =========================================================

-- Likes
CREATE TRIGGER trg_notify_post_like
AFTER INSERT ON public.post_likes
FOR EACH ROW
EXECUTE FUNCTION public.handle_post_like_notification();


-- Comments
CREATE TRIGGER trg_notify_post_comment
AFTER INSERT ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.handle_post_comment_notification();


-- Shares
CREATE TRIGGER trg_notify_post_share
AFTER INSERT ON public.post_shares
FOR EACH ROW
EXECUTE FUNCTION public.handle_post_share_notification();


-- Reposts
CREATE TRIGGER trg_notify_post_repost
AFTER INSERT ON public.post_reposts
FOR EACH ROW
EXECUTE FUNCTION public.handle_repost_notification();


-- Connections
CREATE TRIGGER trg_notify_connection
AFTER INSERT OR UPDATE ON public.connections
FOR EACH ROW
EXECUTE FUNCTION public.handle_connection_notification();


-- Follows
CREATE TRIGGER trg_notify_follow
AFTER INSERT ON public.follows
FOR EACH ROW
EXECUTE FUNCTION public.handle_follow_notification();


-- Events
CREATE TRIGGER trg_notify_event_attendee
AFTER INSERT ON public.event_attendees
FOR EACH ROW
EXECUTE FUNCTION public.handle_event_attendee_notification();


-- Job applications
CREATE TRIGGER trg_notify_job_application
AFTER INSERT ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.handle_job_application_notification();


-- Communities
CREATE TRIGGER trg_notify_community_join
AFTER INSERT ON public.community_members
FOR EACH ROW
EXECUTE FUNCTION public.handle_community_join_notification();


-- Messages
CREATE TRIGGER trg_notify_new_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_message_notification();


-- =========================================================
-- 5. REMOVE HISTORICAL DUPLICATE NOTIFICATIONS
-- =========================================================
--
-- Multiple trigger executions for the same database action
-- use the same transaction timestamp because created_at uses
-- PostgreSQL now().
--
-- Keep exactly one copy of identical notification rows.
-- =========================================================

WITH ranked_notifications AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY
        user_id,
        type,
        title,
        content,
        related_id,
        related_user_id,
        created_at
      ORDER BY id
    ) AS row_number
  FROM public.notifications
)
DELETE FROM public.notifications AS n
USING ranked_notifications AS r
WHERE n.id = r.id
  AND r.row_number > 1;


-- =========================================================
-- 6. REPAIR POST ENGAGEMENT COUNTS
-- =========================================================
--
-- Older duplicate count triggers may have incremented
-- likes/comments/shares more than once.
--
-- Recalculate counts from the real source tables.
-- =========================================================

UPDATE public.posts AS p
SET
  likes_count = (
    SELECT COUNT(*)::integer
    FROM public.post_likes AS pl
    WHERE pl.post_id = p.id
  ),
  comments_count = (
    SELECT COUNT(*)::integer
    FROM public.post_comments AS pc
    WHERE pc.post_id = p.id
  ),
  shares_count = (
    SELECT COUNT(*)::integer
    FROM public.post_shares AS ps
    WHERE ps.post_id = p.id
  ),
  reposts_count = (
    SELECT COUNT(*)::integer
    FROM public.post_reposts AS pr
    WHERE pr.post_id = p.id
  );


COMMIT;