import { useEffect } from 'react';

const BASE_URL = 'https://bizbase-ai.lovable.app';
const DEFAULT_TITLE = 'BizBase AI | AI Powered Professional Networking & Business Platform';
const DEFAULT_DESC = 'BizBase AI - The next-generation AI-powered professional networking platform. Build connections, grow your career, manage businesses, and unlock opportunities.';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

const SEOHead = ({
  title,
  description = DEFAULT_DESC,
  path = '',
  image = DEFAULT_IMAGE,
  type = 'website',
  noIndex = false,
}) => {
  const fullTitle = title ? `${title} | BizBase AI` : DEFAULT_TITLE;
  const canonicalUrl = `${BASE_URL}${path}`;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (attr, key, content) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', description);
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', 'BizBase AI');

    // Twitter
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);
    setMeta('name', 'twitter:card', 'summary_large_image');

    // Canonical
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [fullTitle, description, canonicalUrl, image, type, noIndex]);

  return null;
};

export default SEOHead;
