import { useEffect } from 'react';

const BASE_URL = 'https://bizbase-ai.vercel.app';
const DEFAULT_TITLE = 'BizBase AI | Professional Work Platform';
const DEFAULT_DESC = 'BizBase AI - A professional work platform for networking, opportunities, career growth, business and collaboration.';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

const SEOHead = ({
  title,
  description = DEFAULT_DESC,
  path = '',
  image = DEFAULT_IMAGE,
  type = 'website',
  noIndex = false,
  structuredData = null,
}) => {
  const fullTitle = title ? `${title} | BizBase AI` : DEFAULT_TITLE;
  const canonicalUrl = `${BASE_URL}${path}`;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (attr, key, content) => {
      if (content === undefined || content === null || content === '') return;
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

    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', 'BizBase AI');

    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);
    setMeta('name', 'twitter:card', 'summary_large_image');

    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);

    const jsonLdId = 'bizbase-seo-jsonld';
    const oldJsonLd = document.getElementById(jsonLdId);
    if (oldJsonLd) oldJsonLd.remove();

    if (structuredData) {
      const script = document.createElement('script');
      script.id = jsonLdId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    return () => {
      const currentJsonLd = document.getElementById(jsonLdId);
      if (currentJsonLd) currentJsonLd.remove();
      document.title = DEFAULT_TITLE;
    };
  }, [fullTitle, description, canonicalUrl, image, type, noIndex, structuredData]);

  return null;
};

export default SEOHead;
