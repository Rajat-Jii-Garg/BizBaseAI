import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePowerScore = () => {
  const { user, profile } = useAuth();
  const [score, setScore] = useState(0);
  const [breakdown, setBreakdown] = useState({});

  const calculateScore = useCallback(async () => {
    if (!user || !profile) return;

    try {
      // Profile completeness (max 20)
      const profileScore = Math.min((profile.profile_completion_score || 0) / 5, 20);

      // Posts activity (max 25)
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      const postsScore = Math.min((postsCount || 0) * 2, 25);

      // Connections (max 20)
      const { count: connCount } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted');
      const connScore = Math.min((connCount || 0), 20);

      // Engagement received (max 20)
      const { data: engagementData } = await supabase
        .from('posts')
        .select('likes_count, comments_count, shares_count')
        .eq('user_id', user.id);
      const totalEngagement = engagementData?.reduce((sum, p) => 
        sum + (p.likes_count || 0) + (p.comments_count || 0) + (p.shares_count || 0), 0) || 0;
      const engScore = Math.min(totalEngagement, 20);

      // BizCoins (max 15)
      const coinsScore = Math.min((profile.bizcoins || 0) / 10, 15);

      const total = Math.round(profileScore + postsScore + connScore + engScore + coinsScore);
      const finalScore = Math.min(total, 100);

      setScore(finalScore);
      setBreakdown({
        profile: Math.round(profileScore),
        posts: Math.round(postsScore),
        connections: Math.round(connScore),
        engagement: Math.round(engScore),
        coins: Math.round(coinsScore)
      });

      // Update in DB
      await supabase
        .from('profiles')
        .update({ power_score: finalScore })
        .eq('id', user.id);

    } catch (err) {
      console.error('Power score calc error:', err);
    }
  }, [user, profile]);

  useEffect(() => {
    calculateScore();
  }, [calculateScore]);

  return { score, breakdown, recalculate: calculateScore };
};
