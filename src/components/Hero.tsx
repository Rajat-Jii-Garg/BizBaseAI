
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const statData = [
  { value: '+500', label: 'Active Businesses', color: 'from-[#86e6fc] to-[#5fe8d2]' },
  { value: '+120', label: 'Teams & Organizations', color: 'from-[#c1f6f0] to-[#74dafe]' },
  { value: '98%', label: 'Uptime', color: 'from-[#90ebe5] to-[#7fbefe]' },
];

const buzzCards = [
  {
    icon: Target,
    text: 'Smart CRM & Sales',
    iconColor: 'text-[#49c4b6] group-hover:animate-pulse'
  },
  {
    icon: Zap,
    text: 'AI-Powered Analytics',
    iconColor: 'text-[#53b6fc] group-hover:animate-pulse'
  },
  {
    icon: Sparkles,
    text: 'Automated Workflows',
    iconColor: 'text-[#a8b4fd] group-hover:animate-pulse'
  }
];

const Hero = () => {
  return (
    <section className="pt-28 pb-16 min-h-[83vh] flex items-center relative bg-gradient-to-br from-[#f7fafc] via-[#ebf8ff] to-[#e8fafd] overflow-hidden transition-all duration-500">
      {/* Soft, playful overlays */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-28 -left-28 w-[540px] h-[340px] bg-gradient-to-br from-[#afeeff]/60 to-[#c1fcf9]/0 rounded-full opacity-35 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[460px] h-[200px] bg-gradient-to-l from-[#c6fbf0]/80 to-[#e6eaff]/0 rounded-full blur-2xl opacity-50" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center animate-fade-in delay-200">
          <div className="flex justify-center mb-7">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-[#61e2cd] to-[#9adefe] px-5 py-2 rounded-full shadow animate-scale-in animate-pulse-glow">
              <Sparkles className="w-5 h-5 text-[#1fa891]" />
              <span className="text-sm font-semibold text-gradient-main font-sans uppercase tracking-wider drop-shadow">AI-Powered Business Platform</span>
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold font-display mb-6 leading-tight bg-gradient-to-r from-[#01c4fd] via-[#6f63fb] to-[#39dfa2] text-transparent bg-clip-text drop-shadow-xl animate-fade-in delay-300 head-accent shadow-title-glow">
            Welcome to <span className="bg-gradient-to-r from-[#07dfb5] via-[#24a2fa] to-[#8b98fd] bg-clip-text text-transparent">BizBase</span>
          </h1>
          <p className="text-2xl font-bold mb-5 max-w-4xl mx-auto leading-relaxed animate-fade-in delay-400 font-display text-gradient-highlight shadow-text-pop">
            All-in-One AI-Powered Business OS
          </p>
          <p className="text-lg mb-10 max-w-3xl mx-auto animate-fade-in delay-500 text-[#508fa5] font-medium font-sans">
            Streamline <span className="text-gradient-highlight">CRM</span>, <span className="text-gradient-highlight">HR</span>, Project Management, Finance, and Sales in one delightful cloud platform.<br/>
            Next-gen tools for <span className="font-bold text-blue-500">founders</span>, teams, agencies, freelancers, and enterprises.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-14 animate-fade-in delay-700">
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#2ffd9c] via-[#5fcbf4] to-[#984af8] shadow-xl text-white px-10 py-4 text-lg font-extrabold font-display border-none hover:from-[#c6e480] hover:to-[#7ce0fa] hover:scale-105 hover:shadow-2xl duration-200 transition-all"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="px-10 py-4 text-lg font-bold font-display border-2 border-[#2efad0] text-gradient-accent bg-white/90 hover:bg-[#e7fafd]/80 hover:border-[#63dedd] hover:text-[#6d89f9] shadow-md duration-200 transition-all"
              >
                Login to Dashboard
              </Button>
            </Link>
          </div>
          {/* Stat cards */}
          <div className="flex flex-wrap gap-7 justify-center mb-14">
            {statData.map((stat, i) => (
              <div
                key={stat.value}
                className={`bg-gradient-to-r ${stat.color} shadow-lg rounded-xl px-9 py-6 flex flex-col items-center card-glass card-hover transition-all duration-200 animate-scale-in`}
                style={{ animationDelay: `${800 + i * 80}ms` }}
              >
                <span className="text-3xl font-extrabold font-display text-gradient-main">{stat.value}</span>
                <span className="text-sm font-semibold mt-2 text-gradient-accent">{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-2 animate-fade-in delay-[1200ms]">
            {buzzCards.map((buzz, idx) => {
              const Icon = buzz.icon;
              return (
                <div key={buzz.text} className="flex items-center justify-center space-x-3 bg-white/95 card-glass card-hover shadow rounded-xl p-5 border border-[#e1f5fb] group font-display transition-transform hover:scale-105 hover:shadow-2xl">
                  <Icon className={`w-8 h-8 ${buzz.iconColor}`} />
                  <span className="font-semibold text-gradient-highlight group-hover:text-gradient-main font-display transition">{buzz.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
export default Hero;
