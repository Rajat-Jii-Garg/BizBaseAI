const POST_NOTIFICATION_TYPES = new Set([
  'like',
  'comment',
  'share',
  'repost',
]);

const PROFILE_NOTIFICATION_TYPES = new Set([
  'connection',
  'follow',
  'profile_view',
  'endorsement',
]);

export const getNotificationPath = (notification) => {
  if (!notification) return null;

  const type = notification.type;
  const relatedId = notification.related_id;
  const relatedUsername = notification.related_user?.username;

  // ---------------------------------------------------------
  // Post-related notifications
  // IMPORTANT:
  // related_id = POST ID
  // related_user = ACTOR
  //
  // Never build /actor/post/id here.
  // /post/:postId resolves the real post owner.
  // ---------------------------------------------------------
  if (
    POST_NOTIFICATION_TYPES.has(type) &&
    relatedId
  ) {
    return `/post/${relatedId}`;
  }

  // ---------------------------------------------------------
  // Messages
  // ---------------------------------------------------------
  if (type === 'message') {
    return '/messages';
  }

  // ---------------------------------------------------------
  // Events
  // ---------------------------------------------------------
  if (type === 'event') {
    if (relatedId) {
      return `/events?event=${encodeURIComponent(relatedId)}`;
    }

    return '/events';
  }

  // ---------------------------------------------------------
  // Job applications
  // ---------------------------------------------------------
  if (type === 'job_application') {
    if (relatedId) {
      return `/jobs?job=${encodeURIComponent(relatedId)}`;
    }

    return '/jobs';
  }

  // ---------------------------------------------------------
  // Communities
  // ---------------------------------------------------------
  if (type === 'community') {
    if (relatedId) {
      return `/communities/${encodeURIComponent(relatedId)}`;
    }

    return '/communities';
  }

  // ---------------------------------------------------------
  // User/profile related notifications
  // ---------------------------------------------------------
  if (
    PROFILE_NOTIFICATION_TYPES.has(type) &&
    relatedUsername
  ) {
    return `/${encodeURIComponent(relatedUsername)}`;
  }

  return null;
};