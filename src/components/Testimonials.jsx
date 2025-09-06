
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Crown, TrendingUp, DollarSign } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      title: 'CEO, TechCorp',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b8d5?w=100&h=100&fit=crop&crop=face',
      quote: 'BizBase transformed my startup into a $50M company in just 18 months. The AI predicted market trends that made us millions.',
      revenue: '$50M Revenue',
      growth: '2800% Growth'
    },
    {
      name: 'Michael Chen',
      title: 'Serial Entrepreneur',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      quote: 'I built 5 successful companies using BizBase. The automated systems generate $100K monthly while I focus on new ventures.',
      revenue: '$100K/Month',
      growth: 'Passive Income'
    },
    {
      name: 'Emma Rodriguez',
      title: 'E-commerce Empire',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      quote: 'From zero to $1M in 6 months. BizBase AI found profitable niches I never knew existed. Now I dominate 3 markets.',
      revenue: '$1M in 6 months',
      growth: '3 Markets Dominated'
    },
    {
      name: 'David Kim',
      title: 'Global Consultant',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      quote: 'BizBase helped me scale my consulting firm globally. I now manage 200+ consultants across 50 countries effortlessly.',
      revenue: '200+ Team Members',
      growth: '50 Countries'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-full mb-8">
            <Crown className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-wider">Success Stories</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black mb-8 text-white">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Millionaires Made
            </span>
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Dreams Realized
            </span>
          </h2>
          <p className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            Real entrepreneurs sharing how BizBase transformed their lives and built their empires
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="group bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl hover:shadow-3xl transform hover:-translate-y-4 transition-all duration-500">
              <CardContent className="p-8">
                <div className="flex justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-white/90 text-lg leading-relaxed mb-8 font-medium italic">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full border-2 border-white/20"
                    />
                    <div>
                      <h4 className="text-white font-bold text-lg">{testimonial.name}</h4>
                      <p className="text-blue-400 font-semibold">{testimonial.title}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-6 pt-6 border-t border-white/20">
                  <div className="text-center">
                    <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-1" />
                    <p className="text-green-400 font-bold">{testimonial.revenue}</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                    <p className="text-blue-400 font-bold">{testimonial.growth}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl p-12 text-white">
            <h3 className="text-3xl md:text-4xl font-black mb-6">Your Success Story Starts Now</h3>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of entrepreneurs who transformed their dreams into business empires with BizBase
            </p>
            <Link to="/Login">
            <button className="bg-white text-orange-600 px-12 py-6 rounded-2xl font-black text-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              Start Your Empire Today
            </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
