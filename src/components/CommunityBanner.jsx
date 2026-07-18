import { ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CommunityBanner = () => {
  return (
    <section className="py-0 md:py-10 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
        <div className="rounded-none md:rounded-3xl overflow-hidden bg-white border border-slate-200 p-[1.5rem] sm:px-8 sm:py-14 md:p-16 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-[16px] md:gap-8">

            {/* Top row: Logo + Name/Description */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-[8px] md:gap-8">

              {/* Logo — circle, bigger, top-aligned */}
              <div className="flex-shrink-0 md:mt-1">
                <img
                  src={"/images/foundersMeetLogo.png"}
                  alt="Founder's Meet 2026"
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-40 md:h-40 rounded-full object-cover border border-slate-100 shadow-sm"
                />
              </div>

              {/* Name + description */}
              <div className="text-center md:text-left md:pl-0 md:pt-0">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3">
                  Join Founder&apos;s Meet 2026
                </h3>
                <p className="text-[10px] sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto md:mx-0 md:max-w-3xl">
                  100+ Founders, Entrepreneurs and Professionals connect every week — real conversations, referrals, and opportunities. Join India&apos;s #1 growing community and never miss a session.
                </p>
              </div>

            </div>

            {/* Buttons — below, full row */}
            <div className="flex flex-row gap-3 justify-start md:ml-60">
              <a href="https://chat.whatsapp.com/C2ovqcxBJBsCOTAVbTZyBC" target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none sm:w-auto">
                <button className="w-full bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 text-white px-3 sm:px-6 py-3 text-xs sm:text-sm md:text-base rounded-2xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 mr-1.5 sm:mr-2" />
                  Join Now
                </button>
              </a>
              <Link to="/whatsappcommunity" className="flex-1 sm:flex-none sm:w-auto">
                <button className="w-full border-2 border-slate-200 text-foreground px-3 sm:px-6 py-3 text-xs sm:text-sm md:text-base rounded-2xl font-bold hover:bg-slate-50 transition-all duration-300 flex items-center justify-center">
                  Community
                  <ArrowRight className="w-4 h-4 ml-1.5 sm:ml-2" />
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