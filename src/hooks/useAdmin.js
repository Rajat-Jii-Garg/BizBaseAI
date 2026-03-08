import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAdmin = () => {
  const { user, session } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

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

  const invoke = useCallback(async (method, extra = {}) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-verify', {
        body: { method, ...extra }
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`Admin ${method} failed:`, err);
      return null;
    }
  }, []);

  const fetchStats = useCallback(() => invoke('getStats').then(d => d?.stats), [invoke]);
  const fetchRecentActivity = useCallback(() => invoke('getRecentActivity'), [invoke]);
  const fetchGrowthStats = useCallback(() => invoke('getGrowthStats'), [invoke]);
  const fetchUsers = useCallback((search = '') => invoke('getUsers', { search }).then(d => d?.users || []), [invoke]);
  const fetchPosts = useCallback((search = '') => invoke('getPosts', { search }).then(d => d?.posts || []), [invoke]);
  const fetchBusinesses = useCallback((search = '') => invoke('getBusinesses', { search }).then(d => d?.businesses || []), [invoke]);
  const fetchJobs = useCallback((search = '') => invoke('getJobs', { search }).then(d => d?.jobs || []), [invoke]);
  const fetchCommunities = useCallback((search = '') => invoke('getCommunities', { search }).then(d => d?.communities || []), [invoke]);
  const fetchEvents = useCallback((search = '') => invoke('getEvents', { search }).then(d => d?.events || []), [invoke]);
  const fetchAdmins = useCallback(() => invoke('getAdmins').then(d => d?.admins || []), [invoke]);

  const deletePost = useCallback((postId) => invoke('deletePost', { postId }).then(d => d?.success), [invoke]);
  const deleteUser = useCallback((userId) => invoke('deleteUser', { userId }).then(d => d?.success), [invoke]);
  const deleteJob = useCallback((jobId) => invoke('deleteJob', { jobId }).then(d => d?.success), [invoke]);
  const deleteCommunity = useCallback((communityId) => invoke('deleteCommunity', { communityId }).then(d => d?.success), [invoke]);
  const deleteEvent = useCallback((eventId) => invoke('deleteEvent', { eventId }).then(d => d?.success), [invoke]);

  const toggleUserVerified = useCallback((userId, verified) => invoke('toggleUserVerified', { userId, verified }).then(d => d?.success), [invoke]);
  const toggleBusinessVerified = useCallback((businessId, verified) => invoke('toggleBusinessVerified', { businessId, verified }).then(d => d?.success), [invoke]);
  const toggleBusinessStatus = useCallback((businessId, status) => invoke('toggleBusinessStatus', { businessId, status }).then(d => d?.success), [invoke]);
  const toggleJobActive = useCallback((jobId, active) => invoke('toggleJobActive', { jobId, active }).then(d => d?.success), [invoke]);
  const addAdmin = useCallback((userId) => invoke('addAdmin', { userId }).then(d => d?.success), [invoke]);
  const removeAdmin = useCallback((userId) => invoke('removeAdmin', { userId }).then(d => d?.success), [invoke]);

  return {
    isAdmin, adminLoading,
    fetchStats, fetchRecentActivity, fetchGrowthStats,
    fetchUsers, fetchPosts, fetchBusinesses, fetchJobs, fetchCommunities, fetchEvents, fetchAdmins,
    deletePost, deleteUser, deleteJob, deleteCommunity, deleteEvent,
    toggleUserVerified, toggleBusinessVerified, toggleBusinessStatus, toggleJobActive,
    addAdmin, removeAdmin,
  };
};
