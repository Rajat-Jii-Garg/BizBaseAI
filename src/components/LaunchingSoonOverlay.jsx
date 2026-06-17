import React from 'react';
import { Rocket, Sparkles } from 'lucide-react';

/**
 * Wraps page body content with a blurred + non-interactive layer
 * and an attention-grabbing "Launching Soon" card on top.
 * The page header / sidebar remain untouched because they sit OUTSIDE this wrapper.
 */
const LaunchingSoonOverlay = ({ children, title = 'Launching Soon', subtitle }) => {
  return (
    <div className="relative">
      {/* Blurred & non-interactive underlying content */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none blur-[6px] opacity-60"
      >
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 z-30 flex items-start md:items-center justify-center p-4 md:p-8">
        <div className="sticky top-20 w-full max-w-md mx-auto">
          <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/80 backdrop-blur-xl shadow-2xl p-6 md:p-8 text-center">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-violet-400/40 to-blue-400/40 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-pink-400/30 to-purple-400/30 rounded-full blur-3xl" />

            <div className="relative">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg mb-4">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Coming Very Soon
              </div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                {title}
              </h2>
              <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
                {subtitle ||
                  'We are putting the final polish on the Business workspace — CRM, Finance, Team, Projects & more. For now, focus on Smart Networking, real conversations & opportunities on BizBase.'}
              </p>
              <div className="mt-5 text-xs text-gray-500">
                Stay tuned · This module unlocks for everyone at launch
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchingSoonOverlay;
