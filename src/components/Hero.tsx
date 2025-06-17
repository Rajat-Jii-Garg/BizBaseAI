
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Target, TrendingUp, Shield, Globe, Crown, Rocket, Star, CheckCircle, Users, Building2, DollarSign, BarChart3, Brain, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-20 pb-16 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Revolutionary background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-conic from-blue-500/30 via-purple-500/30 to-teal-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-conic from-emerald-500/30 via-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-500/20 via-purple-500/10 to-transparent rounded-full animate-spin" style={{animationDuration: '20s'}} />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-teal-600/5" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-12">
          {/* Revolutionary badge */}
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white px-8 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/20">
            <Crown className="w-6 h-6" />
            <span className="font-black text-lg uppercase tracking-wider">World's #1 AI Business Empire</span>
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>

          {/* Revolutionary headline */}
          <div className="space-y-8">
            <h1 className="text-7xl md:text-9xl font-black leading-tight">
              <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent drop-shadow-2xl">
                BizBase
              </span>
              <span className="block text-3xl md:text-4xl mt-6 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent font-bold animate-pulse">
                The Ultimate Business Domination Platform
              </span>
            </h1>
            
            <div className="max-w-5xl mx-auto">
              <p className="text-2xl md:text-3xl text-slate-700 leading-relaxed font-bold mb-6">
                Transform Your Dreams Into A <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Business Empire</span>
              </p>
              <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-medium">
                The world's most advanced AI-powered business operating system. From startup to enterprise, 
                <span className="font-bold text-purple-600"> we make business success inevitable.</span>
              </p>
            </div>
          </div>

          {/* Revolutionary CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center pt-8">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 hover:from-blue-700 hover:via-purple-700 hover:to-teal-700 text-white px-16 py-8 text-xl font-black rounded-2xl shadow-2xl transform hover:scale-110 transition-all duration-300 border-0 relative overflow-hidden group">
                <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <Rocket className="w-8 h-8 mr-3" />
                Build Your Empire Now
                <ArrowRight className="w-8 h-8 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-16 py-8 text-xl font-black rounded-2xl border-4 border-slate-400 text-slate-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 shadow-xl">
                <Star className="w-8 h-8 mr-3" />
                Watch Success Stories
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="pt-12">
            <p className="text-lg font-semibold text-slate-600 mb-8">Trusted by the world's most successful entrepreneurs</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              {/* Placeholder for company logos */}
              <div className="w-24 h-12 bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div className="w-24 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="w-24 h-12 bg-gradient-to-r from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div className="w-24 h-12 bg-gradient-to-r from-teal-400 to-teal-500 rounded-lg flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Revolutionary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 max-w-6xl mx-auto">
            {[
              { value: '1M+', label: 'Success Stories', icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
              { value: '99.9%', label: 'Success Rate', icon: Shield, color: 'from-blue-500 to-indigo-500' },
              { value: '24/7', label: 'AI Support', icon: Brain, color: 'from-purple-500 to-pink-500' },
              { value: '∞', label: 'Possibilities', icon: Lightbulb, color: 'from-yellow-500 to-orange-500' }
            ].map((stat, index) => (
              <div key={index} className="group bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30 hover:shadow-3xl transform hover:-translate-y-4 transition-all duration-500">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-600 font-bold text-lg">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Revolutionary feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20 max-w-7xl mx-auto">
            {[
              { 
                icon: Target, 
                title: 'AI Business Intelligence', 
                desc: 'Predictive analytics that sees the future of your business',
                color: 'from-blue-500 to-cyan-500'
              },
              { 
                icon: DollarSign, 
                title: 'Automated Revenue Generation', 
                desc: 'AI systems that generate money while you sleep',
                color: 'from-emerald-500 to-teal-500'
              },
              { 
                icon: Users, 
                title: 'Global Team Management', 
                desc: 'Manage worldwide teams with AI-powered efficiency',
                color: 'from-purple-500 to-pink-500'
              }
            ].map((feature, index) => (
              <div key={index} className="group bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-white/40 hover:shadow-3xl transform hover:-translate-y-6 transition-all duration-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-xl`}>
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-4 group-hover:text-blue-600 transition-colors duration-300">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg font-medium">{feature.desc}</p>
                <div className={`w-32 h-1 bg-gradient-to-r ${feature.color} rounded-full mt-6 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="pt-20">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-3xl p-12 text-white shadow-2xl">
              <div className="flex items-center justify-center space-x-2 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <h3 className="text-3xl md:text-4xl font-black mb-6">Join The Business Revolution</h3>
              <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-4xl mx-auto">
                "BizBase didn't just change my business - it changed my life. From $0 to $1M in 6 months."
              </p>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Crown className="w-8 h-8 text-yellow-400" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">Sarah Johnson</p>
                  <p className="opacity-75">CEO, TechCorp</p>
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
