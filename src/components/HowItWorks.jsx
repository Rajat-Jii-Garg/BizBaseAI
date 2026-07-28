import React from 'react';
import { Card } from '@/components/ui/card';
import { UserPlus, Settings, Zap, TrendingUp, Users } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Create Account & Access Dashboard',
    description: 'Create your account and access your personal dashboard where you can manage everything in one place.',
    color: 'from-primary to-accent',
    image: '/images/userDashboard.png'
  },
  {
    step: '02',
    icon: Users,
    title: 'Complete Profile & Start Networking',
    description: 'Build your profile and connect with professionals to grow your network and opportunities.',
    color: 'from-primary to-accent',
    image: '/images/connections.png'
  },
  {
    step: '03',
    icon: Settings,
    title: 'Register Your Business',
    description: 'Add your business details, services, and start building your digital presence on the platform.',
    color: 'from-primary to-accent',
    image: '/images/Businessregistration.png'
  },
  {
    step: '04',
    icon: TrendingUp,
    title: 'Manage & Scale Your Business',
    description: 'Control your business, track growth, and automate operations using AI-powered tools.',
    color: 'from-primary to-accent',
    image: '/images/businessDashboard.png'
  }
];

const getAnim = (index) => {
  if (index % 2 === 0) return 'animate-slide-in-right';
  return 'animate-slide-in-left';
};

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white border-t border-border relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12 md:mb-16">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-primary mb-3">How it works</p>
          <h2 className="font-display text-[2.1rem] md:text-5xl leading-[1.1] text-foreground">
            Four steps from signing up to showing up
          </h2>
          <p className="mt-4 text-[15px] md:text-base text-muted-foreground leading-relaxed">
            Everything below is live today — not a roadmap.
          </p>
        </div>
        <div className="space-y-16 md:space-y-20">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex ${index % 2 === 1 ? 'flex-row-reverse' : 'flex-row'} items-center gap-4 md:gap-8 lg:${index % 2 === 1 ? 'flex-row-reverse' : 'flex-row'} ${getAnim(index)} opacity-0 will-change-transform animate-fade-in`}
              style={{
                animationDelay: `${350 + index * 210}ms`,
                animationFillMode: 'forwards'
              }}
            >
              <div className="w-[47%] sm:w-[42%] lg:w-[44%] xl:w-[42%] flex-shrink-0">
                <Card className="group rounded-2xl md:rounded-3xl border border-slate-200 bg-white shadow-xl hover:shadow-2xl card-glass card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="p-5 relative h-[170px] sm:h-[200px] md:h-[220px] lg:h-[300px] xl:h-[320px] overflow-hidden bg-white rounded-xl">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-full h-full object-cover scale-[1.28] md:scale-100 group-hover:scale-[1.32] md:group-hover:scale-[1.02] transition-transform duration-500 rounded-2xl"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${step.color} opacity-5 pointer-events-none`} />
                    <div className={`absolute top-3 left-3 md:top-6 md:left-6 w-10 h-10 md:w-14 md:h-14 rounded-3xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-2xl animate-pulse-glow`}>
                      <step.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="absolute bottom-5 right-5 hidden md:block">
                      <span className="text-4xl md:text-6xl font-black text-slate-900/10">{step.step}</span>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="w-[53%] sm:w-[58%] lg:w-[56%] xl:w-[58%] space-y-2 md:space-y-6 min-w-0 max-w-xl mx-auto lg:mx-0">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center`}>
                    <step.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <span className="text-sm sm:text-base lg:text-xl font-semibold font-display text-primary">Step {step.step}</span>
                </div>
                <h3 className="text-xg sm:text-xl md:text-3xl xl:text-4xl font-bold font-display text-foreground leading-tight">{step.title}</h3>
                <p className="text-[13px] sm:text-sm md:text-lg leading-5 md:leading-8 md:text-lg text-muted-foreground font-medium leading-relaxed font-sans">{step.description}</p>
                <div className={`w-16 md:w-24 h-1 bg-gradient-to-r ${step.color} rounded-full`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
