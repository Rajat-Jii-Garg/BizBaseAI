import React from 'react';
import Navbar from '@/components/Navbar'; // apna actual path check kar
import { Button } from '@/components/ui/button';
import { Users, MessageCircle } from 'lucide-react';

const WhatsappCommunity = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="pt-32 pb-20 max-w-3xl mx-auto px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          Join Founder's Meet 2026
        </h1>
        <p className="text-muted-foreground text-base mb-8 leading-relaxed">
          100+ Founders, Entrepreneurs and Professionals connect every week — real conversations, referrals, and opportunities. Join India's #1 growing community and never miss a session.
        </p>
        <a href="https://chat.whatsapp.com/C2ovqcxBJBsCOTAVbTZyBC" target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl px-8 py-6">
            <MessageCircle className="w-5 h-5 mr-2" />
            Join WhatsApp Community
          </Button>
        </a>
      </section>
    </div>
  );
};

export default WhatsappCommunity;