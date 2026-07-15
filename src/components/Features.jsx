
import React from 'react';
import { Link } from "react-router-dom";
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  UserCheck, 
  FolderOpen, 
  TrendingUp, 
  Calculator, 
  Brain,
  Zap,
  Target,
  Shield,
  Globe,
  BarChart3,
  Workflow,
  Crown,
  Rocket,
  DollarSign,
  Sparkles,
  Lightbulb,
  Star,
  Award
} from 'lucide-react';

// const Features = () => {
//   const features = [
//     {
//       icon: Brain,
//       title: 'AI Career Coach',
//       description: 'Personalized weekly emails analyzing your profile, skills and giving real growth steps powered by Gemini AI.',
//       gradient: 'from-violet-500 to-purple-500',
//       category: 'AI',
//       stats: 'Weekly insights'
//     },
//     {
//       icon: Users,
//       title: 'Smart Networking',
//       description: 'AI-matched connection suggestions based on your goals, skills and interests — no more cold outreach.',
//       gradient: 'from-blue-500 to-cyan-500',
//       category: 'Network',
//       stats: 'AI-matched'
//     },
//     {
//       icon: Workflow,
//       title: 'Communities & Events',
//       description: 'Join niche communities, host or attend events, and learn directly from peers in your field.',
//       gradient: 'from-emerald-500 to-teal-500',
//       category: 'Learn',
//       stats: 'Built-in chat'
//     },
//     {
//       icon: Target,
//       title: 'Jobs Portal',
//       description: 'Discover internships, jobs and freelance gigs — with AI-powered recommendations based on your profile.',
//       gradient: 'from-orange-500 to-amber-500',
//       category: 'Career',
//       stats: 'AI-recommended'
//     },
//     {
//       icon: BarChart3,
//       title: 'Business Suite',
//       description: 'Run your business with built-in CRM, finance, projects, team and lead tools — all included free.',
//       gradient: 'from-indigo-500 to-blue-500',
//       category: 'Business',
//       stats: '6+ modules'
//     },
//     {
//       icon: Zap,
//       title: 'BizAI Assistant',
//       description: '24/7 AI assistant for content, ideas, replies, post rewriting and career questions — always available.',
//       gradient: 'from-pink-500 to-rose-500',
//       category: 'AI',
//       stats: 'Always on'
//     }
//   ];

  return (
    <section id="features" className="py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/5 to-transparent rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* <div className="text-center mb-20">
          <div className="inline-block px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4 inline mr-2" />
            Everything you need, free
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 leading-tight">
            <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Powerful features
            </span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
              for every professional
            </span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Real tools to help you network, learn, grow your career and run your business — without paying for 5 different apps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl hover:shadow-3xl transform hover:-translate-y-6 transition-all duration-700 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-8 relative z-10">
                <div className="mb-6">
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-2xl`}>
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    {feature.category}
                  </div>
                </div>
                
                <h3 className="text-lg md:text-xl font-semibold font-black mb-4 text-white group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed mb-6 font-medium">
                  {feature.description}
                </p>

                <div className={`inline-block px-4 py-2 bg-gradient-to-r ${feature.gradient} text-white rounded-full text-sm font-bold`}>
                  {feature.stats}
                </div>

                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              </CardContent>
            </Card>
          ))}
        </div> */}

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-3xl p-6 sm:p-8 md:p-12 text-white shadow-2xl border border-white/20">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Ready to grow with BizBase?</h3>
            <p className="text-sm sm:text-base md:text-lg opacity-90 max-w-xl mx-auto mb-8">
              Join a growing community of professionals, freelancers and founders building their future on BizBase — free forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/signup">
                <button className="bg-white text-blue-600 px-6 py-3 text-sm md:text-base rounded-2xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center">
                  <Rocket className="w-5 h-5 mr-2" />
                  Get Started Free
                </button>
              </Link>
              <Link to="/login">
                <button className="border-2 border-white text-white px-6 py-3 text-sm md:text-base rounded-2xl font-bold hover:bg-white hover:text-blue-600 transition-all duration-300">
                  Sign In
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
