import React, { useState } from 'react';
import { LayoutDashboard, Users, Building2, Sparkles } from 'lucide-react';

const tabs = [
  { id: 'feed', label: 'Personal Dashboard', icon: LayoutDashboard, image: '/images/userDashboard.png', desc: 'Your personalized feed, network suggestions, AI insights and growth analytics — all on one screen.' },
  { id: 'network', label: 'Networking', icon: Users, image: '/images/connections.png', desc: 'Build meaningful professional connections, message in real time, and discover people in your field.' },
  { id: 'business', label: 'Business Dashboard', icon: Building2, image: '/images/businessDashboard.png', desc: 'Manage your business with built-in CRM, finance, projects and team — without any extra tools.' },
  { id: 'register', label: 'Register Business', icon: Sparkles, image: '/images/Businessregistration.png', desc: 'Spin up your business profile in minutes and start managing operations from day one.' },
];

const ProductPreview = () => {
  const [active, setActive] = useState(tabs[0].id);
  const current = tabs.find(t => t.id === active);

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 px-3.5 py-1.5 rounded-full text-xs font-medium mb-4">
            See it in action
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
            One platform. Every tool you need.
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            A quick look inside BizBase — networking, business management, AI coaching and more.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active === t.id
                  ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-200/60'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="absolute -inset-6 bg-gradient-to-r from-violet-200/40 via-blue-200/40 to-cyan-200/40 rounded-3xl blur-2xl -z-10" />
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4 px-3 py-1 bg-white border border-slate-200 rounded text-xs text-slate-500 truncate">
                bizbase-ai.lovable.app/{current.id}
              </div>
            </div>
            <img
              src={current.image}
              alt={current.label}
              className="w-full h-auto block"
              loading="lazy"
            />
          </div>
          <p className="text-center text-slate-600 mt-6 max-w-2xl mx-auto text-sm md:text-base">
            {current.desc}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProductPreview;
