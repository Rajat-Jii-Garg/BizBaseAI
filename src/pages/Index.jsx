
import React from 'react';
import SEOHead from '@/components/SEOHead';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
// import ProductPreview from '@/components/ProductPreview';
import CTA from '@/components/CTA';
import WhoIsItFor from '@/components/WhoIsItFor';
import HowItWorks from '@/components/HowItWorks';
import CallToAction from '@/components/CallToAction';
import CommunityBanner from '@/components/CommunityBanner';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="BizBase AI - All-in-One Platform for Founders, Entrepreneurs, Students & Businesses"
        description="Network, find jobs, join communities, get AI career coaching, and run your business — all under one roof. 100% free for every professional."
        path="/"
      />
      <Navbar />
      <Hero />
      {/* <ProductPreview /> */}
      <Features />
      <CTA />
      <WhoIsItFor />
      <HowItWorks />
      <CommunityBanner />
      <CallToAction />


      <Footer />
    </div>
  );
};

export default Index;
