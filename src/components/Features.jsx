import React from 'react';
import {
  Users,
  Brain,
  Briefcase,
  MessageSquare,
  Building2,
  Coins
} from 'lucide-react';

const Features = () => {
  const benefits = [
    {
      icon: Users,
      title: 'Professional Networking',
      description: 'Connect with students, freshers, freelancers, founders and business owners across India — and actually talk to them.'
    },
    {
      icon: Briefcase,
      title: 'Jobs & Internships',
      description: 'Verified Indian openings updated through the day, with full details and a direct apply link to the employer.'
    },
    {
      icon: Brain,
      title: 'AI Career Coach',
      description: 'Your profile is reviewed by AI and you get specific, personal steps to improve it — in your inbox, every week.'
    },
    {
      icon: MessageSquare,
      title: 'Communities & Events',
      description: 'Join niche communities, attend meetups and learn from people already doing what you want to do.'
    },
    {
      icon: Building2,
      title: 'Business Workspace',
      description: 'Own a business? Manage leads, clients, projects, team and finances from the same account.'
    },
    {
      icon: Coins,
      title: 'BizCoins Rewards',
      description: 'Earn BizCoins for posting, helping others and referring people. Real recognition for real participation.'
    }
  ];

  return (
    <section id="features" className="py-16 sm:py-24 bg-white border-t border-border">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-primary mb-3">What you get</p>
          <h2 className="font-display text-[2.1rem] sm:text-5xl leading-[1.1] text-foreground">
            Everything a career needs, in one calm place
          </h2>
          <p className="mt-4 text-[15px] sm:text-base text-muted-foreground leading-relaxed">
            No juggling between five apps and three subscriptions. BizBase keeps your profile,
            your opportunities and your people together.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border rounded-2xl overflow-hidden">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-6 sm:p-7 group hover:bg-secondary/60 transition-colors duration-300">
              <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center mb-4">
                <benefit.icon className="w-[18px] h-[18px] text-primary" />
              </div>
              <h3 className="text-[17px] font-semibold text-foreground mb-2 tracking-[-0.01em]">
                {benefit.title}
              </h3>
              <p className="text-[13.5px] text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
