import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Loader2 } from 'lucide-react';

const BusinessRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    
    let cancelled = false;

    const checkBusiness = async () => {
      try {
        // Fetch all active businesses for this user
        const { data: businesses, error } = await supabase
          .from('businesses')
          .select('id, username, name, status')
          .eq('owner_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (cancelled) return;

        if (error) {
          console.error('Error fetching businesses:', error);
          navigate('/business-setup', { replace: true });
          return;
        }

        // No business found - redirect to setup
        if (!businesses || businesses.length === 0) {
          navigate('/business-setup', { replace: true });
          return;
        }

        // Multiple businesses - go to selector
        if (businesses.length > 1) {
          navigate('/my-businesses', { replace: true });
          return;
        }

        // Single business - show splash and redirect
        const business = businesses[0];
        setBusinessName(business.name);
        setShowSplash(true);
        setChecking(false);

        // Navigate after splash animation
        setTimeout(() => {
          if (!cancelled) {
            navigate(`/business/${business.username}/dashboard`, { replace: true });
          }
        }, 2000);

      } catch (err) {
        console.error('Business check error:', err);
        if (!cancelled) {
          navigate('/business-setup', { replace: true });
        }
      }
    };

    checkBusiness();
    return () => { cancelled = true; };
  }, [user, navigate]);

  // Loading state while checking
  if (checking && !showSplash) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Checking business access...</p>
      </div>
    );
  }

  // Splash screen for business redirect
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80">
      <div className="text-center text-white">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-pulse">
            <Building2 className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3 animate-fade-in">
          Welcome to Business Dashboard
        </h1>
        {businessName && (
          <p className="text-xl text-white/90 mb-4 animate-fade-in">
            {businessName}
          </p>
        )}
        <p className="text-white/70 animate-pulse">
          Loading your business workspace...
        </p>
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default BusinessRedirect;