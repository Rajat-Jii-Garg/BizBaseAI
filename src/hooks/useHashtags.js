
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useHashtags = () => {
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTrendingHashtags = async (limit = 10) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hashtags')
        .select('*')
        .order('usage_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setHashtags(data || []);
    } catch (error) {
      console.error('Error fetching hashtags:', error);
      toast({
        title: "Error",
        description: "Failed to load hashtags",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const searchHashtags = async (query) => {
    try {
      const { data, error } = await supabase
        .from('hashtags')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('usage_count', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching hashtags:', error);
      toast({
        title: "Error",
        description: "Failed to search hashtags",
        variant: "destructive"
      });
      return [];
    }
  };

  const getPostsByHashtag = async (hashtagName) => {
    try {
      const { data, error } = await supabase
        .from('post_hashtags')
        .select(`
          post_id,
          posts (
            *,
            profiles!posts_user_id_fkey (
              id,
              full_name,
              avatar_url,
              current_position
            )
          )
        `)
        .eq('hashtags.name', hashtagName)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching posts by hashtag:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive"
      });
      return [];
    }
  };

  useEffect(() => {
    fetchTrendingHashtags();
  }, []);

  return {
    hashtags,
    loading,
    fetchTrendingHashtags,
    searchHashtags,
    getPostsByHashtag,
    refreshHashtags: fetchTrendingHashtags
  };
};
