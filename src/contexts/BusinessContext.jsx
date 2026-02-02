import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

const BusinessContext = createContext();

export const useBusinessContext = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusinessContext must be used within a BusinessProvider');
  }
  return context;
};

export const BusinessProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentBusiness, setCurrentBusiness] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBusinessMode, setIsBusinessMode] = useState(false);

  // Fetch all businesses owned by the user
  const fetchBusinesses = useCallback(async () => {
    if (!user?.id) {
      setBusinesses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch a specific business by SLUG -
  const fetchBusinessBySlug = useCallback(async (slug) => {
    if (!slug) return null;

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('username', slug)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching businesses by slug:', err);
      return null;
    }
  }, []);

  // Switch to a different business
  const switchBusiness = useCallback(async (slug) => {
    if (!slug) {
      setCurrentBusiness(null);
      setIsBusinessMode(false);
      localStorage.removeItem('currentBusinessSlug');
      return;
    }

    if (business && business.owner_id === user?.id) {
      setCurrentBusiness(business);
      setIsBusinessMode(true);
      localStorage.setItem('currentBusinessSlug', slug);
    } else {
      // safety fallback
      setCurrentBusiness(null);
      setIsBusinessMode(false);
      localStorage.removeItem('currentBusinessSlug');
    }
  }, [fetchBusinessBySlug, user?.id]);

  // Exit business mode
  const exitBusinessMode = useCallback(() => {
    setCurrentBusiness(null);
    setIsBusinessMode(false);
    localStorage.removeItem('currentBusinessSlug');
  }, []);

  // Check if user owns the business
  const isBusinessOwner = useCallback((slug) => {
    return businesses.some(b => b.username === slug);
  }, [businesses]);

  // Initialize - fetch businesses and restore last selected business
  useEffect(() => {
    if (user?.id) {
      fetchBusinesses();
    } else {
      setBusinesses([]);
      setCurrentBusiness(null);
      setIsBusinessMode(false);
      setLoading(false);
    }
  }, [user?.id, fetchBusinesses]);

  // Restore last selected business from localStorage
  useEffect(() => {
    const storedSlug = localStorage.getItem('currentBSlug');
    if (storedSlug && businesses.length > 0) {
      const found = businesses.find(b => b.username === storedSlug);
      if (found) {
        setCurrentBusiness(business);
        setIsBusinessMode(true);
      }
    }
  }, [businesses]);

  // Realtime updates Supabase -
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`user_businesses_${user.id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'businesses', filter: `owner_id=eq.${user.id}` },
        () => {
          fetchBusinesses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchBusinesses]);

  const value = {
    currentBusiness,
    businesses,
    loading,
    isBusinessMode,
    fetchBusinesses,
    fetchBusinessBySlug,
    switchBusiness,
    exitBusinessMode,
    isBusinessOwner,
    hasBusinesses: businesses.length > 0
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};

export default BusinessContext;