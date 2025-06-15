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
      gradient: 'from-[#3939fa] to-[#7ad4ec]'
    },
    {
      icon: UserCheck,
      title: 'AI HR Management',
      description: 'Complete HR suite with smart hiring suggestions, attendance tracking, and employee analytics.',
      gradient: 'from-[#33cea1] to-[#5273f7]'
    },
    {
      icon: FolderOpen,
      title: 'Project Planner',
      description: 'Kanban-style project management with AI analysis and intelligent task prioritization.',
      gradient: 'from-[#8644fa] to-[#5234cf]'
    },
    {
      icon: TrendingUp,
      title: 'Auto Lead Gen',
      description: 'Automated lead generation and qualification using advanced AI algorithms.',
      gradient: 'from-[#ff7d4a] to-[#cf56a8]'
    },
    {
      icon: Calculator,
      title: 'Auto Accounting',
      description: 'Intelligent financial management with automated bookkeeping and expense tracking.',
      gradient: 'from-[#5468ff] to-[#4ec7ee]'
    },
    {
      icon: Brain,
      title: 'BizCopilot AI',
      description: 'Your personal business AI assistant for insights, reports, and decision-making.',
      gradient: 'from-[#f658a9] to-[#a069f7]'
    },
    {
      icon: Zap,
      title: 'Smart Automations',
      description: 'AI-triggered workflows that save time and reduce manual tasks.',
      gradient: 'from-[#ffd168] to-[#ff5984]'
    },
    {
      icon: Target,
      title: 'Sales Intelligence',
      description: 'Advanced sales analytics with predictive insights and performance optimization.',
      gradient: 'from-[#23c2bd] to-[#338152]'
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-[#e4f9f6] via-[#e5f1fc] to-[#e7f0fa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold font-display mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#1855c1] via-[#2bb6fc] to-[#1dbb9f]">
            Powerful Features for{' '}
            <span className="bg-gradient-to-r from-[#23b29c] to-[#44cee1] bg-clip-text text-transparent">
              Modern Business
            </span>
          </h2>
          <p className="text-xl text-[#2991b2] max-w-3xl mx-auto">
            Everything you need to run your business efficiently, powered by cutting-edge AI technology.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-[#1855c1]">{feature.title}</h3>
                <p className="text-[#2ca6c4] leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
