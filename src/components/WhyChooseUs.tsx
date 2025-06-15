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
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and security protocols to keep your business data safe and compliant.',
      stats: 'SOC 2 Certified',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance with sub-second response times and real-time synchronization across all devices.',
      stats: '<200ms Response',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Globe,
      title: 'Global Scale',
      description: 'Supports multiple currencies, languages, and time zones. Perfect for international businesses.',
      stats: '50+ Countries',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Round-the-clock customer support with dedicated success managers for enterprise clients.',
      stats: '<2min Response',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Award,
      title: 'Industry Leading',
      description: 'Recognized by industry experts and trusted by thousands of businesses worldwide.',
      stats: '4.9/5 Rating',
      color: 'from-amber-500 to-yellow-500'
    }
  ];

  return (
    <section id="why-choose-us" className="py-24 bg-gradient-to-br from-[#e4f9f6] via-[#e5f1fc] to-[#e7f0fa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-extrabold font-display mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#1855c1] via-[#2bb6fc] to-[#1dbb9f]">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-[#23b29c] to-[#44cee1] bg-clip-text text-transparent">
              BizBase?
            </span>
          </h2>
          <p className="text-xl text-[#2991b2] max-w-3xl mx-auto leading-relaxed">
            We're not just another business platform. We're your competitive advantage in the digital age.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {reasons.map((reason, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${reason.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <reason.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-[#1855c1]">{reason.title}</h3>
                <p className="text-[#2291b1] mb-6 leading-relaxed">{reason.description}</p>
                <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${reason.color} text-white font-semibold text-sm`}>
                  {reason.stats}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#1855c1] mb-2">10K+</div>
              <div className="text-[#2291b1]">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#1855c1] mb-2">99.9%</div>
              <div className="text-[#2291b1]">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#1855c1] mb-2">150+</div>
              <div className="text-[#2291b1]">Integrations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#1855c1] mb-2">50M+</div>
              <div className="text-[#2291b1]">Data Points</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
