
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
      description: 'Build real connections with students, founders, freelancers and business owners across India.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Brain,
      title: 'AI Career Coach',
      description: 'Personalized AI suggestions on your profile, skills and growth — delivered to you weekly.',
      color: 'from-violet-500 to-purple-500'
    },
    {
      icon: Briefcase,
      title: 'Jobs & Opportunities',
      description: 'Discover roles, internships and freelance gigs matched to your profile by AI.',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: MessageSquare,
      title: 'Communities & Events',
      description: 'Join niche communities, attend events, and learn directly from people in your field.',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: Building2,
      title: 'Business Dashboard',
      description: 'Run your business with built-in CRM, finance, projects, team and lead management — free.',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      icon: Coins,
      title: 'BizCoins Rewards',
      description: 'Earn BizCoins for activity, referrals and engagement. Real rewards for real participation.',
      color: 'from-yellow-500 to-amber-500'
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-br from-white via-slate-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black mb-5">
            <span className="bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
              Everything You Need, in One Place
            </span>
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            No need to juggle LinkedIn, Notion, HubSpot and 5 other tools. BizBase brings every essential into one free platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="group card-professional hover:shadow-xl">
              <CardContent className="p-6 text-center">
                <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-r ${benefit.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-3 text-slate-800 group-hover:text-blue-600 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;