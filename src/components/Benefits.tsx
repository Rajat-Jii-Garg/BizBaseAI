
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Zap, 
  Shield, 
  Globe, 
  TrendingUp, 
  Users, 
  Brain, 
  Clock, 
  Award 
} from 'lucide-react';

const Benefits = () => {
  const benefits = [
    {
      icon: Zap,
      title: 'Lightning Fast Setup',
      description: 'Get your business running in minutes, not months. Our AI handles the complex setup automatically.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and security protocols protect your valuable business data 24/7.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Expand to any market worldwide with built-in localization and compliance tools.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: TrendingUp,
      title: 'Predictive Analytics',
      description: 'AI-powered insights that predict trends and optimize your business performance.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Connect your entire team with advanced collaboration tools and real-time updates.',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      icon: Brain,
      title: 'AI Assistant',
      description: 'Your personal business AI that learns from your data and provides smart recommendations.',
      color: 'from-teal-500 to-green-500'
    },
    {
      icon: Clock,
      title: '24/7 Automation',
      description: 'Never miss an opportunity with round-the-clock automated workflows and processes.',
      color: 'from-rose-500 to-red-500'
    },
    {
      icon: Award,
      title: 'Proven Results',
      description: 'Join thousands of successful businesses that have transformed with BizBase.',
      color: 'from-amber-500 to-yellow-500'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-6">
            <span className="bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
              Why Choose BizBase?
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Experience the difference with our cutting-edge features designed for modern businesses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

export default Benefits;
