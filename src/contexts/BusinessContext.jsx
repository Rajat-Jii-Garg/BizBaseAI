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
  const [dataVersion, setDataVersion] = useState(0);

  // Fetch all businesses owned by the user
  const fetchBusinesses = useCallback(async () => {
    if (!user?.id) {
      setBusinesses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [{ data: owned, error: ownedError }, { data: memberships, error: membershipError }] = await Promise.all([
        supabase.from('businesses').select('*').eq('owner_id', user.id),
        supabase.from('business_team_members').select('business_id').eq('user_id', user.id).eq('status', 'active')
      ]);
      if (ownedError) throw ownedError;
      if (membershipError) throw membershipError;
      const memberIds = [...new Set((memberships || []).map((m) => m.business_id).filter(Boolean))];
      let memberBusinesses = [];
      if (memberIds.length) {
        const { data, error } = await supabase.from('businesses').select('*').in('id', memberIds);
        if (error) throw error;
        memberBusinesses = data || [];
      }
      const merged = [...(owned || []), ...memberBusinesses];
      const unique = Array.from(new Map(merged.map((b) => [b.id, b])).values())
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setBusinesses(unique);
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

  // Switch to a different business. Owners and active team members can enter.
  const switchBusiness = useCallback(async (businessOrSlug) => {
    // Handle both business object and slug string
    const slug = typeof businessOrSlug === 'string' 
      ? businessOrSlug 
      : businessOrSlug?.username;
    
    if (!slug) {
      setCurrentBusiness(null);
      setIsBusinessMode(false);
      localStorage.removeItem('currentBusinessSlug');
      return;
    }

    // If we already have the business object, use it directly
    let business = typeof businessOrSlug === 'object' ? businessOrSlug : null;
    
    // Otherwise fetch it
    if (!business) {
      business = await fetchBusinessBySlug(slug);
    }

    if (!business || !user?.id) {
      setCurrentBusiness(null);
      setIsBusinessMode(false);
      localStorage.removeItem('currentBusinessSlug');
      return;
    }

    if (business.owner_id === user.id) {
      setCurrentBusiness(business);
      setIsBusinessMode(true);
      localStorage.setItem('currentBusinessSlug', slug);
      return;
    }

    const { data: membership } = await supabase
      .from('business_team_members')
      .select('id,status')
      .eq('business_id', business.id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (membership) {
      setCurrentBusiness(business);
      setIsBusinessMode(true);
      localStorage.setItem('currentBusinessSlug', slug);
      return;
    }

    setCurrentBusiness(null);
    setIsBusinessMode(false);
    localStorage.removeItem('currentBusinessSlug');
  }, [fetchBusinessBySlug, user?.id]);

  // Exit business mode
  const exitBusinessMode = useCallback(() => {
    setCurrentBusiness(null);
    setIsBusinessMode(false);
    localStorage.removeItem('currentBusinessSlug');
  }, []);

  // Used by routing: a business owner is always allowed; team membership is checked asynchronously in switchBusiness.
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
    const storedSlug = localStorage.getItem('currentBusinessSlug');
    if (storedSlug && businesses.length > 0) {
      const found = businesses.find(b => b.username === storedSlug);
      if (found) {
        setCurrentBusiness(found);
        setIsBusinessMode(true);
      }
    }
  }, [businesses]);

  // One business-scoped realtime channel keeps every business screen in sync.
  useEffect(() => {
    if (!user?.id || !currentBusiness?.id) return;
    const bid = currentBusiness.id;
    const tables = [
      'business_leads','business_customers','business_invoices','business_transactions',
      'business_products','business_projects','business_activities','business_growth_plans',
      'business_growth_campaigns','business_alerts','business_team_members','businesses'
    ];
    const channel = supabase.channel(`business_live_${bid}`);
    tables.forEach((table) => {
      const filter = table === 'businesses' ? `id=eq.${bid}` : `business_id=eq.${bid}`;
      channel.on('postgres_changes', { event: '*', schema: 'public', table, filter }, () => {
        setDataVersion((v) => v + 1);
        window.dispatchEvent(new CustomEvent('bizbase:business-data-changed', { detail: { businessId: bid, table } }));
        if (table === 'businesses') fetchBusinesses();
      });
    });
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, currentBusiness?.id, fetchBusinesses]);

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
    hasBusinesses: businesses.length > 0,
    dataVersion
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};

export default BusinessContext;