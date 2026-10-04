import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Clock, BookOpen, Sparkles } from 'lucide-react';
import { CANONICAL_SITE_URL } from '@/lib/siteUrl';
import DOMPurify from 'dompurify';

const DEFAULT_IMAGE = `${CANONICAL_SITE_URL}/og-image.png`;

const ArticleDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchArticle = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (!active) return;
      if (error) console.error('Error fetching article:', error);
      setArticle(data || null);
      setLoading(false);

      if (data?.id) {
        // Fire-and-forget view increment. Failure must never block the article.
        supabase.rpc('increment_blog_post_view', { p_post_id: data.id }).then(() => {});
      }
    };

    if (slug) fetchArticle();
    return () => {
      active = false;
    };
  }, [slug]);

  const structuredData = useMemo(() => {
    if (!article) return null;
    const url = `${CANONICAL_SITE_URL}/articles/${article.slug}`;
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.seo_title || article.title,
      description: article.meta_description || article.excerpt || '',
      image: [article.cover_image_url || DEFAULT_IMAGE],
      datePublished: article.created_at,
      dateModified: article.updated_at || article.created_at,
      author: {
        '@type': 'Organization',
        name: article.author_name || 'BizBase Editorial Desk',
        url: `${CANONICAL_SITE_URL}/articles`,
      },
      publisher: {
        '@type': 'Organization',
        name: 'BizBase AI',
        url: CANONICAL_SITE_URL,
        logo: { '@type': 'ImageObject', url: DEFAULT_IMAGE },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      isBasedOn: article.source_url || undefined,
      articleSection: article.category || 'Business',
      keywords: Array.isArray(article.tags) ? article.tags.join(', ') : undefined,
    };
  }, [article]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 pt-32 pb-20 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-24 mb-6" />
          <div className="h-12 bg-slate-200 rounded w-4/5 mb-4" />
          <div className="h-5 bg-slate-200 rounded w-2/3 mb-12" />
          <div className="space-y-4">
            <div className="h-5 bg-slate-200 rounded" />
            <div className="h-5 bg-slate-200 rounded" />
            <div className="h-5 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SEOHead title="Article Not Found" description="The BizBase article could not be found." path={`/articles/${slug || ''}`} noIndex />
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 pt-32 pb-20 text-center">
          {article.cover_image_url ? (
            <img src={article.cover_image_url} alt={article.title} loading="lazy" className="h-44 w-full object-cover" />
          ) : (
            <div className="h-44 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <BookOpen className="w-14 h-14 text-white/30" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Article not found</h1>
          <p className="text-slate-600 mb-6">This article may have been unpublished or moved.</p>
          <Link to="/articles" className="text-blue-600 font-semibold">Back to Articles</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const content = article.content_json || {};
  const keyPoints = Array.isArray(content.key_points) ? content.key_points : [];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={article.seo_title || article.title}
        description={article.meta_description || article.excerpt || ''}
        path={`/articles/${article.slug}`}
        image={article.cover_image_url || DEFAULT_IMAGE}
        type="article"
        structuredData={structuredData}
      />
      <Navbar />

      <main className="pt-24 pb-20">
        <article className="max-w-4xl mx-auto px-4">
          <Link to="/articles" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Articles
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge>{article.category || 'Business'}</Badge>
            {article.region && <Badge variant="outline">{article.region}</Badge>}
            {article.is_ai_assisted && (
              <Badge variant="outline" className="gap-1">
                <Sparkles className="w-3 h-3" /> AI-assisted editorial
              </Badge>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-950 leading-tight mb-5">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-xl text-slate-600 leading-relaxed mb-6">{article.excerpt}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 border-b pb-8 mb-10">
            <span>{article.author_name || 'BizBase Editorial Desk'}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(article.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
            {article.source_name && article.source_url && (
              <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                Source: {article.source_name} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {content.content_html && (
            <div
              className="prose prose-lg prose-slate max-w-none mb-10 prose-img:rounded-xl prose-a:text-blue-600"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.content_html) }}
            />
          )}

          {content.summary && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-950 mb-4">What happened</h2>
              <div className="space-y-4 text-lg leading-8 text-slate-700">
                {String(content.summary).split(/\n\s*\n/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          )}

          {content.why_it_matters && (
            <section className="mb-10 rounded-2xl bg-slate-50 border p-6">
              <h2 className="text-2xl font-bold text-slate-950 mb-4">Why it matters</h2>
              <div className="space-y-4 text-lg leading-8 text-slate-700">
                {String(content.why_it_matters).split(/\n\s*\n/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          )}

          {keyPoints.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-950 mb-4">Key points</h2>
              <ul className="space-y-3 text-lg text-slate-700 list-disc pl-6">
                {keyPoints.map((point, index) => <li key={index}>{point}</li>)}
              </ul>
            </section>
          )}

          {content.bizbase_takeaway && (
            <section className="mb-10 rounded-2xl border border-blue-100 bg-blue-50 p-6">
              <h2 className="text-2xl font-bold text-slate-950 mb-3">BizBase takeaway</h2>
              <p className="text-lg leading-8 text-slate-700">{content.bizbase_takeaway}</p>
            </section>
          )}

          <div className="border-t pt-8 mt-12 text-sm text-slate-500">
            {content.source_note || `This BizBase article is an original editorial summary based on reporting from ${article.source_name || 'the linked source'}.`}
            {article.source_url && (
              <div className="mt-3">
                <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium">
                  Read the original report <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default ArticleDetail;
