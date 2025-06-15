
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  UserCheck, 
  FolderOpen, 
  TrendingUp, 
  Calculator, 
  Brain,
  Zap,
  Target 
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Users,
      title: 'Smart CRM',
      description: 'AI-powered customer relationship management with lead scoring and automated follow-ups.',
      gradient: 'from-[#1edfd6] to-[#7aeaf8]'
    },
    {
      icon: UserCheck,
      title: 'AI HR Management',
      description: 'Complete HR suite with smart hiring suggestions, attendance tracking, and employee analytics.',
      gradient: 'from-[#77e3be] to-[#78b9ee]'
    },
    {
      icon: FolderOpen,
      title: 'Project Planner',
      description: 'Kanban-style project management with AI analysis and intelligent task prioritization.',
      gradient: 'from-[#baa9fe] to-[#4bc5ff]'
    },
    {
      icon: TrendingUp,
      title: 'Auto Lead Gen',
      description: 'Automated lead generation and qualification using advanced AI algorithms.',
      gradient: 'from-[#75fdd6] to-[#96e6fd]'
    },
    {
      icon: Calculator,
      title: 'Auto Accounting',
      description: 'Intelligent financial management with automated bookkeeping and expense tracking.',
      gradient: 'from-[#40aefd] to-[#91ffe9]'
    },
    {
      icon: Brain,
      title: 'BizCopilot AI',
      description: 'Your personal business AI assistant for insights, reports, and decision-making.',
      gradient: 'from-[#f478b9] to-[#3fede1]'
    },
    {
      icon: Zap,
      title: 'Smart Automations',
      description: 'AI-triggered workflows that save time and reduce manual tasks.',
      gradient: 'from-[#f9e878] to-[#4dd4ec]'
    },
    {
      icon: Target,
      title: 'Sales Intelligence',
      description: 'Advanced sales analytics with predictive insights and performance optimization.',
      gradient: 'from-[#59ecc9] to-[#53beff]'
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-white via-[#eefffc] to-[#e8f8fa] animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#73b7fd] via-[#17bfa5] to-[#07dfb5] animate-fade-in head-accent">
            Powerful Features for{' '}
            <span className="bg-gradient-to-r from-[#62e2cb] to-[#2897c8] bg-clip-text text-transparent">
              Modern Business
            </span>
          </h2>
          <p className="text-xl text-[#5eb9b7] max-w-3xl mx-auto font-display">
            Everything you need to run your business efficiently, powered by cutting-edge AI technology.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in delay-300">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`group card-glass card-hover feature-hover transition-transform duration-300 animate-scale-in`}
              style={{ animationDelay: `${250 + index * 85}ms` }}
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-115 group-hover:shadow-2xl transition-transform duration-200 shadow-lg animate-pulse-glow`}>
                  <feature.icon className="w-7 h-7 text-white drop-shadow-md" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-[#18a4b6] font-display group-hover:text-[#19dfb2] transition">{feature.title}</h3>
                <p className="text-[#5ba2ac] leading-relaxed font-sans">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
