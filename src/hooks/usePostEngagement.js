import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePostEngagement = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const toggleLike = async (postId) => {
    setLoading(true);
    try {
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingLike) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
        // BizCoins awarded automatically by DB trigger
      }
    } catch (error) {
      console.error('Error toggling upvote:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (postId, content) => {
    setLoading(true);
    try {
      await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim()
        });
      // BizCoins awarded automatically by DB trigger
    } catch (error) {
      console.error('Error adding feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const sharePost = async (postId) => {
    setLoading(true);
    try {
      const { data: existingShare } = await supabase
        .from('post_shares')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingShare) {
        return false;
      }

      const { error } = await supabase
        .from('post_shares')
        .insert({ post_id: postId, user_id: user.id });

      if (error) throw error;

      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select(`
          id,
          profiles:user_id (
            username
          )
        `)
        .eq("id", postId)
        .single();

      if (postError || !postData) {
        console.error("Error fetching post for share:", postError);
        return false;
      }

      const username = postData.profiles?.username;

      if (!username) {
        console.error("Username not found for post");
        return false;
      }
      const postUrl = `${window.location.origin}/${username}/${postId}`;
      
      try {
        await navigator.clipboard.writeText(postUrl);
      } catch (clipboardError) {
        // clipboard not available
      }
      // BizCoins awarded automatically by DB trigger
    } catch (error) {
      console.error('Error sharing post:', error);
    } finally {
      setLoading(false);
    }
    return true;
  };

  const repostPost = async (postId, originalPost = null) => {
    if (!user) return false;
    setLoading(true);
    try {
      const { data: existingRepost } = await supabase
        .from('post_reposts')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingRepost) {
        await supabase
          .from('post_reposts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        await supabase
          .from('posts')
          .delete()
          .eq('repost_of_post_id', postId)
          .eq('user_id', user.id);
        return "removed";
      }

      let postData = originalPost;
      if (!postData) {
        const { data } = await supabase
          .from('posts')
          .select('*, profiles:user_id(full_name, avatar_url)')
          .eq('id', postId)
          .single();
        postData = data;
      }

      if (!postData) return false;
      await supabase
        .from('post_reposts')
        .insert({ post_id: postId, user_id: user.id });
      const repostContent = `🔄 Reposted from @${postData.profiles?.full_name || 'User'}\n\n${postData.content}`;
      await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: repostContent,
          image_url: postData.image_url,
          repost_of_post_id: postId,
          repost_of_user_id: postData.user_id
        });

      // BizCoins awarded automatically by DB trigger
      return "added";
    } catch (error) {
      console.error('Error reposting:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    toggleLike,
    addComment,
    sharePost,
    repostPost,
    loading
  };
};
