
import React from 'react';
import { Sparkles, Zap, Shield, Users, BarChart3, Bot, Briefcase, Globe } from 'lucide-react';

const FeatureHighlight = () => {
  const features = [
    {
      icon: Bot,
      title: "AI-Powered Assistant",
      description: "Get intelligent insights and automation for your business processes"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Real-time dashboards and comprehensive business intelligence"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Seamless project management and team communication tools"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption and security for your business data"
    },
    {
      icon: Briefcase,
      title: "CRM & Sales",
      description: "Complete customer relationship management and sales pipeline"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Multi-language support and international business tools"
    }
  ];

  const testimonials = [
    {
      quote: "BizBase transformed our operations. We've seen 300% growth since switching!",
      author: "Sarah Chen",
      role: "CEO, TechStart Inc."
    },
    {
      quote: "The AI assistant alone saves us 20 hours per week. Incredible platform!",
      author: "Marcus Rodriguez",
      role: "Operations Director"
    },
    {
      quote: "Finally, everything we need in one place. BizBase is a game-changer.",
      author: "Emily Watson",
      role: "Small Business Owner"
    }
  ];

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 p-8 flex flex-col justify-center text-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-7 h-7 text-white animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold">BizBase</h2>
          </div>
          <h3 className="text-2xl font-semibold mb-3">Your Business, Supercharged</h3>
          <p className="text-blue-100 text-lg">
            Join 50,000+ businesses that trust BizBase for their complete digital transformation
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-6 mb-12">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex items-start space-x-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/15 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                <p className="text-blue-100 text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="space-y-6">
          <h4 className="text-xl font-semibold text-center mb-6">What Our Customers Say</h4>
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="p-4 bg-white/10 rounded-xl backdrop-blur-sm animate-fade-in"
              style={{ animationDelay: `${0.6 + index * 0.2}s` }}
            >
              <p className="text-blue-100 text-sm mb-3 italic">"{testimonial.quote}"</p>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold">{testimonial.author.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{testimonial.author}</p>
                  <p className="text-blue-200 text-xs">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium">Get started in under 2 minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureHighlight;
