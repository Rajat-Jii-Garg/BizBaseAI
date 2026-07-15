
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  const benefits = [
    'Smart Connections',
    'Jobs & Opportunities',
    'AI-Powered Career Assistant',
    'Active Communities & Events',
    'Business Management Dashboard'
  ];

  return (
    <section id="cta" className="py-20 md:py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>

      {/* Top Left Glow */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-cyan-400/20 blur-[120px]" />
      {/* Bottom Right Glow */}
      <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] rounded-full bg-violet-500/20 blur-[140px]" />
      {/* Center Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-blue-400/10 blur-[150px]" />

      <div className="absolute top-24 left-20 w-4 h-4 rounded-full bg-white/30"></div>
      <div className="absolute bottom-40 left-1/4 w-3 h-3 rounded-full bg-cyan-300/40"></div>
      <div className="absolute top-32 right-20 w-5 h-5 rounded-full bg-purple-300/30"></div>
      <div className="absolute bottom-20 right-1/3 w-2 h-2 rounded-full bg-white/40"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-white font-medium">Free forever for every professional</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight font-bold text-white mb-6">
            Join Thousands of Professionals
            <br />
            Building Their Future with BizBase
          </h2>

          <p className="text-lg md:text-xl text-blue-100 mb-16 max-w-3xl mx-auto leading-relaxed">
            Create your professional profile, discover opportunities, connect with the right people, manage your business, and use AI to grow faster — all from one free platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-6 order-2 lg:order-1 max-w-[500px]">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">Why professionals choose BizBase:</h3>
            <div className="space-y-5">
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
          
          <div className="flex flex-col items-center lg:items-start order-1 lg:order-2">
            <div className="w-full max-w-[480px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 shadow-2xl">
              <div className="space-y-6">
                <Link to="/signup">
                  <Button size="lg" className="w-full bg-white text-slate-900 hover:bg-slate-100 rounded-2xl h-16 text-lg font-semibold transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-2xl border border-slate-200">
                    Create Free Account
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </Button>
                </Link>
               
                <div className="text-center">
                  <div className="text-blue-200 text-sm mb-4"></div>
                  <Link to="/login">
                    <Button size="lg" className="w-full bg-white text-slate-900 hover:bg-slate-100 rounded-2xl h-16 text-lg font-semibold transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-2xl border border-slate-200">
                      Login →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="mt-8 w-full max-w-[480px] text-center text-blue-100 text-sm space-y-2">
              <p>🚀 Build Your Professional Identity</p>
              <p>🤖 AI Powered Growth</p>
              <p>🔒 Enterprise Grade Security</p>
              <p>🌍 Access Anywhere Anytime</p>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-20">
          <p className="text-blue-100 text-base font-medium max-w-4xl mx-auto leading-relaxed">
            Trusted by Founders, Entrepreneurs, Freelancers, Professionals and Businesses across India.
            Build smart identity, meaningful connections, discover opportunities, grow your business.
          </p>
          <div className="mt-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8 max-w-4xl mx-auto">
              <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md py-8 px-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:bg-white/20">
                <div className="text-3xl font-bold text-white mb-2">15+</div>
                <div className="text-blue-200 text-sm">AI Features</div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md py-8 px-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:bg-white/20">
                <div className="text-3xl font-bold text-white mb-2">8+</div>
                <div className="text-blue-200 text-sm">Core Products</div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md py-8 px-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:bg-white/20">
                <div className="text-3xl font-bold text-white mb-2">100%</div>
                <div className="text-blue-200 text-sm">Free Access</div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md py-8 px-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:bg-white/20">
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-blue-200 text-sm">AI Assistance</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
