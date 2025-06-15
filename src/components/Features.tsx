
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
      gradient: 'from-[#228dca] to-[#85ffea]'
    },
    {
      icon: UserCheck,
      title: 'AI HR Management',
      description: 'Complete HR suite with smart hiring suggestions, attendance tracking, and employee analytics.',
      gradient: 'from-[#3dfa82] to-[#53aeec]'
    },
    {
      icon: FolderOpen,
      title: 'Project Planner',
      description: 'Kanban-style project management with AI analysis and intelligent task prioritization.',
      gradient: 'from-[#9c79fd] to-[#4887ff]'
    },
    {
      icon: TrendingUp,
      title: 'Auto Lead Gen',
      description: 'Automated lead generation and qualification using advanced AI algorithms.',
      gradient: 'from-[#20f5b2] to-[#4feff9]'
    },
    {
      icon: Calculator,
      title: 'Auto Accounting',
      description: 'Intelligent financial management with automated bookkeeping and expense tracking.',
      gradient: 'from-[#2c6ffc] to-[#30e3f1]'
    },
    {
      icon: Brain,
      title: 'BizCopilot AI',
      description: 'Your personal business AI assistant for insights, reports, and decision-making.',
      gradient: 'from-[#fa579b] to-[#67e6da]'
    },
    {
      icon: Zap,
      title: 'Smart Automations',
      description: 'AI-triggered workflows that save time and reduce manual tasks.',
      gradient: 'from-[#ffe878] to-[#37c9eb]'
    },
    {
      icon: Target,
      title: 'Sales Intelligence',
      description: 'Advanced sales analytics with predictive insights and performance optimization.',
      gradient: 'from-[#2fecba] to-[#15bdec]'
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-white via-[#eafdff] to-[#f8fbfc] animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold font-display mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#62b1f7] via-[#119fb9] to-[#47dfab] animate-fade-in">
            Powerful Features for{' '}
            <span className="bg-gradient-to-r from-[#6cdfc1] to-[#1296c8] bg-clip-text text-transparent">
              Modern Business
            </span>
          </h2>
          <p className="text-xl text-[#6ab1bb] max-w-3xl mx-auto">
            Everything you need to run your business efficiently, powered by cutting-edge AI technology.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in delay-300">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`group hover:shadow-2xl transition-transform duration-300 hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-[2px] animate-scale-in`}
              style={{ animationDelay: `${250 + index * 85}ms` }}
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white drop-shadow-md" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-[#1895b9] font-display">{feature.title}</h3>
                <p className="text-[#54a3b8] leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
