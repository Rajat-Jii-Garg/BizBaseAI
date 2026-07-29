// Shared relative time formatter used across post cards and comments.
// Same day -> clock time (e.g. "10:42 AM"), then "1 day ago", "2 days ago",
// "1 month ago", "2 months ago", "1 year ago", ...
export const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) {
    return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((startOfToday - startOfDate) / 86400000);

  // Same calendar day -> show the time
  if (dayDiff <= 0) {
    return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  // Calendar month difference
  const monthDiff =
    (now.getFullYear() - date.getFullYear()) * 12 +
    (now.getMonth() - date.getMonth()) -
    (now.getDate() < date.getDate() ? 1 : 0);

  if (monthDiff >= 12) {
    const years = Math.floor(monthDiff / 12);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }

  if (monthDiff >= 1) {
    return `${monthDiff} month${monthDiff > 1 ? 's' : ''} ago`;
  }

  return `${dayDiff} day${dayDiff > 1 ? 's' : ''} ago`;
};

export default formatTimeAgo;
