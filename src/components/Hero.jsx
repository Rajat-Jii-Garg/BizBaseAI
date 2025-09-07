
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Target, TrendingUp, Shield, Globe, Crown, Rocket, Star, CheckCircle, Users, Building2, DollarSign, BarChart3, Brain, Lightbulb, Play } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-28 pb-12 overflow-hidden">
      {/* Advanced Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/80 to-indigo-50/60">
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-float" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-teal-400/25 to-blue-400/25 rounded-lg rotate-45 blur-lg animate-pulse" />
        <div className="absolute bottom-40 left-20 w-40 h-40 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-2xl animate-float delay-1000" />
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-teal-500/10 rounded-full blur-3xl animate-spin" style={{animationDuration: '20s'}} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-emerald-500/15 via-blue-500/15 to-purple-500/15 rounded-full blur-3xl animate-spin delay-500" style={{animationDuration: '25s'}} />
        
        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6">
          {/* Premium badge with glow effect */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white px-6 py-3 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Crown className="w-4 h-4 relative z-10" />
            <span className="font-bold text-sm uppercase tracking-wider relative z-10">World's #1 AI Business Platform</span>
            <Sparkles className="w-4 h-4 animate-spin relative z-10" />
          </div>

          {/* Main headline with better sizing */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
              <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent drop-shadow-lg">
                BizBase
              </span>
              <span className="block text-lg sm:text-xl md:text-2xl mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent font-bold">
                The Ultimate Business Empire Builder
              </span>
            </h1>
            
            <div className="max-w-4xl mx-auto space-y-3">
              <p className="text-lg md:text-xl font-semibold text-slate-700 leading-relaxed">
                Transform Your Dreams Into A <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent font-bold">Business Empire</span>
              </p>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                The world's most advanced AI-powered business operating system. From startup to enterprise, 
                <span className="font-bold text-purple-600"> we make business success inevitable.</span>
              </p>
            </div>
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link to="/login">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 hover:from-blue-700 hover:via-purple-700 hover:to-teal-700 text-white px-10 py-5 text-lg font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-0 relative overflow-hidden group">
                <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <Rocket className="w-5 h-5 mr-2" />
                Build Your Empire Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="px-10 py-5 text-lg font-bold rounded-xl border-2 border-slate-400 text-slate-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 shadow-lg bg-white/80 backdrop-blur-sm">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Trust indicators with animation */}
          <div className="pt-6">
            <p className="text-sm font-semibold text-slate-600 mb-4">Trusted by 1M+ entrepreneurs worldwide</p>
            <div className="flex justify-center items-center space-x-4 opacity-70">
              {[
                { icon: Building2, color: 'from-gray-500 to-gray-600' },
                { icon: TrendingUp, color: 'from-blue-500 to-blue-600' },
                { icon: Crown, color: 'from-purple-500 to-purple-600' },
                { icon: Zap, color: 'from-teal-500 to-teal-600' }
              ].map((item, index) => (
                <div key={index} className={`w-16 h-8 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-4 h-4 text-white" />
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 max-w-4xl mx-auto">
            {[
              { value: '1M+', label: 'Success Stories', icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
              { value: '99.9%', label: 'Success Rate', icon: Shield, color: 'from-blue-500 to-indigo-500' },
              { value: '24/7', label: 'AI Support', icon: Brain, color: 'from-purple-500 to-pink-500' },
              { value: '∞', label: 'Possibilities', icon: Lightbulb, color: 'from-yellow-500 to-orange-500' }
            ].map((stat, index) => (
              <div key={index} className="group bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/30 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-500">
                <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-xl md:text-2xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-slate-600 font-medium text-xs">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Feature highlights with better spacing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 max-w-5xl mx-auto">
            {[
              { 
                icon: Target, 
                title: 'AI Business Intelligence', 
                desc: 'Predictive analytics that sees the future',
                color: 'from-blue-500 to-cyan-500'
              },
              { 
                icon: DollarSign, 
                title: 'Automated Revenue', 
                desc: 'AI systems that generate money 24/7',
                color: 'from-emerald-500 to-teal-500'
              },
              { 
                icon: Users, 
                title: 'Global Team Management', 
                desc: 'Manage worldwide teams efficiently',
                color: 'from-purple-500 to-pink-500'
              }
            ].map((feature, index) => (
              <div key={index} className="group bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/40 hover:shadow-xl transform hover:-translate-y-3 transition-all duration-500 relative overflow-hidden">
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-md`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{feature.desc}</p>
                <div className={`w-16 h-1 bg-gradient-to-r ${feature.color} rounded-full mt-3 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
              </div>
            ))}
          </div>

          {/* Social proof with better design */}
          <div className="pt-12">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-xl p-8 text-white shadow-xl">
              <div className="flex items-center justify-center space-x-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <h3 className="text-xl md:text-2xl font-black mb-3">Join The Business Revolution</h3>
              <p className="text-base md:text-lg opacity-90 mb-4 max-w-2xl mx-auto">
                "BizBase didn't just change my business - it changed my life. From $0 to $1M in 6 months."
              </p>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Crown className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm">Sarah Johnson</p>
                  <p className="opacity-75 text-xs">CEO, TechCorp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
