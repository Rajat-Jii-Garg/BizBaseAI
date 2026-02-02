import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';

const BusinessRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { businesses, loading } = useBusinessContext();
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    
    const checkBusiness = async () => {
      // 🔑 BACKEND CHECK (single source of truth)
      const { data: business, error } = await supabase
        .from('businesses')
        .select('id, username, status')
        .eq('owner_id', user.id)
        .eq('status', 'active')
        .maybesingle();

      if (error || !business) {
        navigate('/business-setup', { replace: true });
        return;
      }

      // ✅ BUSINESS EXISTS → SHOW SPLASH
      setShowSplash(true);

      setTimeout(() => {
          navigate(`/business/${business.username}`, { replace: true });
      }, 3000);
    };

    checkBusiness();
  }, [user, navigate]);

  // ❌ NO SPLASH UNTIL BUSINESS CONFIRMED
  if (!showSplash) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Checking business access...
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div className="text-center animate-pulse">
        <h1 className="text-3xl font-bold mb-2">
          Welcome to Business Dashboard
        </h1>
        <p className="text-sm opacity-90">
          Loading your business workspace...
        </p>
      </div>
    </div>
  );
};

export default BusinessRedirect;