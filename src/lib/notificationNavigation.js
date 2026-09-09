const POST_NOTIFICATION_TYPES = new Set(["like", "comment", "share", "repost"]);

const PROFILE_NOTIFICATION_TYPES = new Set([
  "connection",
  "follow",
  "profile_view",
  "endorsement",
]);

export const getNotificationPath = (notification) => {
  if (!notification) return null;

  const type = notification.type;
  const relatedId = notification.related_id;
  const relatedUsername = notification.related_user?.username;

  /*
   * IMPORTANT:
   *
   * related_user_id = person who performed the action.
   * related_id = actual POST ID.
   *
   * Therefore NEVER create:
   *
   * /actor-username/post/post-id
   *
   * because actor may not be the post owner.
   *
   * Always start with the post ID.
   */
  if (POST_NOTIFICATION_TYPES.has(type) && relatedId) {
    return `/post/${encodeURIComponent(relatedId)}`;
  }

  /*
   * Messages
   */
  if (type === "message") {
    return "/messages";
  }

  /*
   * Events
   */
  if (type === "event") {
    if (relatedId) {
      return `/events?event=${encodeURIComponent(relatedId)}`;
    }

    return "/events";
  }

  /*
   * Job applications
   */
  if (type === "job_application") {
    if (relatedId) {
      return `/jobs?job=${encodeURIComponent(relatedId)}`;
    }

    return "/jobs";
  }

  /*
   * Communities
   */
  if (type === "community") {
    if (relatedId) {
      return `/communities/${encodeURIComponent(relatedId)}`;
    }

    return "/communities";
  }

  /*
   * Profile-related notifications
   */
  if (PROFILE_NOTIFICATION_TYPES.has(type) && relatedUsername) {
    return `/${encodeURIComponent(relatedUsername)}`;
  }

  return null;
};
