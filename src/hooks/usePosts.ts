
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
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!inner(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check which posts current user has liked
      if (user && data) {
        const postIds = data.map(post => post.id);
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        const likedPostIds = new Set(likes?.map(like => like.post_id) || []);
        
        const postsWithLikes = data.map(post => ({
          ...post,
          user_has_liked: likedPostIds.has(post.id)
        }));

        setPosts(postsWithLikes);
      } else {
        setPosts(data || []);
      }
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
