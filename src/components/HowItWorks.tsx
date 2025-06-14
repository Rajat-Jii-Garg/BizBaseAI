
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, Settings, Zap, TrendingUp } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      step: '01',
      icon: UserPlus,
      title: 'Sign Up & Setup',
      description: 'Create your account in seconds and set up your business profile with our intelligent onboarding.',
      color: 'from-blue-500 to-cyan-500',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop'
    },
    {
      step: '02',
      icon: Settings,
      title: 'Configure Your Workspace',
      description: 'Customize modules based on your business needs. Our AI will suggest the best configuration.',
      color: 'from-green-500 to-emerald-500',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'
    },
    {
      step: '03',
      icon: Zap,
      title: 'Import & Automate',
      description: 'Import your existing data and set up smart automations to streamline your workflows.',
      color: 'from-purple-500 to-violet-500',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop'
    },
    {
      step: '04',
      icon: TrendingUp,
      title: 'Scale & Optimize',
      description: 'Watch your business grow with AI-powered insights and recommendations for continuous improvement.',
      color: 'from-orange-500 to-red-500',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            How{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              It Works
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get started with BizBase in just 4 simple steps. Our AI-powered platform makes business management effortless.
          </p>
        </div>
        
        <div className="space-y-16">
          {steps.map((step, index) => (
            <div key={index} className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12`}>
              <div className="flex-1">
                <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
                  <div className="relative h-64 lg:h-80 overflow-hidden">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${step.color} opacity-20`}></div>
                    <div className={`absolute top-6 left-6 w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute bottom-6 left-6">
                      <span className="text-6xl font-bold text-white/80">{step.step}</span>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="flex-1 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center`}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-gray-400">Step {step.step}</span>
                </div>
                <h3 className="text-4xl font-bold text-gray-900 leading-tight">{step.title}</h3>
                <p className="text-xl text-gray-600 leading-relaxed">{step.description}</p>
                <div className={`w-24 h-1 bg-gradient-to-r ${step.color} rounded-full`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
