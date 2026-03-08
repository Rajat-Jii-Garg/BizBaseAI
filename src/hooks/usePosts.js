import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPosts = async () => {
    try {
      console.log('Fetching posts...');
      setLoading(true);

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

      const userIds = Array.from(new Set(postsData.map(post => post.user_id)));
      console.log('Fetching profiles for user IDs:', userIds);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, current_position, company_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      const profilesMap = new Map();
      if (profilesData) {
        profilesData.forEach((profile) => {
          profilesMap.set(profile.id, profile);
        });
      }

      let likedPostIds = new Set();
      let repostedPostIds = new Set();
      let connectedUserIds = new Set();
      if (user) {
        const postIds = postsData.map(post => post.id);
        
        // Check likes
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        likedPostIds = new Set(likes?.map(like => like.post_id) || []);

        // Check reposts
        const { data: reposts } = await supabase
          .from('post_reposts')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        repostedPostIds = new Set(reposts?.map(repost => repost.post_id) || []);

        // Get connected user IDs
        const { data: connections } = await supabase
          .from('connections')
          .select('requester_id, addressee_id')
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
          .eq('status', 'accepted');

        connections?.forEach(conn => {
          if (conn.requester_id !== user.id) connectedUserIds.add(conn.requester_id);
          if (conn.addressee_id !== user.id) connectedUserIds.add(conn.addressee_id);
        });
      }

      const enrichedPosts = postsData.map(post => ({
        ...post,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        shares_count: post.shares_count || 0,
        reposts_count: post.reposts_count || 0,
        profiles: profilesMap.get(post.user_id) || { 
          full_name: 'Professional User',
          avatar_url: null,
          current_position: null,
          company_name: null
        },
        user_has_liked: likedPostIds.has(post.id),
        user_has_reposted: repostedPostIds.has(post.id),
        is_connected: connectedUserIds.has(post.user_id)
      }));

      console.log('Final enriched posts:', enrichedPosts);
      setPosts(enrichedPosts);
    } catch (error) {
      console.error('Error in fetchPosts:', error);
      toast.error("Error", { description: "Failed to load posts" });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (content, imageUrl, mediaType) => {
    if (!user) {
      toast.error("Error", { description: "You must be logged in to create posts" });
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

      if (data && content) {
        try {
          const { error: hashtagError } = await supabase.rpc('process_post_hashtags', {
            post_id: data.id,
            content: content
          });
          
          if (hashtagError) {
            console.error('Error processing hashtags:', hashtagError);
          }
        } catch (hashtagError) {
          console.error('Error calling hashtag function:', hashtagError);
        }
      }

      awardCoins('post');
      await fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error("Error", { description: "Failed to create post: " + error.message });
    }
  };

  const toggleLike = async (postId) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.user_has_liked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) throw error;
      } else {
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
      toast.error("Error", { description: "Failed to update like" });
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

      toast.success("Success", { description: "Post shared successfully!" });
      await fetchPosts();
    } catch (error) {
      console.error('Error sharing post:', error);
      toast.error("Error", { description: "Failed to share post" });
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const editPost = async (postId, newContent) => {
    if (!user) {
      toast.error("Error", { description: "You must be logged in to edit posts" });
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
        .eq('user_id', user.id);

      if (error) throw error;

      if (newContent) {
        try {
          const { error: hashtagError } = await supabase.rpc('process_post_hashtags', {
            post_id: postId,
            content: newContent
          });
          
          if (hashtagError) {
            console.error('Error processing hashtags:', hashtagError);
          }
        } catch (hashtagError) {
          console.error('Error calling hashtag function:', hashtagError);
        }
      }

      await fetchPosts();
    } catch (error) {
      console.error('Error editing post:', error);
      throw error;
    }
  };

  const deletePost = async (postId) => {
    if (!user) {
      toast.error("Error", { description: "You must be logged in to delete posts" });
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

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
