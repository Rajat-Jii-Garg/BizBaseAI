
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, TrendingUp, Shield, Globe, Rocket, Star, CheckCircle, Users, Brain, Lightbulb, Play, ChevronRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-20 pb-16 overflow-hidden">
      {/* Deep bluish-dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e27] via-[#0f1942] to-[#0d1333]">
        {/* Mesh gradient overlays */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[radial-gradient(ellipse,rgba(59,130,246,0.15)_0%,transparent_70%)]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(ellipse,rgba(139,92,246,0.12)_0%,transparent_70%)]" />
          <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-[radial-gradient(ellipse,rgba(6,182,212,0.1)_0%,transparent_70%)]" />
        </div>

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        {/* Floating orbs */}
        <div className="absolute top-32 left-[15%] w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60" />
        <div className="absolute top-48 right-[25%] w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse opacity-50" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-[30%] w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[60%] right-[15%] w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse opacity-50" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-[25%] left-[60%] w-2 h-2 bg-violet-400 rounded-full animate-pulse opacity-30" style={{ animationDelay: '1.5s' }} />

        {/* Gradient line accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8 pt-12 sm:pt-16">

          {/* Announcement pill */}
          <div className="inline-flex items-center gap-2 bg-white/[0.06] backdrop-blur-md border border-white/[0.08] text-blue-200 px-4 py-2 rounded-full text-sm font-medium hover:bg-white/[0.1] transition-colors duration-300 cursor-default">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span>AI-Powered Business Platform</span>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
          </div>

          {/* Main Headline */}
          <div className="space-y-5 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold leading-[1.1] tracking-tight">
              <span className="text-white">Build Your</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                Business Empire
              </span>
              <br />
              <span className="text-white/90">with AI</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-blue-100/60 max-w-2xl mx-auto leading-relaxed font-normal">
              Network, grow, and manage everything from one powerful platform.
              <span className="text-blue-200/80 font-medium"> From idea to enterprise — BizBase makes it happen.</span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-2">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.25)] hover:shadow-[0_0_40px_rgba(59,130,246,0.35)] transform hover:scale-[1.02] transition-all duration-300 border-0">
                <Rocket className="w-5 h-5 mr-2" />
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="px-8 py-6 text-base font-semibold rounded-xl border border-white/[0.12] text-white/80 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-sm transition-all duration-300">
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Social proof line */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 pt-2 text-sm text-white/40">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400/70" />
              <span>Free to start</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-white/20 rounded-full" />
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400/70" />
              <span>No credit card required</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-white/20 rounded-full" />
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400/70" />
              <span>AI-powered tools</span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-10 max-w-3xl mx-auto">
            {[
              { value: '10K+', label: 'Active Users', icon: Users, gradient: 'from-blue-500/20 to-blue-600/20', iconColor: 'text-blue-400' },
              { value: '99.9%', label: 'Uptime', icon: Shield, gradient: 'from-emerald-500/20 to-emerald-600/20', iconColor: 'text-emerald-400' },
              { value: '24/7', label: 'AI Support', icon: Brain, gradient: 'from-purple-500/20 to-purple-600/20', iconColor: 'text-purple-400' },
              { value: '50+', label: 'AI Features', icon: Sparkles, gradient: 'from-cyan-500/20 to-cyan-600/20', iconColor: 'text-cyan-400' }
            ].map((stat, index) => (
              <div key={index} className="group bg-white/[0.04] backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.06] transition-all duration-500">
                <div className={`w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm text-white/40 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 max-w-4xl mx-auto">
            {[
              {
                icon: Zap,
                title: 'Smart Networking',
                desc: 'AI-powered connections that match your goals and industry.',
                iconColor: 'text-yellow-400',
                bgColor: 'from-yellow-500/10 to-orange-500/10',
                borderHover: 'hover:border-yellow-500/20'
              },
              {
                icon: TrendingUp,
                title: 'Growth Analytics',
                desc: 'Track your brand growth with real-time insights and metrics.',
                iconColor: 'text-emerald-400',
                bgColor: 'from-emerald-500/10 to-teal-500/10',
                borderHover: 'hover:border-emerald-500/20'
              },
              {
                icon: Globe,
                title: 'Business Tools',
                desc: 'CRM, finance, team management — all in one place.',
                iconColor: 'text-blue-400',
                bgColor: 'from-blue-500/10 to-indigo-500/10',
                borderHover: 'hover:border-blue-500/20'
              }
            ].map((feature, index) => (
              <div key={index} className={`group bg-white/[0.03] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.06] ${feature.borderHover} hover:bg-white/[0.05] transition-all duration-500 text-left`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.bgColor} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Testimonial strip */}
          <div className="pt-12 max-w-2xl mx-auto">
            <div className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-center gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400/80 text-yellow-400/80" />
                ))}
              </div>
              <p className="text-white/60 text-sm sm:text-base leading-relaxed italic mb-4">
                "BizBase transformed how I manage my business. The AI tools save me hours every day, and the networking features helped me find my best clients."
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  S
                </div>
                <div className="text-left">
                  <p className="text-white/70 text-sm font-medium">Sarah Johnson</p>
                  <p className="text-white/30 text-xs">Founder, TechVentures</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
