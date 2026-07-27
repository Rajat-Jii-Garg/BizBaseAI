import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Briefcase, Building2, ArrowRight, IndianRupee } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';
import { CANONICAL_SITE_URL } from '@/lib/siteUrl';

export const JOB_CITIES = [
  { slug: 'bangalore', name: 'Bangalore', match: '%bangalore%', alt: '%bengaluru%' },
  { slug: 'mumbai', name: 'Mumbai', match: '%mumbai%' },
  { slug: 'delhi', name: 'Delhi NCR', match: '%delhi%' },
  { slug: 'gurgaon', name: 'Gurgaon', match: '%gurgaon%', alt: '%gurugram%' },
  { slug: 'noida', name: 'Noida', match: '%noida%' },
  { slug: 'hyderabad', name: 'Hyderabad', match: '%hyderabad%' },
  { slug: 'pune', name: 'Pune', match: '%pune%' },
  { slug: 'chennai', name: 'Chennai', match: '%chennai%' },
  { slug: 'kolkata', name: 'Kolkata', match: '%kolkata%' },
  { slug: 'ahmedabad', name: 'Ahmedabad', match: '%ahmedabad%' },
  { slug: 'jaipur', name: 'Jaipur', match: '%jaipur%' },
  { slug: 'remote', name: 'Remote (India)', match: '%remote%' },
];

export const JOB_ROLES = [
  { slug: 'software-developer', name: 'Software Developer', match: '%developer%' },
  { slug: 'data-analyst', name: 'Data Analyst', match: '%data%' },
  { slug: 'digital-marketing', name: 'Digital Marketing', match: '%marketing%' },
  { slug: 'sales-executive', name: 'Sales Executive', match: '%sales%' },
  { slug: 'graphic-designer', name: 'Designer', match: '%design%' },
  { slug: 'hr-recruiter', name: 'HR & Recruiter', match: '%hr%' },
  { slug: 'accountant', name: 'Accountant', match: '%account%' },
  { slug: 'customer-support', name: 'Customer Support', match: '%support%' },
  { slug: 'internship', name: 'Internships', match: '%intern%' },
  { slug: 'fresher', name: 'Fresher Jobs', match: '%fresher%' },
];

const money = (min, max, cur) => {
  if (!min && !max) return null;
  const f = (v) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(v);
  const symbol = cur === 'USD' ? '$' : '₹';
  if (min && max) return `${symbol}${f(min)} - ${symbol}${f(max)}`;
  return `${symbol}${f(min || max)}`;
};

const JobsLanding = ({ kind }) => {
  const { slug } = useParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const list = kind === 'city' ? JOB_CITIES : JOB_ROLES;
  const item = useMemo(() => list.find((c) => c.slug === slug), [list, slug]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!item) { setLoading(false); return; }
      setLoading(true);
      let query = supabase
        .from('jobs')
        .select('id, slug, title, company_name, location, job_type, work_mode, experience_level, salary_min, salary_max, salary_currency, created_at')
        .eq('is_active', true)
        .not('slug', 'is', null)
        .order('created_at', { ascending: false })
        .limit(60);

      if (kind === 'city') {
        query = item.alt
          ? query.or(`location.ilike.${item.match},location.ilike.${item.alt}`)
          : query.ilike('location', item.match);
      } else {
        query = query.ilike('title', item.match);
      }

      const { data } = await query;
      if (!cancelled) {
        setJobs(data || []);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [item, kind, slug]);

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <SEOHead title="Jobs in India" path="/jobs" />
        <h1 className="text-2xl font-bold">Page not found</h1>
        <Link to="/jobs" className="text-primary font-semibold">Browse all jobs →</Link>
      </div>
    );
  }

  const heading = kind === 'city'
    ? `Jobs in ${item.name}`
    : `${item.name} Jobs in India`;
  const path = kind === 'city' ? `/jobs-in/${item.slug}` : `/jobs-for/${item.slug}`;
  const description = kind === 'city'
    ? `Latest verified ${item.name} job openings for freshers and professionals — full-time, hybrid and remote roles updated daily on BizBase.`
    : `Latest ${item.name} openings across India — verified vacancies with salary, location and company details, updated daily on BizBase.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: heading,
    numberOfItems: jobs.length,
    itemListElement: jobs.slice(0, 25).map((j, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${CANONICAL_SITE_URL}/jobs/${j.slug}`,
      name: `${j.title} at ${j.company_name}`,
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={heading} description={description} path={path} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
          <Link to="/jobs" className="text-xs font-semibold text-primary">← All jobs</Link>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{heading}</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">{description}</p>
          <p className="mt-4 text-sm font-medium text-foreground">
            {loading ? 'Loading openings…' : `${jobs.length} active openings right now`}
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <section className="grid gap-3">
          {loading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          )}

          {!loading && jobs.length === 0 && (
            <div className="rounded-xl border border-border p-8 text-center">
              <p className="text-muted-foreground">No live openings here right now. New jobs sync every 2 hours.</p>
              <Link to="/jobs" className="mt-3 inline-block font-semibold text-primary">Browse all Indian jobs →</Link>
            </div>
          )}

          {!loading && jobs.map((j) => (
            <Link
              key={j.id}
              to={`/jobs/${j.slug}`}
              className="group rounded-xl border border-border bg-card p-4 sm:p-5 hover:border-primary/40 hover:shadow-md transition-all"
            >
              <h2 className="font-semibold text-foreground group-hover:text-primary line-clamp-2">{j.title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{j.company_name}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{j.location}</span>
                <span className="flex items-center gap-1 capitalize"><Briefcase className="w-3.5 h-3.5" />{j.job_type} · {j.work_mode}</span>
                {money(j.salary_min, j.salary_max, j.salary_currency) && (
                  <span className="flex items-center gap-1 text-foreground font-medium">
                    <IndianRupee className="w-3.5 h-3.5" />{money(j.salary_min, j.salary_max, j.salary_currency)}
                  </span>
                )}
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                View details <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-bold text-foreground">Popular job searches</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {JOB_CITIES.filter((c) => c.slug !== slug).map((c) => (
              <Link key={c.slug} to={`/jobs-in/${c.slug}`} className="px-3 py-1.5 rounded-full border border-border text-sm hover:border-primary hover:text-primary transition-colors">
                Jobs in {c.name}
              </Link>
            ))}
            {JOB_ROLES.filter((r) => r.slug !== slug).map((r) => (
              <Link key={r.slug} to={`/jobs-for/${r.slug}`} className="px-3 py-1.5 rounded-full border border-border text-sm hover:border-primary hover:text-primary transition-colors">
                {r.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-accent/5 p-6 sm:p-8 text-center">
          <h2 className="text-xl font-bold text-foreground">Get these jobs before everyone else</h2>
          <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
            Create a free BizBase profile — get matched openings, connect with hiring professionals, and build a public profile recruiters can find.
          </p>
          <Link to="/signup" className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
            Join free <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>
    </div>
  );
};

export default JobsLanding;
