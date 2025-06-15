
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="pt-28 pb-16 min-h-screen flex items-center relative bg-gradient-to-br from-[#081d2a] via-[#102a42] to-[#1b445e] overflow-hidden transition-all duration-500">
      {/* Professional Glow Overlay */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-20 -left-28 w-[620px] h-[460px] bg-gradient-to-br from-[#2efad0]/30 to-[#3ca6f6]/10 rounded-full opacity-30 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[540px] h-[350px] bg-gradient-to-r from-[#0d8ffd]/20 via-[#abeafe]/10 to-[#12e3c5]/30 rounded-full blur-3xl opacity-40" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center animate-fade-in delay-200">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-[#2efad0] to-[#3d95ff] px-4 py-2 rounded-full shadow-lg animate-scale-in">
              <Sparkles className="w-5 h-5 text-[#04efc4]" />
              <span className="text-sm font-medium text-[#015a6b] font-sans">AI-Powered Business Platform</span>
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold font-display mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#6fe3de] to-[#4e81f2] drop-shadow-xl animate-fade-in delay-300">
            Welcome to BizBase
          </h1>
          <p className="text-2xl md:text-2xl text-[#adeded] font-semibold mb-4 max-w-4xl mx-auto leading-relaxed animate-fade-in delay-400">
            All-in-One AI Powered Business Operating System
          </p>
          <p className="text-lg text-[#b6e4f6] mb-8 max-w-3xl mx-auto animate-fade-in delay-500">
            Streamline your CRM, HR, Project Management, Finance, Sales, and AI Tools in one powerful platform.
            Perfect for individuals, teams, freelancers, SMBs, and large enterprises.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14 animate-fade-in delay-700">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-[#2efad0] via-[#31bfec] to-[#2d7cd5] shadow-xl text-[#18334b] px-10 py-4 text-lg font-extrabold font-display hover:from-[#35e4b8] hover:to-[#4154d7] hover:scale-105 duration-200 transition-all border-0">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-10 py-4 text-lg font-bold font-display border-2 border-[#2efad0] text-[#bafcff] bg-white/5 hover:bg-[#0c3957]/80 hover:border-[#4ee4ba] hover:text-[#c1eaff] shadow-lg duration-200 transition-all">
                Login to Dashboard
              </Button>
            </Link>
          </div>
          {/* Stat cards */}
          <div className="flex flex-wrap gap-8 justify-center mb-14">
            {[
              { value: '+500', label: 'Active Businesses', color: 'from-[#3bd9ec] to-[#247bfc]' },
              { value: '+120', label: 'Teams & Organizations', color: 'from-[#34eab1] to-[#5d7efc]' },
              { value: '98%', label: 'Uptime', color: 'from-[#6b90fc] to-[#19f6cd]' }
            ].map((stat, i) => (
              <div
                key={stat.value}
                className={`bg-gradient-to-r ${stat.color} shadow-xl rounded-xl px-9 py-6 flex flex-col items-center group justify-center text-center border-0 transition-all duration-200 hover:scale-105 animate-scale-in delay-[${800 + i * 100}ms]`}
                style={{ animationDelay: `${800 + i * 100}ms` }}
              >
                <span className="text-3xl font-extrabold text-white font-display">{stat.value}</span>
                <span className="text-sm text-[#e7fdff] font-semibold mt-2">{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-2 animate-fade-in delay-[1200ms]">
            <div className="flex items-center justify-center space-x-3 bg-white/10 shadow-xl rounded-xl p-5 border border-[#286788]/30 hover:scale-105 transition-transform group">
              <Target className="w-8 h-8 text-[#22fac4] group-hover:animate-pulse" />
              <span className="font-semibold text-[#4e81f2] font-display">Smart CRM & Sales</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white/10 shadow-xl rounded-xl p-5 border border-[#286788]/30 hover:scale-105 transition-transform group">
              <Zap className="w-8 h-8 text-[#67dfff] group-hover:animate-pulse" />
              <span className="font-semibold text-[#4e81f2] font-display">AI-Powered Analytics</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white/10 shadow-xl rounded-xl p-5 border border-[#286788]/30 hover:scale-105 transition-transform group">
              <Sparkles className="w-8 h-8 text-[#b69ffa] group-hover:animate-pulse" />
              <span className="font-semibold text-[#4e81f2] font-display">Automated Workflows</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Hero;
