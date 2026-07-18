import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import {
  MessageCircle,
  Users,
  Calendar,
  Handshake,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const WHATSAPP_URL = 'https://chat.whatsapp.com/C2ovqcxBJBsCOTAVbTZyBC';
const CANONICAL_PATH = '/whatsappcommunity';
const OG_IMAGE = '/images/foundersMeet2026.png';

const expectations = [
  {
    icon: Calendar,
    title: 'Weekly live sessions',
    body: 'Every week a focused meet with founders and operators — practical topics, no fluff.',
  },
  {
    icon: Handshake,
    title: 'Real referrals & intros',
    body: 'Members openly share leads, hiring needs, and warm intros across the community.',
  },
  {
    icon: Sparkles,
    title: 'Opportunities first',
    body: 'Jobs, collabs, funding leads and beta users get surfaced here before anywhere else.',
  },
  {
    icon: Users,
    title: '100+ active members',
    body: 'Founders, entrepreneurs and professionals who actually show up and participate.',
  },
];

const faqs = [
  {
    q: 'Is it free to join?',
    a: 'Yes. Founder’s Meet 2026 is 100% free. There are no subscription fees, hidden charges, or paywalls.',
  },
  {
    q: 'How often do sessions happen?',
    a: 'Weekly. One live session every week with founders, operators and invited guests, plus ongoing conversations in the WhatsApp group between sessions.',
  },
  {
    q: 'Who is this community for?',
    a: 'Founders, aspiring founders, entrepreneurs, freelancers and working professionals in India who want real conversations, referrals and opportunities — not passive scrolling.',
  },
  {
    q: 'Do I need to be on BizBase to join?',
    a: 'No. Anyone can join the WhatsApp community. BizBase is where you build your professional profile and network, but the community is open to all.',
  },
  {
    q: 'What happens after I join?',
    a: 'You get instant access to the WhatsApp group, weekly session invites, and can start conversations with members from day one.',
  },
];

const JsonLd = () => {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Event',
        name: 'Founder’s Meet 2026',
        description:
          '100+ Founders, Entrepreneurs and Professionals connect every week — real conversations, referrals, and opportunities.',
        eventSchedule: {
          '@type': 'Schedule',
          repeatFrequency: 'P1W',
          byDay: 'https://schema.org/Saturday',
        },
        eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: {
          '@type': 'VirtualLocation',
          url: WHATSAPP_URL,
        },
        organizer: {
          '@type': 'Organization',
          name: 'BizBase',
          url: 'https://bizbase-ai.vercel.app',
        },
        image: OG_IMAGE,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          url: `https://bizbase-ai.vercel.app${CANONICAL_PATH}`,
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

const JoinButton = ({ size = 'lg', className = '' }) => (
  <a
    href={WHATSAPP_URL}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Join Founder's Meet 2026 WhatsApp Community"
  >
    <Button
      size={size}
      className={`bg-[#0F766E] hover:bg-[#0b5c56] text-white rounded-xl px-7 py-6 shadow-lg shadow-emerald-900/10 font-semibold ${className}`}
    >
      <MessageCircle className="w-5 h-5 mr-2" />
      Join WhatsApp Community
      <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  </a>
);

const WhatsappCommunity = () => {
  useEffect(() => {
    // Inject JSON-LD once (client-side; safe for SPA)
  }, []);

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Founder's Meet 2026 — Weekly Founders & Entrepreneurs Community"
        description="Join Founder's Meet 2026 — India's growing weekly community of 100+ founders, entrepreneurs and professionals. Real conversations, referrals and opportunities. Free to join."
        path={CANONICAL_PATH}
        image={OG_IMAGE}
        type="website"
      />
      <JsonLd />
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-24">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(800px 400px at 15% 0%, #F7F4FF 0%, transparent 60%), radial-gradient(700px 400px at 100% 10%, #ECFDF5 0%, transparent 60%)',
          }}
        />
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-[auto,1fr] gap-8 md:gap-12 items-center">
            <div className="mx-auto md:mx-0 w-40 h-40 sm:w-48 sm:h-48 rounded-full ring-1 ring-[#0F766E]/10 shadow-xl shadow-emerald-900/5 bg-white overflow-hidden">
              <img
                src={"/images/foundersMeetLogo.png"}
                alt="Founder's Meet 2026 "
                className="w-full h-full object-contain p-2"
                width={192}
                height={192}
              />
            </div>
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white ring-1 ring-[#0F766E]/15 text-xs font-medium text-[#0F766E] mb-5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Now accepting members — India
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.05]">
                Join Founder&apos;s Meet 2026
              </h1>
              <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                100+ Founders, Entrepreneurs and Professionals connect every week — real conversations, referrals, and opportunities. Join India&apos;s #1 growing community and never miss a session.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <JoinButton />
              </div>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#0F766E]" /> Free forever</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#0F766E]" /> Weekly live sessions</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#0F766E]" /> Real Indian founders</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT TO EXPECT */}
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#6D5EF7] mb-3">What to expect</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              A weekly meet designed for real momentum
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              This isn&apos;t another silent broadcast group. It&apos;s a working circle of Indian founders and professionals who show up, share openly, and help each other move faster.
            </p>
          </div>

          <ul className="mt-10 grid sm:grid-cols-2 gap-x-8 gap-y-2 divide-y divide-slate-200 sm:divide-y-0">
            {expectations.map((item, i) => (
              <li key={item.title} className="flex gap-5 py-6 sm:py-8 sm:border-b sm:border-slate-200">
                <div className="shrink-0 text-xs font-mono text-slate-400 pt-1 w-8">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-slate-900">
                    <item.icon className="w-4 h-4 text-[#0F766E]" />
                    <h3 className="font-semibold">{item.title}</h3>
                  </div>
                  <p className="mt-2 text-slate-600 text-sm leading-relaxed">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 bg-white/60 border-y border-slate-200/70">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#6D5EF7] mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Questions people ask before joining
          </h2>
          <div className="mt-10 divide-y divide-slate-200">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group py-5"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-semibold text-slate-900 pr-4">{f.q}</span>
                  <span className="shrink-0 w-7 h-7 rounded-full bg-slate-100 group-open:bg-[#0F766E] group-open:text-white text-slate-500 flex items-center justify-center text-lg leading-none transition-colors">
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:inline">–</span>
                  </span>
                </summary>
                <p className="mt-3 text-slate-600 leading-relaxed text-[15px]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-20 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 text-center shadow-2xl shadow-slate-900/20">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-60"
              style={{
                background:
                  'radial-gradient(500px 260px at 20% 0%, rgba(15,118,110,0.35) 0%, transparent 60%), radial-gradient(500px 260px at 100% 100%, rgba(109,94,247,0.35) 0%, transparent 60%)',
              }}
            />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Your seat is one tap away
              </h2>
              <p className="mt-4 text-slate-300 max-w-xl mx-auto">
                Join Founder&apos;s Meet 2026 and start showing up alongside the founders who are actually building.
              </p>
              <div className="mt-8 flex justify-center">
                <JoinButton />
              </div>
              <p className="mt-5 text-xs text-slate-400">Free forever · No spam · Leave anytime</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhatsappCommunity;
