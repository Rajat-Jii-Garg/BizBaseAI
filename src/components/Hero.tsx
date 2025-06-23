
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Target, TrendingUp, Shield, Globe, Crown, Rocket, Star, CheckCircle, Users, Building2, DollarSign, BarChart3, Brain, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-20 pb-16 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30">
      {/* Ultra modern background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-conic from-blue-400/20 via-purple-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-conic from-emerald-400/20 via-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-blue-400/10 via-purple-400/5 to-transparent rounded-full animate-spin" style={{animationDuration: '30s'}} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          {/* Premium badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white px-6 py-3 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 border border-white/20">
            <Crown className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-wider">World's #1 AI Business Platform</span>
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>

          {/* Main headline - optimized sizes */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight">
              <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent drop-shadow-xl">
                BizBase
              </span>
              <span className="block text-xl md:text-2xl lg:text-3xl mt-4 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent font-bold">
                The Ultimate Business Empire Builder
              </span>
            </h1>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg md:text-xl lg:text-2xl text-slate-700 leading-relaxed font-semibold mb-4">
                Transform Your Dreams Into A <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent font-bold">Business Empire</span>
              </p>
              <p className="text-base md:text-lg lg:text-xl text-slate-600 leading-relaxed font-medium">
                The world's most advanced AI-powered business operating system. From startup to enterprise, 
                <span className="font-bold text-purple-600"> we make business success inevitable.</span>
              </p>
            </div>
          </div>

          {/* CTA Buttons - optimized sizes */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-6">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 hover:from-blue-700 hover:via-purple-700 hover:to-teal-700 text-white px-12 py-6 text-lg font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-0 relative overflow-hidden group">
                <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <Rocket className="w-6 h-6 mr-2" />
                Build Your Empire Now
                <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-12 py-6 text-lg font-bold rounded-xl border-2 border-slate-400 text-slate-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 shadow-lg">
                <Star className="w-6 h-6 mr-2" />
                Watch Success Stories
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="pt-8">
            <p className="text-base font-semibold text-slate-600 mb-6">Trusted by the world's most successful entrepreneurs</p>
            <div className="flex justify-center items-center space-x-6 opacity-60">
              <div className="w-20 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="w-20 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="w-20 h-10 bg-gradient-to-r from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="w-20 h-10 bg-gradient-to-r from-teal-400 to-teal-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Stats - optimized sizes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-5xl mx-auto">
            {[
              { value: '1M+', label: 'Success Stories', icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
              { value: '99.9%', label: 'Success Rate', icon: Shield, color: 'from-blue-500 to-indigo-500' },
              { value: '24/7', label: 'AI Support', icon: Brain, color: 'from-purple-500 to-pink-500' },
              { value: '∞', label: 'Possibilities', icon: Lightbulb, color: 'from-yellow-500 to-orange-500' }
            ].map((stat, index) => (
              <div key={index} className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-slate-600 font-semibold text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Feature highlights - optimized */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 max-w-6xl mx-auto">
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
              <div key={index} className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/40 hover:shadow-2xl transform hover:-translate-y-4 transition-all duration-500 relative overflow-hidden">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">{feature.desc}</p>
                <div className={`w-24 h-1 bg-gradient-to-r ${feature.color} rounded-full mt-4 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
              </div>
            ))}
          </div>

          {/* Social proof - optimized */}
          <div className="pt-16">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-2xl p-10 text-white shadow-2xl">
              <div className="flex items-center justify-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <h3 className="text-2xl md:text-3xl font-black mb-4">Join The Business Revolution</h3>
              <p className="text-lg md:text-xl opacity-90 mb-6 max-w-3xl mx-auto">
                "BizBase didn't just change my business - it changed my life. From $0 to $1M in 6 months."
              </p>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-left">
                  <p className="font-bold">Sarah Johnson</p>
                  <p className="opacity-75 text-sm">CEO, TechCorp</p>
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
