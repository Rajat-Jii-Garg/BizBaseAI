
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import ValueProposition from '@/components/ValueProposition';
import Benefits from '@/components/Benefits';
import WhoIsItFor from '@/components/WhoIsItFor';
import HowItWorks from '@/components/HowItWorks';
import WhyChooseUs from '@/components/WhyChooseUs';
import ScreenshotsCarousel from '@/components/ScreenshotsCarousel';
import Testimonials from '@/components/Testimonials';
import PricingSection from '@/components/PricingSection';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Benefits />
      <ValueProposition />
      <Features />
      <WhoIsItFor />
      <HowItWorks />
      <WhyChooseUs />
      <ScreenshotsCarousel />
      <Testimonials />
      <PricingSection />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Index;
