import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAdmin = () => {
  const { user, session } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user || !session) {
        setIsAdmin(false);
        setAdminLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('admin-verify', {
          body: { method: 'verify' }
        });

        if (error) throw error;
        setIsAdmin(data?.isAdmin || false);
      } catch (err) {
        console.error('Admin check failed:', err);
        setIsAdmin(false);
      } finally {
        setAdminLoading(false);
      }
    };

    checkAdmin();
  }, [user, session]);

  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-verify', {
        body: { method: 'getStats' }
      });
      if (error) throw error;
      setStats(data?.stats);
      return data?.stats;
    } catch (err) {
      console.error('Stats fetch failed:', err);
      return null;
    }
  }, []);

  const fetchUsers = useCallback(async (search = '') => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-verify', {
        body: { method: 'getUsers', search }
      });
      if (error) throw error;
      return data?.users || [];
    } catch (err) {
      console.error('Users fetch failed:', err);
      return [];
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-verify', {
        body: { method: 'getPosts' }
      });
      if (error) throw error;
      return data?.posts || [];
    } catch (err) {
      console.error('Posts fetch failed:', err);
      return [];
    }
  }, []);

  const deletePost = useCallback(async (postId) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-verify', {
        body: { method: 'deletePost', postId }
      });
      if (error) throw error;
      return data?.success;
    } catch (err) {
      console.error('Delete post failed:', err);
      return false;
    }
  }, []);

  const deleteUser = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-verify', {
        body: { method: 'deleteUser', userId }
      });
      if (error) throw error;
      return data?.success;
    } catch (err) {
      console.error('Delete user failed:', err);
      return false;
    }
  }, []);

  const fetchBusinesses = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-verify', {
        body: { method: 'getBusinesses' }
      });
      if (error) throw error;
      return data?.businesses || [];
    } catch (err) {
      console.error('Businesses fetch failed:', err);
      return [];
    }
  }, []);

  return {
    isAdmin,
    adminLoading,
    stats,
    fetchStats,
    fetchUsers,
    fetchPosts,
    deletePost,
    deleteUser,
    fetchBusinesses,
  };
};
