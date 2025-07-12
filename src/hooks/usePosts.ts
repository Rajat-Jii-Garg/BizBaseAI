
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  profiles?: {
    full_name: string;
    avatar_url?: string;
    current_position?: string;
    company_name?: string;
  };
  user_has_liked?: boolean;
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      // First get posts without profile joins
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!postsData) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // Get unique user IDs to fetch profiles
      const userIds = Array.from(new Set(postsData.map(post => post.user_id)));

      // Fetch profiles for these users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      // Create a map of profiles
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      // Check which posts current user has liked
      let likedPostIds = new Set<string>();
      if (user && postsData.length > 0) {
        const postIds = postsData.map(post => post.id);
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        likedPostIds = new Set(likes?.map(like => like.post_id) || []);
      }

      // Combine posts with profile data and like status
      const postsWithProfiles = postsData.map(post => ({
        ...post,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        shares_count: post.shares_count || 0,
        profiles: profilesMap.get(post.user_id) || { full_name: 'Unknown User' },
        user_has_liked: likedPostIds.has(post.id)
      }));

      setPosts(postsWithProfiles);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (content: string, imageUrl?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            content,
            image_url: imageUrl
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post created successfully!"
      });

      fetchPosts(); // Refresh posts
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.user_has_liked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert([
            {
              user_id: user.id,
              post_id: postId
            }
          ]);

        if (error) throw error;
      }

      fetchPosts(); // Refresh posts
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      });
    }
  };

  const sharePost = async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('post_shares')
        .insert([
          {
            user_id: user.id,
            post_id: postId
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post shared successfully!"
      });

      fetchPosts(); // Refresh posts
    } catch (error: any) {
      console.error('Error sharing post:', error);
      toast({
        title: "Error",
        description: "Failed to share post",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  return {
    posts,
    loading,
    createPost,
    toggleLike,
    sharePost,
    refreshPosts: fetchPosts
  };
};
