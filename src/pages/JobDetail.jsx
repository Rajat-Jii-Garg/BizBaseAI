import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, Building, Users, Eye, Briefcase, Calendar, Share2, ExternalLink, ArrowLeft, IndianRupee, CheckCircle2, Sparkles, Bookmark, BookmarkCheck } from 'lucide-react';
import { toast } from 'sonner';
import SEOHead from '@/components/SEOHead';
import { CANONICAL_SITE_URL, buildShareUrl } from '@/lib/siteUrl';
import { useAuth } from '@/contexts/AuthContext';

const BASE_URL = CANONICAL_SITE_URL;

const JobDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();
      if (!mounted) return;
      if (error || !data) {
        setJob(null);
        setLoading(false);
        return;
      }
      setJob(data);
      // increment views (fire & forget) — wrap in Promise.resolve since PostgrestBuilder isn't a true Promise
      Promise.resolve(supabase.rpc('increment_job_views', { job_id: data.id })).catch(() => {});
      // related jobs same industry
      const { data: rel } = await supabase
        .from('jobs')
        .select('id, slug, title, company_name, location, work_mode')
        .eq('is_active', true)
        .eq('industry', data.industry)
        .neq('id', data.id)
        .limit(5);
      setRelated(rel || []);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [slug]);

  // JSON-LD JobPosting structured data for Google Jobs indexing
  useEffect(() => {
    if (!job) return;
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title,
      description: job.description,
      datePosted: job.created_at,
      validThrough: job.application_deadline || undefined,
      employmentType: (job.job_type || 'full-time').toUpperCase().replace('-', '_'),
      hiringOrganization: {
        '@type': 'Organization',
        name: job.company_name,
        sameAs: job.external_url || undefined,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: job.location,
          addressCountry: 'IN',
        },
      },
      jobLocationType: job.work_mode === 'remote' ? 'TELECOMMUTE' : undefined,
      applicantLocationRequirements: { '@type': 'Country', name: 'India' },
      directApply: false,
      industry: job.industry,
      skills: Array.isArray(job.skills_required) ? job.skills_required.join(', ') : undefined,
      baseSalary: job.salary_min && job.salary_max ? {
        '@type': 'MonetaryAmount',
        currency: job.salary_currency || 'INR',
        value: {
          '@type': 'QuantitativeValue',
          minValue: job.salary_min,
          maxValue: job.salary_max,
          unitText: 'YEAR',
        },
      } : undefined,
      url: `${BASE_URL}/jobs/${job.slug}`,
    };
    const id = 'jobposting-ld';
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(ld);
    return () => { el?.remove(); };
  }, [job]);

  const handleApply = () => {
    if (job?.external_url) {
      window.open(job.external_url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(`/jobs?job=${job.id}`);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/jobs/${job.slug}`;
    const shareData = {
      title: `${job.title} at ${job.company_name} | BizBase Jobs`,
      text: `${job.title} — ${job.company_name} (${job.location}). Apply via BizBase.`,
      url,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(url); toast.success('Link copied!'); }
    } catch (e) {
      if (e?.name !== 'AbortError') {
        try { await navigator.clipboard.writeText(url); toast.success('Link copied!'); }
        catch { toast.error('Could not share'); }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading job...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 px-4">
        <SEOHead title="Job not found" noIndex path={`/jobs/${slug}`} />
        <Briefcase className="h-12 w-12 text-muted-foreground/40" />
        <h1 className="text-xl font-semibold">Job not found or expired</h1>
        <Link to="/jobs"><Button>Browse all jobs</Button></Link>
      </div>
    );
  }

  const metaDesc = (job.description || '').slice(0, 155);
  const salaryStr = job.salary_min && job.salary_max
    ? `${job.salary_currency || 'INR'} ${Intl.NumberFormat('en-IN').format(job.salary_min)} - ${Intl.NumberFormat('en-IN').format(job.salary_max)}/yr`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <SEOHead
        title={`${job.title} at ${job.company_name} — ${job.location}`}
        description={`${job.title} job at ${job.company_name} in ${job.location}. ${metaDesc}`}
        path={`/jobs/${job.slug}`}
        type="article"
      />

      {/* Top bar */}
      <header className="sticky top-0 z-40 backdrop-blur bg-background/80 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/jobs" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> All jobs
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" /> BizBase
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-6">
        {/* Header card */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {job.is_featured && <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Featured</Badge>}
              <Badge variant="outline" className="capitalize">{(job.job_type || '').replace('-', ' ')}</Badge>
              <Badge variant="outline" className="capitalize">{(job.work_mode || '').replace('-', ' ')}</Badge>
              <Badge variant="outline" className="capitalize">{(job.experience_level || '').replace('-', ' ')}</Badge>
              {job.source && job.source !== 'internal' && (
                <Badge variant="outline" className="capitalize border-primary/30 text-primary">via {job.source}</Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">{job.title}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-5">
              <span className="flex items-center gap-1.5"><Building className="h-4 w-4" />{job.company_name}</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.location}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{new Date(job.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" />{job.views_count || 0} views</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{job.applications_count || 0} applied</span>
            </div>
            {salaryStr && (
              <div className="inline-flex items-center gap-1.5 text-green-600 font-semibold text-sm mb-4">
                <DollarSign className="h-4 w-4" />{salaryStr}
              </div>
            )}
            {job.application_deadline && (
              <p className="text-xs text-destructive mb-4 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Apply by {new Date(job.application_deadline).toLocaleDateString('en-IN')}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button size="lg" onClick={handleApply} className="gap-2">
                Apply Now <ExternalLink className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={handleShare} className="gap-2">
                <Share2 className="h-4 w-4" /> Share Job
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About the role */}
        <Card className="border-border/60">
          <CardContent className="p-5 sm:p-8">
            <h2 className="text-lg font-semibold mb-3 text-foreground">About this role</h2>
            <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-line leading-relaxed">
              {job.description}
            </p>
          </CardContent>
        </Card>

        {/* Skills */}
        {Array.isArray(job.skills_required) && job.skills_required.length > 0 && (
          <Card className="border-border/60">
            <CardContent className="p-5 sm:p-8">
              <h2 className="text-lg font-semibold mb-3 text-foreground">Skills required</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills_required.map((s, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requirements */}
        {Array.isArray(job.requirements) && job.requirements.length > 0 && (
          <Card className="border-border/60">
            <CardContent className="p-5 sm:p-8">
              <h2 className="text-lg font-semibold mb-3 text-foreground">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {r}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Sticky apply CTA bottom */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground">Interested in this role?</h3>
              <p className="text-sm text-muted-foreground">Apply directly with {job.company_name}.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={handleApply} className="flex-1 sm:flex-none gap-2">
                Apply Now <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleShare} className="gap-2"><Share2 className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        {/* Related jobs */}
        {related.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-foreground">Similar jobs</h2>
            <div className="space-y-2">
              {related.map((r) => (
                <Link key={r.id} to={`/jobs/${r.slug}`} className="block">
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <p className="font-medium text-sm text-foreground line-clamp-1">{r.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.company_name} • {r.location} • {r.work_mode}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        <footer className="text-center text-xs text-muted-foreground pt-6 pb-10">
          Powered by <Link to="/" className="text-primary font-medium">BizBase</Link> — India's professional network for freshers, students &amp; professionals.
        </footer>
      </main>
    </div>
  );
};

export default JobDetail;
