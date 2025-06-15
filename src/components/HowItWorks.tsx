
import React from 'react';
import { Card } from '@/components/ui/card';
import { UserPlus, Settings, Zap, TrendingUp } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Sign Up & Setup',
    description: 'Create your account in seconds and set up your business profile with our intelligent onboarding.',
    color: 'from-[#13e4ed] to-[#26ebb1]',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop'
  },
  {
    step: '02',
    icon: Settings,
    title: 'Configure Your Workspace',
    description: 'Customize modules based on your business needs. Our AI will suggest the best configuration.',
    color: 'from-[#39e8c5] to-[#2a8ffc]',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'
  },
  {
    step: '03',
    icon: Zap,
    title: 'Import & Automate',
    description: 'Import your existing data and set up smart automations to streamline your workflows.',
    color: 'from-[#7649be] to-[#77fbde]',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop'
  },
  {
    step: '04',
    icon: TrendingUp,
    title: 'Scale & Optimize',
    description: 'Watch your business grow with AI-powered insights and recommendations for continuous improvement.',
    color: 'from-[#41ebca] to-[#2977fd]',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
  }
];

const getAnim = (index: number) => {
  if (index % 2 === 0) return 'animate-slide-in-right';
  return 'animate-slide-in-left';
};

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-tr from-[#e6f9ff] via-white to-[#f5fcff] relative overflow-hidden">
      {/* Lighter overlays */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-8 left-[40%] w-[400px] h-[480px] bg-gradient-to-br from-[#c8fbfa]/20 to-[#bce0f8]/70 rounded-full opacity-20 blur-2xl" />
        <div className="absolute top-[60%] right-[3%] w-[180px] h-[200px] bg-gradient-to-br from-[#d7faf2]/30 to-[#e3f7ff]/60 rounded-full opacity-25 blur-3xl" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#11a6c4] via-[#4ce7bb] to-[#8df7f9] animate-fade-in head-accent">
            How{" "}
            <span className="bg-gradient-to-r from-[#59e1c2] to-[#119fb9] bg-clip-text text-transparent">
              It Works
            </span>
          </h2>
          <p className="text-xl text-[#5ebbbf] max-w-3xl mx-auto leading-relaxed font-display">
            Get started with BizBase in just 4 simple steps. Our AI platform makes business effortless!
          </p>
        </div>
        <div className="space-y-20">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-14 ${getAnim(index)} opacity-0 will-change-transform animate-fade-in`}
              style={{
                animationDelay: `${350 + index * 210}ms`,
                animationFillMode: 'forwards'
              }}
            >
              <div className="flex-1 min-w-0">
                <Card className="group card-glass card-hover transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                  <div className="relative h-64 lg:h-80 overflow-hidden">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${step.color} opacity-10`} />
                    <div className={`absolute top-6 left-6 w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-xl animate-pulse-glow`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute bottom-6 left-6">
                      <span className="text-6xl font-bold text-[#21e1df]/70 font-display">{step.step}</span>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="flex-1 space-y-6 min-w-0">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center`}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-[#1d97be] font-display">Step {step.step}</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold font-display text-[#10a5bb] leading-tight">{step.title}</h3>
                <p className="text-xl text-[#46a9c6] leading-relaxed font-sans">{step.description}</p>
                <div className={`w-24 h-1 bg-gradient-to-r ${step.color} rounded-full`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
