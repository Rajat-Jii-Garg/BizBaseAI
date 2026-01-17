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

  // Fetch a specific business by ID
  const fetchBusiness = useCallback(async (businessId) => {
    if (!businessId) return null;

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching business:', error);
      return null;
    }
  }, []);

  // Switch to a different business
  const switchBusiness = useCallback(async (businessId) => {
    if (!businessId) {
      setCurrentBusiness(null);
      setIsBusinessMode(false);
      localStorage.removeItem('currentBusinessId');
      return;
    }

    const business = await fetchBusiness(businessId);
    if (business) {
      setCurrentBusiness(business);
      setIsBusinessMode(true);
      localStorage.setItem('currentBusinessId', businessId);
    }
  }, [fetchBusiness]);

  // Exit business mode
  const exitBusinessMode = useCallback(() => {
    setCurrentBusiness(null);
    setIsBusinessMode(false);
    localStorage.removeItem('currentBusinessId');
  }, []);

  // Check if user owns the business
  const isBusinessOwner = useCallback((businessId) => {
    return businesses.some(b => b.id === businessId);
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
    const storedBusinessId = localStorage.getItem('currentBusinessId');
    if (storedBusinessId && businesses.length > 0) {
      const business = businesses.find(b => b.id === storedBusinessId);
      if (business) {
        setCurrentBusiness(business);
        setIsBusinessMode(true);
      }
    }
  }, [businesses]);

  // Subscribe to business changes
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
    fetchBusiness,
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
