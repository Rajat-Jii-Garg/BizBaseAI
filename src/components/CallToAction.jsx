
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  const steps = [
    { n: '01', t: 'Create your profile', d: 'Name, skills, what you are looking for. Two minutes.' },
    { n: '02', t: 'Follow the right people', d: 'Communities and connections in your field, suggested for you.' },
    { n: '03', t: 'Apply and show up', d: 'Fresh Indian jobs daily, plus posts and events worth your time.' },
  ];

  return (
    <section id="cta" className="py-16 sm:py-24 bg-white border-t border-border">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-secondary/50 px-6 py-12 sm:px-14 sm:py-16">
          <div className="max-w-3xl">
            <h2 className="font-display text-[2.2rem] sm:text-5xl leading-[1.08] text-foreground">
              Start today. It stays free.
            </h2>
            <p className="mt-4 text-[15px] sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
              BizBase is built for people who are still climbing — so there are no paywalls,
              no credits and no premium plan hiding the useful parts.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 rounded-xl text-[15px] font-semibold shadow-lg shadow-primary/20">
                  Create free account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-xl text-[15px] font-semibold bg-white border-border">
                  I already have an account
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-border pt-10">
            {steps.map((s) => (
              <div key={s.n}>
                <span className="font-display text-3xl text-primary">{s.n}</span>
                <h3 className="mt-2 text-[16px] font-semibold text-foreground">{s.t}</h3>
                <p className="mt-1.5 text-[13.5px] text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
