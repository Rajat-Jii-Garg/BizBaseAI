
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Target, TrendingUp, Shield, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-20 pb-16 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Premium background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-conic from-blue-500/20 via-purple-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-conic from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-blue-500/10 via-transparent to-transparent rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          {/* Premium badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-wider">Next-Gen AI Business OS</span>
          </div>

          {/* Main headline */}
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-black leading-tight">
              <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                BizBase
              </span>
              <span className="block text-4xl md:text-5xl mt-4 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent font-bold">
                AI-Powered Business Revolution
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium">
              The ultimate all-in-one business operating system that transforms how modern enterprises operate. 
              <span className="font-bold text-blue-600"> CRM, HR, Finance, Projects</span> - all powered by cutting-edge AI.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-lg font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-0">
                Start Free Trial
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-12 py-6 text-lg font-bold rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-blue-500 hover:text-blue-600 transition-all duration-300">
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 max-w-4xl mx-auto">
            {[
              { value: '10K+', label: 'Active Businesses', icon: TrendingUp },
              { value: '99.9%', label: 'Uptime SLA', icon: Shield },
              { value: '150+', label: 'Integrations', icon: Zap },
              { value: '50+', label: 'Countries', icon: Globe }
            ].map((stat, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-slate-600 font-medium text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 max-w-5xl mx-auto">
            {[
              { icon: Target, title: 'Smart CRM & Sales', desc: 'AI-powered customer relationship management' },
              { icon: Zap, title: 'Intelligent Analytics', desc: 'Real-time insights and predictive analytics' },
              { icon: Sparkles, title: 'Automated Workflows', desc: 'Streamline operations with smart automation' }
            ].map((feature, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30 hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
