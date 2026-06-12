import React from 'react';
import { GraduationCap, Briefcase, Rocket, Building2, Search, Users } from 'lucide-react';

const audiences = [
  { icon: GraduationCap, title: 'Students', desc: 'Build your profile, learn from communities, find internships early.', color: 'from-blue-500 to-cyan-500' },
  { icon: Search, title: 'Job Seekers', desc: 'Discover roles, get AI resume coaching, apply directly through BizBase.', color: 'from-emerald-500 to-teal-500' },
  { icon: Briefcase, title: 'Freelancers', desc: 'Showcase skills, find clients, manage projects and payments in one place.', color: 'from-amber-500 to-orange-500' },
  { icon: Rocket, title: 'Founders', desc: 'Network with other founders, hire talent, get visibility from day one.', color: 'from-violet-500 to-purple-500' },
  { icon: Building2, title: 'Business Owners', desc: 'Run your business with built-in CRM, finance, team and lead tools.', color: 'from-indigo-500 to-blue-500' },
  { icon: Users, title: 'Working Professionals', desc: 'Grow your network, share insights, get noticed by the right people.', color: 'from-rose-500 to-pink-500' },
];

const WhoIsItFor = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 text-violet-600 px-3.5 py-1.5 rounded-full text-xs font-medium mb-4">
            Built for everyone
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
            Who is BizBase for?
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            Whether you're starting out or scaling up — BizBase has a home for you. No invites. No limits.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {audiences.map((a, i) => (
            <div key={i} className="group relative bg-slate-50/70 hover:bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg rounded-2xl p-6 transition-all duration-300">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <a.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{a.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoIsItFor;
