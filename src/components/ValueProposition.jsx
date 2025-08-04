
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, Zap, Crown, Shield, Globe, Star } from 'lucide-react';

const ValueProposition = () => {
  const benefits = [
    {
      icon: TrendingUp,
      title: '10x Revenue Growth',
      description: 'Our AI identifies and executes revenue opportunities 24/7, multiplying your income streams exponentially.',
      stat: 'Average 1000% ROI',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Users,
      title: 'Global Team Management',
      description: 'Manage unlimited teams across continents with AI-powered coordination and performance optimization.',
      stat: '500K+ Teams Managed',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: DollarSign,
      title: 'Automated Money Machine',
      description: 'Set up multiple passive income streams that generate revenue while you sleep, powered by advanced AI.',
      stat: '$100M+ Generated',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Bulletproof Security',
      description: 'Military-grade security with AI threat detection protects your business empire from any digital attack.',
      stat: '100% Security Record',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-white via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full mb-8">
            <Crown className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-wider">Why BizBase Dominates</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            <span className="bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
              Transform Your Life
            </span>
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Build Your Empire
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Stop dreaming about success. Start building your business empire today with the world's most advanced AI platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <Card key={index} className="group bg-white/80 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transform hover:-translate-y-4 transition-all duration-500 overflow-hidden">
              <CardContent className="p-10">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-r ${benefit.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                  <benefit.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-black mb-4 text-slate-800 group-hover:text-blue-600 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6 text-lg">
                  {benefit.description}
                </p>
                <div className={`inline-block px-6 py-3 bg-gradient-to-r ${benefit.color} text-white rounded-full font-bold text-lg shadow-lg`}>
                  {benefit.stat}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Success metrics */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 rounded-3xl p-16 text-white">
          <div className="text-center mb-12">
            <h3 className="text-4xl md:text-5xl font-black mb-6">Success That Speaks for Itself</h3>
            <p className="text-xl opacity-90">Real results from real entrepreneurs who chose BizBase</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '1M+', label: 'Success Stories' },
              { number: '$500B+', label: 'Revenue Generated' },
              { number: '99.9%', label: 'Success Rate' },
              { number: '24/7', label: 'AI Support' }
            ].map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-6xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                  {metric.number}
                </div>
                <div className="text-white/80 font-semibold text-lg">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
