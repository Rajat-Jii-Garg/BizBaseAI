import { supabase } from "@/integrations/supabase/client";

const POST_NOTIFICATION_TYPES = new Set(["like", "comment", "share", "repost"]);

const PROFILE_NOTIFICATION_TYPES = new Set([
  "connection",
  "follow",
  "profile_view",
  "endorsement",
]);

/**
 * Resolve the final destination of a notification.
 *
 * For post notifications:
 *
 * notification.related_id
 *        ↓
 * posts.id
 *        ↓
 * posts.user_id
 *        ↓
 * profiles.username
 *        ↓
 * /username/post/postId
 */
export const resolveNotificationPath = async (notification) => {
  if (!notification) {
    return null;
  }

  const type = notification.type;
  const relatedId = notification.related_id;

  /*
   * POST NOTIFICATIONS
   *
   * related_user_id is the ACTOR.
   * related_id is the POST.
   *
   * Never use related_user.username as the post owner.
   */
  if (POST_NOTIFICATION_TYPES.has(type)) {
    if (!relatedId) {
      console.warn("Post notification has no related_id:", notification);
      return null;
    }

    // Find the actual post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, user_id")
      .eq("id", relatedId)
      .maybeSingle();

    if (postError) {
      console.error("Error resolving notification post:", postError);
      throw postError;
    }

    if (!post?.id || !post?.user_id) {
      console.warn(
        "Notification points to a post that does not exist:",
        relatedId,
      );
      return null;
    }

    // Find actual post owner's username
    const { data: owner, error: ownerError } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("id", post.user_id)
      .maybeSingle();

    if (ownerError) {
      console.error("Error resolving post owner:", ownerError);
      throw ownerError;
    }

    if (!owner?.username) {
      console.warn("Post owner has no username:", post.user_id);
      return null;
    }

    return `/${encodeURIComponent(owner.username)}/post/${encodeURIComponent(post.id)}`;
  }

  /*
   * PROFILE NOTIFICATIONS
   */
  if (PROFILE_NOTIFICATION_TYPES.has(type)) {
    const username = notification.related_user?.username;

    if (!username) {
      return null;
    }

    return `/${encodeURIComponent(username)}`;
  }

  /*
   * MESSAGE NOTIFICATIONS
   */
  if (type === "message") {
    return relatedId
      ? `/messages?conversation=${encodeURIComponent(
          relatedId
        )}`
      : "/messages";
  }

  /*
   * EVENT NOTIFICATIONS
   */
  if (type === "event") {
    return relatedId
      ? `/events?event=${encodeURIComponent(relatedId)}`
      : "/events";
  }

  /*
   * JOB APPLICATION NOTIFICATIONS
   */
  if (type === "job_application") {
    return relatedId ? `/jobs?job=${encodeURIComponent(relatedId)}` : "/jobs";
  }

  /*
   * COMMUNITY NOTIFICATIONS
   */
  if (type === "community") {
    return relatedId
      ? `/communities/${encodeURIComponent(relatedId)}`
      : "/communities";
  }

  return null;
};
