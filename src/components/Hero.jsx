
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, TrendingUp, Shield, Globe, Rocket, Star, CheckCircle, Users, Brain, Play, ChevronRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-20 pb-16 overflow-hidden">
      {/* Deep gradient background with color mixing */}
      <div className="absolute inset-0 bg-[#060b1f]">
        {/* Multi-color mesh gradients */}
        <div className="absolute top-[-15%] left-[-5%] w-[55%] h-[55%] bg-[radial-gradient(ellipse,rgba(59,130,246,0.18)_0%,transparent_65%)]" />
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(ellipse,rgba(139,92,246,0.14)_0%,transparent_65%)]" />
        <div className="absolute bottom-[-5%] left-[20%] w-[45%] h-[45%] bg-[radial-gradient(ellipse,rgba(6,182,212,0.12)_0%,transparent_65%)]" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-[radial-gradient(ellipse,rgba(99,102,241,0.08)_0%,transparent_60%)]" />

        {/* Subtle noise grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }} />

        {/* Floating particles */}
        <div className="absolute top-28 left-[12%] w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse opacity-50" />
        <div className="absolute top-44 right-[22%] w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-36 left-[28%] w-2 h-2 bg-cyan-400 rounded-full animate-pulse opacity-30" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[55%] right-[12%] w-1 h-1 bg-indigo-300 rounded-full animate-pulse opacity-40" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-[22%] left-[55%] w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse opacity-25" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 pt-14 sm:pt-20">

          {/* Announcement pill */}
          <div className="inline-flex items-center gap-2 bg-white/[0.05] backdrop-blur-md border border-white/[0.07] text-blue-200/80 px-3.5 py-1.5 rounded-full text-xs font-medium">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
            </span>
            <span>Now with AI-Powered Tools</span>
            <ChevronRight className="w-3 h-3 text-blue-400/60" />
          </div>

          {/* Main Headline — smaller, tighter */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold leading-[1.15] tracking-tight">
              <span className="text-white/95">Where Professionals</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Connect, Grow & Build
              </span>
            </h1>

            <p className="text-sm sm:text-base text-white/45 max-w-xl mx-auto leading-relaxed">
              Network smarter, manage your business, and grow your brand — all powered by AI on one unified platform.
            </p>
          </div>

          {/* CTA Buttons — compact */}
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center items-center pt-1">
            <Link to="/signup">
              <Button size="default" className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 hover:from-blue-600 hover:via-indigo-600 hover:to-violet-600 text-white px-6 py-5 text-sm font-semibold rounded-xl shadow-[0_0_25px_rgba(99,102,241,0.3)] hover:shadow-[0_0_35px_rgba(99,102,241,0.4)] transform hover:scale-[1.02] transition-all duration-300 border-0">
                <Rocket className="w-4 h-4 mr-1.5" />
                Get Started Free
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="default" variant="outline" className="px-6 py-5 text-sm font-medium rounded-xl border border-white/[0.1] text-white/70 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] backdrop-blur-sm transition-all duration-300">
                <Play className="w-3.5 h-3.5 mr-1.5" />
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 pt-1 text-xs text-white/35">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400/60" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400/60" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400/60" />
              <span>AI-powered</span>
            </div>
          </div>

          {/* Stats — compact */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 pt-8 max-w-2xl mx-auto">
            {[
              { value: '10K+', label: 'Professionals', icon: Users, color: 'text-blue-400', bg: 'from-blue-500/15 to-blue-600/15' },
              { value: '99.9%', label: 'Uptime', icon: Shield, color: 'text-emerald-400', bg: 'from-emerald-500/15 to-emerald-600/15' },
              { value: '24/7', label: 'AI Assistant', icon: Brain, color: 'text-violet-400', bg: 'from-violet-500/15 to-violet-600/15' },
              { value: '50+', label: 'Smart Tools', icon: Sparkles, color: 'text-cyan-400', bg: 'from-cyan-500/15 to-cyan-600/15' }
            ].map((stat, index) => (
              <div key={index} className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-3.5 border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.05] transition-all duration-500">
                <div className={`w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-br ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white mb-0.5">{stat.value}</div>
                <div className="text-[11px] text-white/35 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Feature Cards — clean */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-10 max-w-3xl mx-auto">
            {[
              {
                icon: Zap,
                title: 'AI Networking',
                desc: 'Smart connections matched to your goals.',
                color: 'text-amber-400',
                bg: 'from-amber-500/10 to-orange-500/10',
                border: 'hover:border-amber-500/15'
              },
              {
                icon: TrendingUp,
                title: 'Brand Growth',
                desc: 'Real-time analytics to track your rise.',
                color: 'text-emerald-400',
                bg: 'from-emerald-500/10 to-teal-500/10',
                border: 'hover:border-emerald-500/15'
              },
              {
                icon: Globe,
                title: 'Business Suite',
                desc: 'CRM, finance, teams — one platform.',
                color: 'text-blue-400',
                bg: 'from-blue-500/10 to-indigo-500/10',
                border: 'hover:border-blue-500/15'
              }
            ].map((f, i) => (
              <div key={i} className={`group bg-white/[0.02] backdrop-blur-sm rounded-xl p-5 border border-white/[0.05] ${f.border} hover:bg-white/[0.04] transition-all duration-500 text-left`}>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${f.bg} flex items-center justify-center mb-3`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-white/90 mb-1">{f.title}</h3>
                <p className="text-xs text-white/35 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Testimonial — minimal */}
          <div className="pt-10 max-w-lg mx-auto">
            <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-5">
              <div className="flex items-center justify-center gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400/70 text-yellow-400/70" />
                ))}
              </div>
              <p className="text-white/50 text-xs leading-relaxed italic mb-3">
                "BizBase changed how I run my business. AI tools save hours daily, and networking helped me land my biggest clients."
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold">S</div>
                <div className="text-left">
                  <p className="text-white/60 text-xs font-medium">Sarah J.</p>
                  <p className="text-white/25 text-[10px]">Founder, TechVentures</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
