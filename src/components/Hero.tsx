
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="pt-28 pb-16 min-h-screen flex items-center relative bg-gradient-to-br from-[#f7fafc] via-[#f1f8fd] to-[#e8f5fb] overflow-hidden transition-all duration-500">
      {/* Clean, light overlays for highlights, not dark */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-24 -left-20 w-[520px] h-[320px] bg-gradient-to-br from-[#bae6fd]/60 to-[#f1fffd]/0 rounded-full opacity-40 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[420px] h-[260px] bg-gradient-to-r from-[#c3fcf4]/70 via-[#c7e8ff]/40 to-[#eef8ff]/0 rounded-full blur-3xl opacity-50" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center animate-fade-in delay-200">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-[#6cdfc1] to-[#9adefe] px-4 py-2 rounded-full shadow animate-scale-in">
              <Sparkles className="w-5 h-5 text-[#1fc19e]" />
              <span className="text-sm font-medium text-[#3b6386] font-sans">AI-Powered Business Platform</span>
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold font-display mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#119fb9] via-[#62b1f7] to-[#7beabb] drop-shadow-md animate-fade-in delay-300">
            Welcome to BizBase
          </h1>
          <p className="text-2xl md:text-2xl text-[#51aebb] font-semibold mb-4 max-w-4xl mx-auto leading-relaxed animate-fade-in delay-400">
            All-in-One AI Powered Business Operating System
          </p>
          <p className="text-lg text-[#80aacb] mb-8 max-w-3xl mx-auto animate-fade-in delay-500">
            Streamline your CRM, HR, Project Management, Finance, Sales, and AI Tools in one powerful platform.
            Perfect for individuals, teams, freelancers, SMBs, and large enterprises.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14 animate-fade-in delay-700">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-[#36d98f] via-[#5dadfe] to-[#298fd5] shadow-xl text-[#226268] px-10 py-4 text-lg font-extrabold font-display hover:from-[#59e4b5] hover:to-[#6abaff] hover:scale-105 duration-200 transition-all border-0">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-10 py-4 text-lg font-bold font-display border-2 border-[#2efad0] text-[#5ca7b7] bg-white/80 hover:bg-[#e8f7ff]/60 hover:border-[#79d6dd] hover:text-[#4691d4] shadow-md duration-200 transition-all">
                Login to Dashboard
              </Button>
            </Link>
          </div>
          {/* Stat cards */}
          <div className="flex flex-wrap gap-8 justify-center mb-14">
            {[
              { value: '+500', label: 'Active Businesses', color: 'from-[#88d0fa] to-[#72eecd]' },
              { value: '+120', label: 'Teams & Organizations', color: 'from-[#b8f7ee] to-[#82cdfc]' },
              { value: '98%', label: 'Uptime', color: 'from-[#80e4d3] to-[#afbeee]' }
            ].map((stat, i) => (
              <div
                key={stat.value}
                className={`bg-gradient-to-r ${stat.color} shadow-lg rounded-xl px-9 py-6 flex flex-col items-center group justify-center text-center border-0 transition-all duration-200 hover:scale-105 animate-scale-in delay-[${800 + i * 100}ms]`}
                style={{ animationDelay: `${800 + i * 100}ms` }}
              >
                <span className="text-3xl font-extrabold text-[#108086] font-display">{stat.value}</span>
                <span className="text-sm text-[#368dab] font-semibold mt-2">{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-2 animate-fade-in delay-[1200ms]">
            <div className="flex items-center justify-center space-x-3 bg-white/90 shadow rounded-xl p-5 border border-[#e4f3fa] hover:scale-105 transition-transform group">
              <Target className="w-8 h-8 text-[#44d5bd] group-hover:animate-pulse" />
              <span className="font-semibold text-[#24a6cd] font-display">Smart CRM & Sales</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white/90 shadow rounded-xl p-5 border border-[#e4f3fa] hover:scale-105 transition-transform group">
              <Zap className="w-8 h-8 text-[#67b7ff] group-hover:animate-pulse" />
              <span className="font-semibold text-[#24a6cd] font-display">AI-Powered Analytics</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white/90 shadow rounded-xl p-5 border border-[#e4f3fa] hover:scale-105 transition-transform group">
              <Sparkles className="w-8 h-8 text-[#a9a5f1] group-hover:animate-pulse" />
              <span className="font-semibold text-[#24a6cd] font-display">Automated Workflows</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Hero;

