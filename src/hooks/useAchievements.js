import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const BADGE_DEFINITIONS = [
  { id: 'first_post', title: 'First Post', icon: '✍️', description: 'Published your first post', category: 'Content', check: (stats) => stats.posts >= 1 },
  { id: 'content_creator', title: 'Content Creator', icon: '📝', description: 'Published 10 posts', category: 'Content', check: (stats) => stats.posts >= 10 },
  { id: 'thought_leader', title: 'Thought Leader', icon: '💡', description: 'Published 50 posts', category: 'Content', check: (stats) => stats.posts >= 50 },
  { id: 'networker', title: 'Networker', icon: '🤝', description: 'Made 5 connections', category: 'Network', check: (stats) => stats.connections >= 5 },
  { id: 'connector', title: 'Super Connector', icon: '🌐', description: 'Made 25 connections', category: 'Network', check: (stats) => stats.connections >= 25 },
  { id: 'influencer', title: 'Influencer', icon: '⭐', description: 'Made 100 connections', category: 'Network', check: (stats) => stats.connections >= 100 },
  { id: 'rising_star', title: 'Rising Star', icon: '🌟', description: 'Earned 100 BizCoins', category: 'Achievement', check: (stats) => stats.bizcoins >= 100 },
  { id: 'power_user', title: 'Power User', icon: '⚡', description: 'Earned 500 BizCoins', category: 'Achievement', check: (stats) => stats.bizcoins >= 500 },
  { id: 'elite', title: 'Elite Member', icon: '👑', description: 'Earned 1000 BizCoins', category: 'Achievement', check: (stats) => stats.bizcoins >= 1000 },
  { id: 'profile_pro', title: 'Profile Pro', icon: '🎯', description: 'Completed your profile 100%', category: 'Profile', check: (stats) => stats.profileScore >= 100 },
  { id: 'community_builder', title: 'Community Builder', icon: '🏗️', description: 'Created a community', category: 'Community', check: (stats) => stats.communities >= 1 },
  { id: 'event_host', title: 'Event Host', icon: '🎪', description: 'Created an event', category: 'Events', check: (stats) => stats.events >= 1 },
  { id: 'mentor', title: 'Mentor', icon: '🧑‍🏫', description: 'Endorsed 10 skills', category: 'Social', check: (stats) => stats.endorsements >= 10 },
  { id: 'popular', title: 'Popular', icon: '🔥', description: 'Got 50 profile views', category: 'Social', check: (stats) => stats.profileViews >= 50 },
  { id: 'early_adopter', title: 'Early Adopter', icon: '🚀', description: 'Joined BizBase early', category: 'Special', check: () => true },
];

export const useAchievements = () => {
  const { user, profile } = useAuth();
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const checkBadges = useCallback(async () => {
    if (!user || !profile) return;
    setLoading(true);
    try {
      // Gather stats
      const [postsRes, connectionsRes, communitiesRes, eventsRes, endorsementsRes, viewsRes] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('connections').select('id', { count: 'exact', head: true }).or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`).eq('status', 'accepted'),
        supabase.from('communities').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('endorsements').select('id', { count: 'exact', head: true }).eq('endorser_id', user.id),
        supabase.from('profile_views').select('id', { count: 'exact', head: true }).eq('profile_user_id', user.id),
      ]);

      const stats = {
        posts: postsRes.count || 0,
        connections: connectionsRes.count || 0,
        communities: communitiesRes.count || 0,
        events: eventsRes.count || 0,
        endorsements: endorsementsRes.count || 0,
        profileViews: viewsRes.count || 0,
        bizcoins: profile.bizcoins || 0,
        profileScore: profile.profile_completion_score || 0,
      };

      const earned = BADGE_DEFINITIONS.filter(badge => badge.check(stats));
      setEarnedBadges(earned);
    } catch (err) {
      console.error('Badge check failed:', err);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    checkBadges();
  }, [checkBadges]);

  return { earnedBadges, allBadges: BADGE_DEFINITIONS, loading, refreshBadges: checkBadges };
};
