
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="pt-28 pb-16 min-h-screen flex items-center bg-gradient-to-br from-[#e3f9f6] via-[#d6ebfc] to-[#e9edff] transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-[#33d6a2] to-[#40c9ff] px-4 py-2 rounded-full shadow-lg">
              <Sparkles className="w-5 h-5 text-[#23b29c]" />
              <span className="text-sm font-medium text-[#015a6b] font-sans">AI-Powered Business Platform</span>
            </div>
          </div>
          {/* Blue bold font headline */}
          <h1 className="text-6xl md:text-7xl font-extrabold font-display mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#1855c1] to-[#34a9a8] drop-shadow-lg">
            Welcome to BizBase
          </h1>
          <p className="text-2xl md:text-2xl text-[#173053] font-semibold mb-4 max-w-4xl mx-auto leading-relaxed">
            All-in-One AI Powered Business Operating System
          </p>
          <p className="text-lg text-[#297191] mb-8 max-w-3xl mx-auto">
            Streamline your CRM, HR, Project Management, Finance, Sales, and AI Tools in one powerful platform.
            Perfect for individuals, teams, freelancers, SMBs, and large enterprises.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-[#1dbc94] to-[#237eea] shadow-xl text-white px-10 py-4 text-lg font-bold border-2 border-transparent hover:from-[#1ebfcd] hover:to-[#298af4] transition-all">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-10 py-4 text-lg font-bold border-2 border-[#2bb6fc] text-[#1a507e] bg-white/95 hover:bg-[#f7fafc] hover:border-[#1dbc94] shadow">
                Login to Dashboard
              </Button>
            </Link>
          </div>
          {/* Stat cards */}
          <div className="flex flex-wrap gap-6 justify-center mb-14">
            <div className="bg-white shadow-lg rounded-xl px-7 py-5 flex flex-col items-center justify-center text-center border border-[#e4f4fa]">
              <span className="text-3xl font-bold text-[#2bb6fc]">+500</span>
              <span className="text-sm text-[#0e485d] font-semibold mt-2">Active Businesses</span>
            </div>
            <div className="bg-white shadow-lg rounded-xl px-7 py-5 flex flex-col items-center justify-center text-center border border-[#e4f4fa]">
              <span className="text-3xl font-bold text-[#34a9a8]">+120</span>
              <span className="text-sm text-[#0e485d] font-semibold mt-2">Teams & Organizations</span>
            </div>
            <div className="bg-white shadow-lg rounded-xl px-7 py-5 flex flex-col items-center justify-center text-center border border-[#e4f4fa]">
              <span className="text-3xl font-bold text-[#1855c1]">98%</span>
              <span className="text-sm text-[#0e485d] font-semibold mt-2">Uptime</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 bg-white/85 shadow rounded-xl p-4 border border-[#d2e7fa]">
              <Target className="w-8 h-8 text-[#23b29c]" />
              <span className="font-semibold text-[#1855c1]">Smart CRM & Sales</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white/85 shadow rounded-xl p-4 border border-[#d2e7fa]">
              <Zap className="w-8 h-8 text-[#5da8ff]" />
              <span className="font-semibold text-[#1855c1]">AI-Powered Analytics</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white/85 shadow rounded-xl p-4 border border-[#d2e7fa]">
              <Sparkles className="w-8 h-8 text-[#b98bfa]" />
              <span className="font-semibold text-[#1855c1]">Automated Workflows</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Hero;
