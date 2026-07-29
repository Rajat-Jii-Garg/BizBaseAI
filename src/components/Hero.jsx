
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, ArrowRight, Sparkles, Zap, TrendingUp, Shield, Rocket, CheckCircle, Brain, ChevronRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] lg:min-h-screen pt-14 pb-16 overflow-hidden bg-white">


      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 pt-6 sm:pt-8 lg:pt-10">

          {/* Announcement pill */}
          <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>Trusted by Professionals & Businesses</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </div>


          {/* Main Headline */}
          <div className="space-y-3 sm:space-y-4 max-w-3xl mx-auto">
            <h1 className="text-[2rem] sm:text-5xl md:text-6xl lg:text-[3rem] font-extrabold leading-[1.15] tracking-[-0.04em]">
              <span className="text-foreground">Build Meaningful Connections,
                <br />
                <span className="md:ml-0">Discover Opportunities</span>
              </span>
              <br />
              <span className="text-indigo-600">
                Grow your Career &amp; Business
              </span>

            </h1>

            <p className="text-[13px] sm:text-lg text-muted-foreground max-w-xl sm:max-w-2xl mx-auto leading-1.25">
              Build your professional identity, connect with smart people, discover opportunities, manage your business, and grow faster with AI — in BizBase.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-3 justify-center items-center pt-1">
            <Link to="/login">
              <Button size="default" variant="outline" className="w-[210px] sm:w-auto h-14 rounded-2xl rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold transition-all duration-300">
                <LogIn className="w-4 h-4" />
                Login
              </Button>
            </Link>

            <Link to="/signup">
              <Button size="default" className="bg-indigo-600 hover:bg-indigo-700 text-white w-[260px] sm:w-auto h-14 text-sm font-semibold rounded-[18px] shadow-md shadow-indigo-200/60 hover:shadow-lg transition-all duration-300 border-0">
                <Rocket className="w-4 h-4 mr-1.5" />
                Get Started Free
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>

          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 pt-3 overflow-x-auto whitespace-nowrap text-[11px] sm:text-xs text-muted-foreground no-scrollbar">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              <span>Smart Networking</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              <span>AI-powered</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              <span>Business Management</span>
            </div>
          </div>

          {/* Stats — real, honest */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 pt-8 max-w-2xl mx-auto">
            {[
              { value: '15+', label: 'AI Features', icon: Brain, color: 'text-violet-500', bg: 'from-violet-50 to-violet-100/50' },
              { value: '8+', label: 'Core Products', icon: Sparkles, color: 'text-blue-500', bg: 'from-blue-50 to-blue-100/50' },
              { value: '100%', label: 'Free Access', icon: Shield, color: 'text-emerald-500', bg: 'from-emerald-50 to-emerald-100/50' },
              { value: '24/7', label: 'AI Assistance', icon: Zap, color: 'text-cyan-500', bg: 'from-cyan-50 to-cyan-100/50' }
            ].map((stat, index) => (
              <div key={index} className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all duration-500">
                <div className={`w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-br ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-foreground mb-0.5">{stat.value}</div>
                <div className="text-[11px] text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Feature Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-10 max-w-3xl mx-auto">
            {[
              {
                icon: Zap,
                title: 'AI Networking',
                desc: 'Smart connections matched to your goals.',
                color: 'text-amber-500',
                bg: 'from-amber-50 to-orange-50',
                border: 'hover:border-amber-200'
              },
              {
                icon: TrendingUp,
                title: 'Brand Growth',
                desc: 'Real-time analytics to track your rise.',
                color: 'text-emerald-500',
                bg: 'from-emerald-50 to-teal-50',
                border: 'hover:border-emerald-200'
              },
              {
                icon: Globe,
                title: 'Business Suite',
                desc: 'CRM, finance, teams — one platform.',
                color: 'text-blue-500',
                bg: 'from-blue-50 to-indigo-50',
                border: 'hover:border-blue-200'
              }
            ].map((f, i) => (
              <div key={i} className={`group bg-slate-50/60 rounded-xl p-5 border border-slate-100 ${f.border} hover:bg-slate-50 transition-all duration-500 text-left`}>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${f.bg} flex items-center justify-center mb-3`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div> */}

          {/* Testimonial */}
          {/* <div className="pt-10 max-w-lg mx-auto">
            <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-5">
              <div className="flex items-center justify-center gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed italic mb-3">
                "BizBase changed how I run my business. AI tools save hours daily, and networking helped me land my biggest clients."
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-[10px] font-bold">S</div>
                <div className="text-left">
                  <p className="text-foreground text-xs font-medium">Sarah J.</p>
                  <p className="text-muted-foreground text-[10px]">Founder, TechVentures</p>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
