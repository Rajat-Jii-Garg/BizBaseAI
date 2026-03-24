
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, TrendingUp, Users, Settings, Lock, Globe } from 'lucide-react';

const FloatingIcon = ({ icon: Icon, className, size = 'w-12 h-12', iconSize = 'w-5 h-5', color = 'text-violet-500', bg = 'bg-violet-50' }) => (
  <div className={`absolute ${className} ${size} rounded-2xl ${bg} border border-violet-100/50 shadow-lg shadow-violet-100/30 flex items-center justify-center animate-float`}>
    <Icon className={`${iconSize} ${color}`} />
  </div>
);

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-24 pb-20 overflow-hidden bg-white">
      {/* Subtle radial glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse,rgba(124,58,237,0.06)_0%,transparent_70%)]" />

      {/* Floating Icons */}
      <FloatingIcon icon={Sparkles} className="top-32 left-[8%] animate-[float_6s_ease-in-out_infinite]" color="text-violet-500" bg="bg-violet-50" />
      <FloatingIcon icon={Zap} className="top-[55%] left-[5%] animate-[float_5s_ease-in-out_infinite_1s]" color="text-blue-500" bg="bg-blue-50" size="w-10 h-10" iconSize="w-4 h-4" />
      <FloatingIcon icon={Settings} className="top-28 right-[6%] animate-[float_7s_ease-in-out_infinite_0.5s]" color="text-violet-400" bg="bg-violet-50/80" />
      <FloatingIcon icon={Users} className="top-[50%] right-[5%] animate-[float_5.5s_ease-in-out_infinite_1.5s]" color="text-violet-500" bg="bg-violet-50" />
      <FloatingIcon icon={TrendingUp} className="bottom-[20%] right-[8%] animate-[float_6.5s_ease-in-out_infinite_2s]" color="text-blue-500" bg="bg-blue-50" size="w-11 h-11" />
      <FloatingIcon icon={Globe} className="bottom-[28%] left-[10%] animate-[float_7s_ease-in-out_infinite_0.8s] hidden md:flex" color="text-indigo-400" bg="bg-indigo-50" size="w-9 h-9" iconSize="w-4 h-4" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8 pt-10 sm:pt-16">

          {/* Announcement pill */}
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 text-violet-600 px-4 py-2 rounded-full text-sm font-medium">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            <span>Launching Soon — Join the Founding Community</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-6 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-extrabold leading-[1.1] tracking-tight text-foreground">
              The Future of{' '}
              <span className="bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent">
                Professional Growth
              </span>
              <br />
              Starts Here.
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Students, Freshers, Job Seekers, Teams — Build your network, grow with AI, 
              and join communities that actually matter.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-2">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-lg shadow-violet-200/50 hover:shadow-xl hover:shadow-violet-300/50 transform hover:scale-[1.02] transition-all duration-300 border-0">
                Get Early Access
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/communities">
              <Button size="lg" variant="outline" className="px-8 py-6 text-base font-semibold rounded-xl border-2 border-slate-200 text-foreground hover:bg-slate-50 transition-all duration-300">
                Join Founding Community
              </Button>
            </Link>
          </div>

          {/* Avatar group + waitlist count */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="flex -space-x-2">
              {['PS', 'RM', 'SC', 'AK', 'VI'].map((initials, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">487+</span> professionals on the waitlist
            </p>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" />
              <span>100% Free Early Access</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-violet-500" />
              <span>AI-Powered Growth</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              <span>Global Community</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
