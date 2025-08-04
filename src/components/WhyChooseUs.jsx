import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Zap, Brain, Globe, Headphones, Award } from 'lucide-react';

const WhyChooseUs = () => {
  const reasons = [
    {
      icon: Brain,
      title: 'AI-First Approach',
      description: 'Built from the ground up with artificial intelligence at its core, providing smart insights and automation.',
      stats: '95% Accuracy',
      color: 'from-blue-400 to-indigo-400'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and security protocols to keep your business data safe and compliant.',
      stats: 'SOC 2 Certified',
      color: 'from-green-400 to-teal-400'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance with sub-second response times and real-time synchronization across all devices.',
      stats: '<200ms Response',
      color: 'from-yellow-400 to-amber-400'
    },
    {
      icon: Globe,
      title: 'Global Scale',
      description: 'Supports multiple currencies, languages, and time zones. Perfect for international businesses.',
      stats: '50+ Countries',
      color: 'from-sky-400 to-cyan-400'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Round-the-clock customer support with dedicated success managers for enterprise clients.',
      stats: '<2min Response',
      color: 'from-pink-400 to-rose-400'
    },
    {
      icon: Award,
      title: 'Industry Leading',
      description: 'Recognized by industry experts and trusted by thousands of businesses worldwide.',
      stats: '4.9/5 Rating',
      color: 'from-amber-400 to-yellow-300'
    }
  ];

  return (
    <section id="why-choose-us" className="py-24 bg-gradient-to-br from-[#f4fcff] via-[#eafdff] to-[#f3fced]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#109fb9] via-[#72cfc1] to-[#da8efd] head-accent shadow-title-glow">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-[#24d1b2] via-[#9b70f8] to-[#54a3b8] bg-clip-text text-transparent font-extrabold">
              BizBase?
            </span>
          </h2>
          <p className="text-xl font-semibold max-w-3xl mx-auto leading-relaxed font-display text-gradient-highlight">
            We're not just another business platform. We're your <span className="font-black text-violet-600">competitive advantage</span> in the digital age.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {reasons.map((reason, index) => (
            <Card key={index} className="group card-glass card-hover hover:ring-2 hover:ring-[#99f1ea] transition-all duration-500 hover:-translate-y-3">
              <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${reason.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animate-pulse-glow`}>
                  <reason.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 font-display text-gradient-accent group-hover:text-gradient-main transition">{reason.title}</h3>
                <p className="text-[#4971e0] font-medium mb-6 leading-relaxed font-sans">{reason.description}</p>
                <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${reason.color} text-white font-bold text-sm`}>
                  {reason.stats}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {/* Stats */}
            <div className="text-4xl font-bold text-gradient-main mb-2 drop-shadow-md">10K+</div>
            <div className="text-gradient-accent">Active Users</div>
            <div className="text-4xl font-bold text-gradient-main mb-2 drop-shadow-md">99.9%</div>
            <div className="text-gradient-accent">Uptime</div>
            <div className="text-4xl font-bold text-gradient-main mb-2 drop-shadow-md">150+</div>
            <div className="text-gradient-accent">Integrations</div>
            <div className="text-4xl font-bold text-gradient-main mb-2 drop-shadow-md">50M+</div>
            <div className="text-gradient-accent">Data Points</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
