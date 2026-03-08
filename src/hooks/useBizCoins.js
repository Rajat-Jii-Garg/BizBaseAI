import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// BizCoins rewards are now handled automatically by database triggers.
// This hook is kept for reading balance and leaderboard data.
export const COIN_REWARDS = {
  post: 0.35,
  comment: 0.45,
  like: 0.20,
  share: 1.02,
  repost: 0.24,
  follow: 1.05,
  connection_request: 0.15,
  connection_accepted: 0.50,
  event_created: 1.50,
  event_attend: 0.40,
  job_posted: 2.00,
  job_apply: 0.35,
  community_create: 1.25,
  community_join: 0.30,
  endorsement_given: 0.25,
  endorsement_received: 0.40,
  referral: 0.75,
  profile_complete: 3.50,
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
