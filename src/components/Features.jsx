
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
    <section id="features" className="py-[3rem] bg-gradient-to-br from-white via-slate-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-[2rem] sm:text-4xl md:text-5xl font-black mb-4 sm:mb-5 leading-tight">
            <span className="bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
              Everything You Need, in One Place
            </span>
          </h2>
          <p className="text-[15px] sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            No need to juggle LinkedIn, Notion, HubSpot and 5 other tools. BizBase brings every essential into one free platform.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="group card-professional hover:shadow-xl h-full">
              <CardContent className="p-4 sm:p-5 lg:p-6 text-center flex flex-col items-center h-full">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 mx-auto mb-3 sm:mb-4 rounded-xl bg-gradient-to-r ${benefit.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <h3 className="text-[15px] sm:text-base lg:text-lg font-bold mb-2 text-slate-800 group-hover:text-blue-600 transition-colors leading-snug">
                  {benefit.title}
                </h3>
               <p className="text-[11.3px] sm:text-[13px] lg:text-sm text-slate-600 leading-1.2 max-w-[220px] mx-auto">
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