import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useProfileViews = () => {
  const { user } = useAuth();
  const [viewers, setViewers] = useState([]);
  const [viewCount, setViewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchViewers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('profile_views')
        .select('id, viewed_at, viewer_user_id')
        .eq('profile_user_id', user.id)
        .gte('viewed_at', sevenDaysAgo.toISOString())
        .order('viewed_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Get viewer profiles
      const viewerIds = [...new Set((data || []).map(v => v.viewer_user_id).filter(Boolean))];
      let viewerProfiles = [];
      if (viewerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, current_position, company_name, username')
          .in('id', viewerIds);
        viewerProfiles = profiles || [];
      }

      const enriched = (data || []).map(view => ({
        ...view,
        profile: viewerProfiles.find(p => p.id === view.viewer_user_id) || null,
      }));

      setViewers(enriched);
      setViewCount(data?.length || 0);
    } catch (err) {
      console.error('Profile views fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const recordView = useCallback(async (profileUserId) => {
    if (!user || user.id === profileUserId) return;
    try {
      await supabase.from('profile_views').insert({
        profile_user_id: profileUserId,
        viewer_user_id: user.id,
      });
    } catch (err) {
      // Silently fail - not critical
    }
  }, [user]);

  useEffect(() => {
    fetchViewers();
  }, [fetchViewers]);

  return { viewers, viewCount, loading, recordView, refetch: fetchViewers };
};
