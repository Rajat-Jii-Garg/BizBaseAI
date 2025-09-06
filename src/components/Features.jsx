
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
  Lightbulb,
  Star,
  Award
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI Business Brain',
      description: 'Revolutionary AI that thinks, plans, and executes business strategies automatically with superhuman intelligence.',
      gradient: 'from-purple-600 to-pink-600',
      category: 'AI Revolution',
      stats: '10x Smarter'
    },
    {
      icon: DollarSign,
      title: 'Automated Money Machine',
      description: 'AI-powered revenue generation systems that create multiple income streams while you focus on growth.',
      gradient: 'from-emerald-600 to-teal-600',
      category: 'Revenue Generation',
      stats: '$1M+ Generated'
    },
    {
      icon: Users,
      title: 'Global Empire Management',
      description: 'Manage unlimited teams across continents with AI-powered coordination and real-time performance optimization.',
      gradient: 'from-blue-600 to-cyan-600',
      category: 'Team Domination',
      stats: 'Unlimited Scale'
    },
    {
      icon: Rocket,
      title: 'Hypergrowth Engine',
      description: 'Proprietary algorithms that identify and execute growth opportunities 24/7, scaling your business exponentially.',
      gradient: 'from-orange-600 to-red-600',
      category: 'Growth Acceleration',
      stats: '1000% Growth'
    },
    {
      icon: Crown,
      title: 'Market Domination Suite',
      description: 'Complete competitive intelligence and market domination tools that ensure you always stay ahead of competition.',
      gradient: 'from-yellow-600 to-amber-600',
      category: 'Market Leadership',
      stats: '#1 Position'
    },
    {
      icon: Shield,
      title: 'Fortress Security',
      description: 'Military-grade security with AI threat detection that protects your business empire from any digital attack.',
      gradient: 'from-slate-600 to-gray-700',
      category: 'Ultimate Protection',
      stats: '100% Secure'
    },
    {
      icon: BarChart3,
      title: 'Predictive Intelligence',
      description: 'See the future of your business with AI that predicts market trends, customer behavior, and opportunities.',
      gradient: 'from-indigo-600 to-purple-600',
      category: 'Future Vision',
      stats: '99.9% Accuracy'
    },
    {
      icon: Globe,
      title: 'Global Domination Hub',
      description: 'Expand to any country instantly with AI-powered localization, compliance, and market entry strategies.',
      gradient: 'from-teal-600 to-blue-600',
      category: 'World Expansion',
      stats: '195 Countries'
    }
  ];

  return (
    <section className="py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/5 to-transparent rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-bold uppercase tracking-wider mb-8">
            <Crown className="w-4 h-4 inline mr-2" />
            World's Most Advanced Platform
          </div>
          <h2 className="text-6xl md:text-8xl font-black mb-8">
            <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Features That
            </span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
              Dominate Industries
            </span>
          </h2>
          <p className="text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed font-medium">
            Revolutionary AI-powered tools that transform ordinary businesses into 
            <span className="font-bold text-yellow-400"> unstoppable market leaders</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
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
                
                <h3 className="text-2xl font-black mb-4 text-white group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-white/70 leading-relaxed mb-6 font-medium">
                  {feature.description}
                </p>

                <div className={`inline-block px-4 py-2 bg-gradient-to-r ${feature.gradient} text-white rounded-full text-sm font-bold`}>
                  {feature.stats}
                </div>

                {/* Hover effect overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revolutionary CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-3xl p-16 text-white shadow-2xl border border-white/20">
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <h3 className="text-4xl md:text-6xl font-black mb-6">Ready to Dominate Your Industry?</h3>
            <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-4xl mx-auto">
              Join the exclusive club of entrepreneurs who use BizBase to build business empires and generate millions in revenue.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/login"></Link> 
                <button className="bg-white text-blue-600 px-12 py-6 rounded-2xl font-black text-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center">
                  <Crown className="w-6 h-6 mr-3" />
                  Start Your Empire Now
                  <Rocket className="w-6 h-6 ml-3" />
                </button>
              </Link>
              <Link to="/login">
                <button className="border-2 border-white text-white px-12 py-6 rounded-2xl font-black text-xl hover:bg-white hover:text-blue-600 transition-all duration-300">
                  Watch Success Stories
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
