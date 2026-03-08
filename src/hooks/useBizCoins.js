import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// BizCoins rewards are now handled automatically by database triggers.
// This hook is kept for reading balance and leaderboard data.
export const COIN_REWARDS = {
  post: 10,
  comment: 5,
  like: 2,
  share: 15,
  repost: 10,
  follow: 3,
  connection_request: 2,
  connection_accepted: 5,
  event_created: 20,
  event_attend: 5,
  job_posted: 25,
  job_apply: 5,
  community_create: 15,
  community_join: 3,
  endorsement_given: 3,
  endorsement_received: 5,
  referral: 10,
  profile_complete: 50,
};

export const useBizCoins = () => {
  const { user } = useAuth();

  // Manual award (kept for referrals & profile completion which don't have triggers)
  const awardCoins = useCallback(async (action, customAmount = null) => {
    if (!user) return false;
    const amount = customAmount || COIN_REWARDS[action] || 0;
    if (amount <= 0) return false;

    try {
      await supabase.rpc('award_bizcoins', {
        _user_id: user.id,
        _amount: amount,
        _reason: action
      });
      return true;
    } catch (err) {
      console.error('BizCoins award failed:', err);
      return false;
    }
  }, [user]);

  const getBalance = useCallback(async () => {
    if (!user) return 0;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('bizcoins')
        .eq('id', user.id)
        .single();
      return data?.bizcoins || 0;
    } catch { return 0; }
  }, [user]);

  const getLeaderboard = useCallback(async () => {
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

  return { awardCoins, getBalance, getLeaderboard, COIN_REWARDS };
};
