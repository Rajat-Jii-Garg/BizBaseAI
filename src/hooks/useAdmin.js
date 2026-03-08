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

  const invoke = useCallback(async (body) => {
    const { data, error } = await supabase.functions.invoke('admin-verify', { body });
    if (error) throw error;
    return data;
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await invoke({ method: 'getStats' });
      setStats(data?.stats);
      return data?.stats;
    } catch (err) {
      console.error('Stats fetch failed:', err);
      return null;
    }
  }, [invoke]);

  const fetchRecentActivity = useCallback(async () => {
    try {
      const data = await invoke({ method: 'getRecentActivity' });
      return data;
    } catch (err) {
      console.error('Recent activity fetch failed:', err);
      return null;
    }
  }, [invoke]);

  const fetchGrowthData = useCallback(async () => {
    try {
      const data = await invoke({ method: 'getGrowthData' });
      return data?.growthData || [];
    } catch (err) {
      console.error('Growth data fetch failed:', err);
      return [];
    }
  }, [invoke]);

  const fetchUsers = useCallback(async (search = '') => {
    try {
      const data = await invoke({ method: 'getUsers', search });
      return data?.users || [];
    } catch (err) {
      console.error('Users fetch failed:', err);
      return [];
    }
  }, [invoke]);

  const deleteUser = useCallback(async (userId) => {
    try {
      const data = await invoke({ method: 'deleteUser', userId });
      return data?.success;
    } catch (err) {
      console.error('Delete user failed:', err);
      return false;
    }
  }, [invoke]);

  const toggleUserVerification = useCallback(async (userId) => {
    try {
      const data = await invoke({ method: 'toggleUserVerification', userId });
      return data;
    } catch (err) {
      console.error('Toggle verification failed:', err);
      return null;
    }
  }, [invoke]);

  const updateUserBizcoins = useCallback(async (userId, amount) => {
    try {
      const data = await invoke({ method: 'updateUserBizcoins', userId, amount });
      return data?.success;
    } catch (err) {
      console.error('Update bizcoins failed:', err);
      return false;
    }
  }, [invoke]);

  const fetchPosts = useCallback(async () => {
    try {
      const data = await invoke({ method: 'getPosts' });
      return data?.posts || [];
    } catch (err) {
      console.error('Posts fetch failed:', err);
      return [];
    }
  }, [invoke]);

  const deletePost = useCallback(async (postId) => {
    try {
      const data = await invoke({ method: 'deletePost', postId });
      return data?.success;
    } catch (err) {
      console.error('Delete post failed:', err);
      return false;
    }
  }, [invoke]);

  const fetchBusinesses = useCallback(async () => {
    try {
      const data = await invoke({ method: 'getBusinesses' });
      return data?.businesses || [];
    } catch (err) {
      console.error('Businesses fetch failed:', err);
      return [];
    }
  }, [invoke]);

  const deleteBusiness = useCallback(async (businessId) => {
    try {
      const data = await invoke({ method: 'deleteBusiness', businessId });
      return data?.success;
    } catch (err) {
      console.error('Delete business failed:', err);
      return false;
    }
  }, [invoke]);

  const toggleBusinessStatus = useCallback(async (businessId) => {
    try {
      const data = await invoke({ method: 'toggleBusinessStatus', businessId });
      return data;
    } catch (err) {
      console.error('Toggle business status failed:', err);
      return null;
    }
  }, [invoke]);

  const fetchJobs = useCallback(async () => {
    try {
      const data = await invoke({ method: 'getJobs' });
      return data?.jobs || [];
    } catch (err) {
      console.error('Jobs fetch failed:', err);
      return [];
    }
  }, [invoke]);

  const deleteJob = useCallback(async (jobId) => {
    try {
      const data = await invoke({ method: 'deleteJob', jobId });
      return data?.success;
    } catch (err) {
      console.error('Delete job failed:', err);
      return false;
    }
  }, [invoke]);

  const toggleJobStatus = useCallback(async (jobId) => {
    try {
      const data = await invoke({ method: 'toggleJobStatus', jobId });
      return data;
    } catch (err) {
      console.error('Toggle job status failed:', err);
      return null;
    }
  }, [invoke]);

  const fetchCommunities = useCallback(async () => {
    try {
      const data = await invoke({ method: 'getCommunities' });
      return data?.communities || [];
    } catch (err) {
      console.error('Communities fetch failed:', err);
      return [];
    }
  }, [invoke]);

  const deleteCommunity = useCallback(async (communityId) => {
    try {
      const data = await invoke({ method: 'deleteCommunity', communityId });
      return data?.success;
    } catch (err) {
      console.error('Delete community failed:', err);
      return false;
    }
  }, [invoke]);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await invoke({ method: 'getEvents' });
      return data?.events || [];
    } catch (err) {
      console.error('Events fetch failed:', err);
      return [];
    }
  }, [invoke]);

  const deleteEvent = useCallback(async (eventId) => {
    try {
      const data = await invoke({ method: 'deleteEvent', eventId });
      return data?.success;
    } catch (err) {
      console.error('Delete event failed:', err);
      return false;
    }
  }, [invoke]);

  return {
    isAdmin,
    adminLoading,
    stats,
    fetchStats,
    fetchRecentActivity,
    fetchGrowthData,
    fetchUsers,
    deleteUser,
    toggleUserVerification,
    updateUserBizcoins,
    fetchPosts,
    deletePost,
    fetchBusinesses,
    deleteBusiness,
    toggleBusinessStatus,
    fetchJobs,
    deleteJob,
    toggleJobStatus,
    fetchCommunities,
    deleteCommunity,
    fetchEvents,
    deleteEvent,
  };
};
