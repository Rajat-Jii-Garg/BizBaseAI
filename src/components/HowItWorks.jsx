import React from 'react';
import { Card } from '@/components/ui/card';
import { UserPlus, Settings, Zap, TrendingUp, Users } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Create Account & Access Dashboard',
    description: 'Create your account and access your personal dashboard where you can manage everything in one place.',
    color: 'from-[#13e4ed] to-[#26ebb1]',
    image: '/public/images/dashboard.png'
  },
  {
    step: '02',
    icon: Users,
    title: 'Complete Profile & Start Networking',
    description: 'Build your profile and connect with professionals to grow your network and opportunities.',
    color: 'from-[#39e8c5] to-[#2a8ffc]',
    image: '/public/images/connections.png'
  },
  {
    step: '03',
    icon: Settings,
    title: 'Register Your Business',
    description: 'Add your business details, services, and start building your digital presence on the platform.',
    color: 'from-[#7649be] to-[#77fbde]',
    image: '/public/images/businessregistration.png'
  },
  {
    step: '04',
    icon: TrendingUp,
    title: 'Manage & Scale Your Business',
    description: 'Control your business, track growth, and automate operations using AI-powered tools.',
    color: 'from-[#41ebca] to-[#2977fd]',
    image: '/public/images/businessDashboard.png'
  }
];

const getAnim = (index) => {
  if (index % 2 === 0) return 'animate-slide-in-right';
  return 'animate-slide-in-left';
};

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 bg-gradient-to-tr from-[#e6f9ff] via-white to-[#f5fcff] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-8 left-[40%] w-[400px] h-[480px] bg-gradient-to-br from-[#c8fbfa]/20 to-[#bce0f8]/70 rounded-full opacity-20 blur-2xl" />
        <div className="absolute top-[60%] right-[3%] w-[180px] h-[200px] bg-gradient-to-br from-[#d7faf2]/30 to-[#e3f7ff]/60 rounded-full opacity-25 blur-3xl" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#11a6c4] via-[#4ce7bb] to-[#8df7f9] animate-fade-in head-accent shadow-title-glow">
            How {' '}
            <span className="bg-gradient-to-r from-[#59e1c2] to-[#555df7] bg-clip-text text-transparent font-black">It Works</span>
          </h2>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed font-display text-gradient-highlight">
            Get started with <span className="font-bold text-violet-600">BizBase</span> in just <span className="text-blue-400">4 simple steps.</span> Our AI platform makes business effortless!
          </p>
        </div>
        <div className="space-y-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-8 ${getAnim(index)} opacity-0 will-change-transform animate-fade-in`}
              style={{
                animationDelay: `${350 + index * 210}ms`,
                animationFillMode: 'forwards'
              }}
            >
              <div className="flex-1 min-w-0">
                <Card className="group card-glass card-hover transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                  <div className="relative h-52 lg:h-64 overflow-hidden">
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
                      <span className="text-6xl font-black text-gradient-main font-display">{step.step}</span>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="flex-1 space-y-6 min-w-0">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center`}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-lg font-semibold font-display text-gradient-accent">Step {step.step}</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold font-display text-gradient-main leading-tight">{step.title}</h3>
                <p className="text-xl text-[#4f55a2] font-medium leading-relaxed font-sans">{step.description}</p>
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
