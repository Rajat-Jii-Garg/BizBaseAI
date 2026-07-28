import React from 'react';
import { GraduationCap, Briefcase, Rocket, Building2, Lightbulb, Users } from 'lucide-react';

const audiences = [
  { icon: GraduationCap, title: 'Students & Freshers', desc: 'Build a real profile before your first job, find internships, and learn from people already in the industry.' },
  { icon: Users, title: 'Working Professionals', desc: 'Grow your network beyond your office, share what you know, and stay in front of better opportunities.' },
  { icon: Briefcase, title: 'Freelancers', desc: 'Show your work, get discovered by clients, and manage projects and payments in one place.' },
  { icon: Rocket, title: 'Founders', desc: 'Meet co-founders, early hires and investors. Build visibility for what you are shipping.' },
  { icon: Lightbulb, title: 'Career Switchers', desc: 'Test a new field, talk to people doing it, and get an AI plan for the skills you are missing.' },
  { icon: Building2, title: 'Business Owners', desc: 'List your business, capture leads, and run day-to-day operations from a free workspace.' },
];

const WhoIsItFor = () => {
  return (
    <section id="who-is-it-for" className="py-16 sm:py-24 bg-white border-t border-border">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-primary mb-3">Who it&apos;s for</p>
          <h2 className="font-display text-[2.1rem] sm:text-5xl leading-[1.1] text-foreground">
            If you are building a career in India, you belong here
          </h2>
          <p className="mt-4 text-[15px] sm:text-base text-muted-foreground leading-relaxed">
            No invites, no gatekeeping, no paid tiers. Anyone can join and start on day one.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {audiences.map((a, i) => (
            <div key={i} className="rounded-2xl border border-border bg-white p-6 hover:border-primary/40 hover:shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] transition-all duration-300">
              <a.icon className="w-5 h-5 text-primary mb-4" />
              <h3 className="text-[17px] font-semibold text-foreground mb-2 tracking-[-0.01em]">{a.title}</h3>
              <p className="text-[13.5px] text-muted-foreground leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoIsItFor;
