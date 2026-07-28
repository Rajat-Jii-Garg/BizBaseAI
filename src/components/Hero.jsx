import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative pt-24 pb-16 sm:pt-28 sm:pb-20 bg-white">
      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center">

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 border border-border bg-secondary text-primary px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold tracking-wide">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-70" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
            </span>
            Made in India · Free for everyone
          </div>

          {/* Headline */}
          <h1 className="mt-6 font-display text-[2.6rem] leading-[1.05] sm:text-6xl lg:text-[4.25rem] text-foreground">
            The professional home for
            <br className="hidden sm:block" />{' '}
            <span className="italic text-primary">India&apos;s next generation</span>
          </h1>

          <p className="mt-6 text-[15px] sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            BizBase is a networking platform where students, freshers, professionals,
            freelancers and business owners build a real profile, find real jobs, meet the
            right people and grow — without paying for five different tools.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-13 px-8 h-14 rounded-xl text-[15px] font-semibold shadow-lg shadow-primary/20">
                Create your free profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/jobs" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 rounded-xl text-[15px] font-semibold border-border bg-white hover:bg-muted"
              >
                Browse Indian jobs
              </Button>
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] sm:text-[13px] text-muted-foreground">
            {['No credit card', 'No invite needed', 'Free forever'].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-primary" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* What you actually get */}
        <div className="mt-14 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {[
            {
              title: 'A profile that works',
              body: 'One public profile at bizbase.in/@you — share it anywhere, and let recruiters and clients find you.',
            },
            {
              title: 'Real Indian jobs, daily',
              body: 'Verified openings across India — remote, hybrid and on-site — refreshed every few hours with direct apply links.',
            },
            {
              title: 'People worth knowing',
              body: 'Connect, message and join communities of founders, freelancers and professionals in your field.',
            },
          ].map((c) => (
            <div key={c.title} className="bg-white p-6 sm:p-7">
              <h2 className="font-display text-xl sm:text-[1.6rem] text-foreground leading-snug">
                {c.title}
              </h2>
              <p className="mt-2.5 text-[13.5px] sm:text-sm text-muted-foreground leading-relaxed">
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
