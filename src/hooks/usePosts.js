
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
// import { Post } from '@/hooks/usePosts';

export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      console.log('Fetching posts...');
      setLoading(true);

      // First get all posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        throw postsError;
      }

      console.log('Posts fetched:', postsData?.length || 0);

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = Array.from(new Set(postsData.map(post => post.user_id)));
      console.log('Fetching profiles for user IDs:', userIds);

      // Fetch profiles directly
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, current_position, company_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Create profiles map
      const profilesMap = new Map();
      if (profilesData) {
        profilesData.forEach((profile) => {
          profilesMap.set(profile.id, profile);
        });
      }

      // Check likes for current user
      let likedPostIds = new Set();
      if (user) {
        const postIds = postsData.map(post => post.id);
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        likedPostIds = new Set(likes?.map(like => like.post_id) || []);
      }

      // Combine data
      const enrichedPosts = postsData.map(post => ({
        ...post,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        shares_count: post.shares_count || 0,
        profiles: profilesMap.get(post.user_id) || { 
          full_name: 'Professional User',
          avatar_url: null,
          current_position: null,
          company_name: null
        },
        user_has_liked: likedPostIds.has(post.id)
      }));

      console.log('Final enriched posts:', enrichedPosts);
      setPosts(enrichedPosts);
    } catch (error) {
      console.error('Error in fetchPosts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (content, imageUrl, mediaType) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create posts",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Creating post with content:', content, 'imageUrl:', imageUrl);

      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            content,
            image_url: imageUrl || null
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating post in database:', error);
        throw error;
      }

      console.log('Post created successfully:', data);

      // Refresh posts
      await fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post: " + error.message,
        variant: "destructive"
      });
    }
  };

  const toggleLike = async (postId) => {
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

      await fetchPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      });
    }
  };

  const sharePost = async (postId) => {
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

      await fetchPosts();
    } catch (error) {
      console.error('Error sharing post:', error);
      toast({
        title: "Error",
        description: "Failed to share post",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const editPost = async (postId, newContent) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to edit posts",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .update({ 
          content: newContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .eq('user_id', user.id); // Ensure user can only edit their own posts

      if (error) throw error;

      await fetchPosts();
    } catch (error) {
      console.error('Error editing post:', error);
      throw error;
    }
  };

  const deletePost = async (postId) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete posts",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id); // Ensure user can only delete their own posts

      if (error) throw error;

      await fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  };

  return {
    posts,
    loading,
    createPost,
    editPost,
    deletePost,
    toggleLike,
    sharePost,
    refreshPosts: fetchPosts
  };
};
