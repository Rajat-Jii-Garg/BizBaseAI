import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const usePersonalizedFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;
  const lastFetchTime = useRef(null);
  const isFetching = useRef(false);

  // Fetch personalized feed from edge function
  const fetchPersonalizedFeed = useCallback(async (isRefresh = false, currentOffset = 0) => {
    if (!user || isFetching.current) return;
    
    isFetching.current = true;
    
    try {
      if (isRefresh) {
        setRefreshing(true);
        currentOffset = 0;
      } else if (currentOffset === 0) {
        setLoading(true);
      }

      console.log('Fetching personalized feed...', { isRefresh, currentOffset });

      const { data, error } = await supabase.functions.invoke('personalized-feed', {
        body: { limit, offset: currentOffset }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data?.posts) {
        if (isRefresh || currentOffset === 0) {
          setPosts(data.posts);
          setOffset(limit);
        } else {
          setPosts(prev => [...prev, ...data.posts]);
          setOffset(prev => prev + limit);
        }
        setHasMore(data.hasMore);
        lastFetchTime.current = Date.now();
        
        console.log(`Loaded ${data.posts.length} personalized posts`);
      }
    } catch (error) {
      console.error('Error fetching personalized feed:', error);
      // Fallback to simple chronological feed
      await fetchFallbackFeed(isRefresh, currentOffset);
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetching.current = false;
    }
  }, [user, limit]);

  // Fallback to simple feed if edge function fails
  const fetchFallbackFeed = async (isRefresh = false, currentOffset = 0) => {
    try {
      console.log('Using fallback feed...');
      
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + limit - 1);

      if (postsError) throw postsError;

      if (!postsData || postsData.length === 0) {
        if (isRefresh || currentOffset === 0) {
          setPosts([]);
        }
        setHasMore(false);
        return;
      }

      // Get profiles
      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, current_position, company_name, username')
        .in('id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Get user's likes and reposts
      const postIds = postsData.map(p => p.id);
      
      const { data: likes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      const likedPosts = new Set(likes?.map(l => l.post_id) || []);

      const { data: reposts } = await supabase
        .from('post_reposts')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      const repostedPosts = new Set(reposts?.map(r => r.post_id) || []);

      const enrichedPosts = postsData.map(post => ({
        ...post,
        profiles: profilesMap.get(post.user_id) || {
          full_name: 'Unknown User',
          avatar_url: null,
          current_position: null,
          company_name: null
        },
        user_has_liked: likedPosts.has(post.id),
        user_has_reposted: repostedPosts.has(post.id),
        feed_reasons: []
      }));

      if (isRefresh || currentOffset === 0) {
        setPosts(enrichedPosts);
        setOffset(limit);
      } else {
        setPosts(prev => [...prev, ...enrichedPosts]);
        setOffset(prev => prev + limit);
      }
      setHasMore(postsData.length === limit);
    } catch (error) {
      console.error('Fallback feed error:', error);
      toast.error('Failed to load feed');
    }
  };

  // Refresh feed
  const refreshFeed = useCallback(async () => {
    await fetchPersonalizedFeed(true, 0);
    toast.success('Feed refreshed!', { 
      description: 'Showing latest personalized content'
    });
  }, [fetchPersonalizedFeed]);

  // Load more posts
  const loadMore = useCallback(async () => {
    if (!hasMore || loading || refreshing) return;
    await fetchPersonalizedFeed(false, offset);
  }, [fetchPersonalizedFeed, hasMore, loading, refreshing, offset]);

  // Initial load
  useEffect(() => {
    if (user) {
      fetchPersonalizedFeed(true, 0);
    }
  }, [user]);

  // Set up real-time subscription for new posts
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('feed-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('New post detected:', payload);
          // Show notification for new content
          if (payload.new.user_id !== user.id) {
            toast('New posts available', {
              description: 'Pull to refresh for latest content',
              action: {
                label: 'Refresh',
                onClick: () => refreshFeed()
              }
            });
          } else {
            // Add user's own post immediately
            fetchPersonalizedFeed(true, 0);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshFeed, fetchPersonalizedFeed]);

  return {
    posts,
    loading,
    refreshing,
    hasMore,
    refreshFeed,
    loadMore,
    refetch: () => fetchPersonalizedFeed(true, 0)
  };
};
