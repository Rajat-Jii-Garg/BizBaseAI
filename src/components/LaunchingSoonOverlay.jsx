import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const LaunchingSoonOverlay = ({ children, title = 'Launching Soon', subtitle }) => {
  const navigate = useNavigate();
  return (
    <div className="relative">
      {/* Blurred & non-interactive underlying content */}
      <div aria-hidden="true" className="pointer-events-none select-none blur-[6px] opacity-60">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 z-30 flex items-start md:items-center justify-center p-4 md:p-8">
        <div className="sticky top-20 w-full max-w-md mx-auto">
          <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/80 backdrop-blur-xl shadow-2xl p-6 md:p-8 text-center">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-violet-400/40 to-blue-400/40 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-pink-400/30 to-purple-400/30 rounded-full blur-3xl" />

            <div className="relative">
              <div className="mx-auto w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center shadow-lg mb-4">
                <img
                  src="/images/logo_icon.png"
                  alt="BizBase Logo"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>
              <h2 className="text-1xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                — Coming Very Soon —
              </h2>
              <p className="mt-3 text-sm md:text-[14.5px] text-gray-600 leading-relaxed">
                "We are finalising the business onboarding flow. Meanwhile, build your personal brand & smart network on BizBase — that's where real opportunities are happening right now."
              </p>

              <Button
                onClick={() => navigate('/dashboard')}
                className="mt-6 w-full bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:from-violet-700 hover:to-blue-700 transition-all duration-200"
              >
                Go to Dashboard
              </Button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchingSoonOverlay;
