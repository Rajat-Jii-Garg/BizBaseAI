import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight } from 'lucide-react';

const CommunityBanner = () => {
  return (
    <section className="py-0 md:py-24 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
        <div className="rounded-none md:rounded-3xl overflow-hidden bg-white border border-slate-200 p-[1.5rem] sm:px-8 sm:py-14 md:p-16 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">

            {/* Logo — circle */}
            <div className="flex-shrink-0">
              <img
                src={"/images/foundersMeetLogo.png"}
                alt="Founder's Meet 2026"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border border-slate-100 shadow-sm"
              />
            </div>

            {/* Name + description */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3">
                Join Founder&apos;s Meet 2026
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                100+ Founders, Entrepreneurs and Professionals connect every week — real conversations, referrals, and opportunities. Join India&apos;s #1 growing community and never miss a session.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto flex-shrink-0 justify-center">
              <a href="https://chat.whatsapp.com/C2ovqcxBJBsCOTAVbTZyBC" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <button className="w-full bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 text-white px-6 py-3 text-sm md:text-base rounded-2xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Join Now
                </button>
              </a>
              <Link to="/whatsappcommunity" className="w-full sm:w-auto">
                <button className="w-full border-2 border-slate-200 text-foreground px-6 py-3 text-sm md:text-base rounded-2xl font-bold hover:bg-slate-50 transition-all duration-300 flex items-center justify-center">
                  Community 
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityBanner;