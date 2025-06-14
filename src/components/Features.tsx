
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
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: UserCheck,
      title: 'AI HR Management',
      description: 'Complete HR suite with smart hiring suggestions, attendance tracking, and employee analytics.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: FolderOpen,
      title: 'Project Planner',
      description: 'Kanban-style project management with AI analysis and intelligent task prioritization.',
      gradient: 'from-purple-500 to-violet-500'
    },
    {
      icon: TrendingUp,
      title: 'Auto Lead Gen',
      description: 'Automated lead generation and qualification using advanced AI algorithms.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Calculator,
      title: 'Auto Accounting',
      description: 'Intelligent financial management with automated bookkeeping and expense tracking.',
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      icon: Brain,
      title: 'BizCopilot AI',
      description: 'Your personal business AI assistant for insights, reports, and decision-making.',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: Zap,
      title: 'Smart Automations',
      description: 'AI-triggered workflows that save time and reduce manual tasks.',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Target,
      title: 'Sales Intelligence',
      description: 'Advanced sales analytics with predictive insights and performance optimization.',
      gradient: 'from-teal-500 to-green-500'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Powerful Features for{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Modern Business
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to run your business efficiently, powered by cutting-edge AI technology.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-gray-50 to-white">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
