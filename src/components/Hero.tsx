
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-[#191728] via-[#232144] to-[#353357] min-h-screen flex items-center transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-[#423c73] to-[#715ae5] px-4 py-2 rounded-full">
              <Sparkles className="w-5 h-5 text-[#b6afff]" />
              <span className="text-sm font-medium text-[#eceafe]">AI-Powered Business Platform</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-[#676bff] via-[#bc92fa] to-[#8bd6f8] bg-clip-text text-transparent">
              BizBase
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-[#d7ddfd] mb-4 max-w-4xl mx-auto leading-relaxed">
            All-in-One AI Powered Business Operating System
          </p>
          <p className="text-lg text-[#b2b6e3] mb-8 max-w-3xl mx-auto">
            Streamline your CRM, HR, Project Management, Finance, Sales, and AI Tools in one powerful platform.
            Perfect for individuals, teams, freelancers, SMBs, and large enterprises.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-[#5a60f2] to-[#9377ff] hover:from-[#6b74fa] hover:to-[#8f4fff] text-white px-8 py-3 text-lg transition-all">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg border-2 border-[#3e3c86] text-white hover:bg-[#201a37]/50">
                Login to Dashboard
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 bg-[#232246]/60 backdrop-blur-sm rounded-xl p-4 border border-[#2a246a]">
              <Target className="w-8 h-8 text-[#76e4fa]" />
              <span className="font-semibold text-[#fff]">Smart CRM & Sales</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-[#232246]/60 backdrop-blur-sm rounded-xl p-4 border border-[#2a246a]">
              <Zap className="w-8 h-8 text-[#cfb6ff]" />
              <span className="font-semibold text-[#fff]">AI-Powered Analytics</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-[#232246]/60 backdrop-blur-sm rounded-xl p-4 border border-[#2a246a]">
              <Sparkles className="w-8 h-8 text-[#a3a8fd]" />
              <span className="font-semibold text-[#fff]">Automated Workflows</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
