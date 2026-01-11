import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useBusinesses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBusinesses = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setBusinesses(data || []);
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createBusiness = async (businessData) => {
    if (!user) {
      throw new Error('User must be logged in to create a business');
    }

    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          ...businessData,
          owner_id: user.id,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setBusinesses(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating business:', err);
      throw err;
    }
  };

  const updateBusiness = async (businessId, updates) => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', businessId)
        .eq('owner_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setBusinesses(prev => 
        prev.map(b => b.id === businessId ? data : b)
      );
      
      return data;
    } catch (err) {
      console.error('Error updating business:', err);
      throw err;
    }
  };

  const getBusinessById = async (businessId) => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching business:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [user]);

  return {
    businesses,
    loading,
    error,
    fetchBusinesses,
    createBusiness,
    updateBusiness,
    getBusinessById,
    hasBusinesses: businesses.length > 0
  };
};

export default useBusinesses;
