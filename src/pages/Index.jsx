import React from "react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
// import ProductPreview from '@/components/ProductPreview';
import CTA from "@/components/CTA";
import WhoIsItFor from "@/components/WhoIsItFor";
import HowItWorks from "@/components/HowItWorks";
import CallToAction from "@/components/CallToAction";
import CommunityBanner from "@/components/CommunityBanner";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/LoginModal";
import Loader from "@/components/Loader";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // Redirect logic
  useEffect(() => {
    if (loading) return;

    if (user) {
      navigate("/dashboard", { replace: true }); // Case 1: already logged-in
    }
    // Case 2 aur Case 3 dono ab home page pe hi rukenge
  }, [user, loading, navigate]);

  useEffect(() => {
    if (loading || user) return;

    const hasLoggedInBefore = localStorage.getItem("bb_returning_user");
    const delay = hasLoggedInBefore ? 5000 : 7000; // returning user = 5 sec, new user = 7 sec
    const timer = setTimeout(() => setShowLoginPopup(true), delay);
    return () => clearTimeout(timer);
  }, [loading, user]);

  if (loading) return <Loader />;
  if (user) return null;

  return (
    <div className="min-h-screen bg-white">
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

      {/* Quick Auth Links Section */}
      <section className="py-8 md:py-16 lg:py-16 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Ready to Get Started?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
            >
              <Link to="/signup">Create Free Account</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      {showLoginPopup && (
        <LoginModal onClose={() => setShowLoginPopup(false)} />
      )}
    </div>
  );
};

export default Index;
