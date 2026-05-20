// Canonical public domain for shareable links, OG tags, JSON-LD, etc.
// Always use this instead of window.location.origin so preview/sandbox
// hosts (id-preview--*.lovable.app) never leak into user-shared URLs.
export const CANONICAL_SITE_URL = 'https://bizbase-ai.vercel.app';

export const buildShareUrl = (path = '/') => {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${CANONICAL_SITE_URL}${p}`;
};
