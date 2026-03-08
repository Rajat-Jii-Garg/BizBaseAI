import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const COIN_REWARDS = {
  post: 10,
  comment: 5,
  like: 2,
  share: 15,
  repost: 10,
  profile_complete: 50,
  connection_accepted: 5,
  event_created: 20,
  job_posted: 25,
};

export const useBizCoins = () => {
  const { user } = useAuth();

  const awardCoins = useCallback(async (action, customAmount = null) => {
    if (!user) return false;
    const amount = customAmount || COIN_REWARDS[action] || 0;
    if (amount <= 0) return false;

    try {
      // Get current coins
      const { data: profile } = await supabase
        .from('profiles')
        .select('bizcoins')
        .eq('id', user.id)
        .single();

      const currentCoins = profile?.bizcoins || 0;

      await supabase
        .from('profiles')
        .update({ bizcoins: currentCoins + amount })
        .eq('id', user.id);

      return true;
    } catch (err) {
      console.error('BizCoins award failed:', err);
      return false;
    }
  }, [user]);

  const getLeaderboard = useCallback(async (period = 'all') => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, bizcoins, current_position, company_name')
        .gt('bizcoins', 0)
        .order('bizcoins', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Leaderboard fetch failed:', err);
      return [];
    }
  }, []);

  return { awardCoins, getLeaderboard, COIN_REWARDS };
};
