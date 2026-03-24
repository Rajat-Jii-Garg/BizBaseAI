
import React from 'react';
import { Link } from "react-router-dom";
import { Card, CardContent } from '@/components/ui/card';
import { Star, Crown } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Priya Sharma',
      title: 'Product Designer at Razorpay',
      image: '',
      quote: "BizBase's AI assistant helped me land 3 interviews in my first week. The community is incredibly supportive.",
      revenue: '',
      growth: ''
    },
    {
      name: 'Rahul Mehta',
      title: 'CS Student, IIT Delhi',
      image: '',
      quote: "Finally a platform that doesn't treat freshers as an afterthought. The AI career guidance is a game-changer.",
      revenue: '',
      growth: ''
    },
    {
      name: 'Sarah Chen',
      title: 'Marketing Lead, Startup',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'',
      quote: "The AI content tools save me 5+ hours every week. Networking quality is much better than LinkedIn.",
      revenue: '',
      growth: ''
    },
    {
      name: 'David Kim',
      title: 'Global Consultant',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      quote: 'BizBase helped me scale my consulting firm globally. I now manage 200+ consultants across 50 countries effortlessly.',
      revenue: '50+ Team Members',
      growth: '5+ Countries'
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Millionaires Made
            </span>
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Dreams Realized
            </span>
          </h2>
          <p className="text-base md:text-lg text-white/70 max-w-4xl mx-auto leading-relaxed">
            Real entrepreneurs sharing how BizBase transformed their lives and built their empires
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="group bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl hover:shadow-3xl transform hover:-translate-y-4 transition-all duration-500">
              <CardContent className="p-5">
                <div className="flex justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-white/90 text-sm md:text-base leading-relaxed mb-5 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg">{testimonial.name}</h4>
                      <p className="text-blue-400 font-semibold">{testimonial.title}</p>
                    </div>
                  </div>
                </div>
                {/* <div className="flex justify-between mt-6 pt-6 border-t border-white/20">
                  <div className="text-center">
                    <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-1" />
                    <p className="text-green-400 font-bold">{testimonial.revenue}</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                    <p className="text-blue-400 font-bold">{testimonial.growth}</p>
                  </div>
                </div> */}
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
            <Link to="/login">
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
