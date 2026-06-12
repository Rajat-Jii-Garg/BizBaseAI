
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  const benefits = [
    '100% free — no hidden fees',
    'No user or feature limits',
    'AI-powered career & business tools',
    'Built-in jobs, communities & events',
    'Full business dashboard included'
  ];

  return (
    <section id="cta" className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-white font-medium">Free forever for every professional</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Start Building Your
            <br />
            Professional Future
          </h2>

          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join BizBase and access networking, AI coaching, jobs, communities and a full business dashboard — all in one place, no cost.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-white mb-6">What you'll win:</h3>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <span className="text-lg text-blue-100">{benefit}</span>
                </div>
              ))}
            </div>
            
            {/* <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mt-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">$0</div>
                <div className="text-blue-200 mb-4">for your first 14 days</div>
                <div className="text-sm text-blue-300">Then starting from $29/month</div>
              </div>
            </div> */}
          </div>
          
          <div className="text-center lg:text-left">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-8">
              <div className="space-y-6">
                <Link to="/signup">
                  <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-blue-50 px-12 py-4 text-xl font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300">
                    Get Started Free
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </Button>
                </Link>
                
                <div className="text-center">
                  <div className="text-blue-200 text-sm mb-4">Or</div>
                  <Link to="/login">
                    <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-blue-50 px-12 py-4 text-xl font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300">
                      Login to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="text-center text-blue-200 text-sm">
              <p>🔒 Your data is secure and fully encrypted.</p>
              <p>📧 No spam, we respect your privacy.</p>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">15+</div>
              <div className="text-blue-200 text-sm">AI Tools</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">8+</div>
              <div className="text-blue-200 text-sm">Core Modules</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">100%</div>
              <div className="text-blue-200 text-sm">Free Forever</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-blue-200 text-sm">AI Assistant</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
