
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">AI-Powered Business Platform</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              BizBase
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-4xl mx-auto leading-relaxed">
            All-in-One AI Powered Business Operating System
          </p>
          
          <p className="text-lg text-gray-500 mb-8 max-w-3xl mx-auto">
            Streamline your CRM, HR, Project Management, Finance, Sales, and AI Tools in one powerful platform.
            Perfect for individuals, teams, freelancers, SMBs, and large enterprises.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg border-2 hover:bg-gray-50">
                Login to Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
              <Target className="w-8 h-8 text-blue-600" />
              <span className="font-semibold text-gray-800">Smart CRM & Sales</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
              <Zap className="w-8 h-8 text-purple-600" />
              <span className="font-semibold text-gray-800">AI-Powered Analytics</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
              <Sparkles className="w-8 h-8 text-indigo-600" />
              <span className="font-semibold text-gray-800">Automated Workflows</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
