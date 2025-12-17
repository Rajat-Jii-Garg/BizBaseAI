import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const usePostEngagement = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const toggleLike = async (postId) => {
    if (!user) {
      toast.error("Authentication Required", { description: "Please log in to upvote posts" });
      return;
    }

    setLoading(true);
    try {
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        toast("Upvote Removed", { description: "You've removed your upvote from this post" });
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
        
        toast("Post Upvoted", { description: "You've upvoted this post" });
      }
    } catch (error) {
      console.error('Error toggling upvote:', error);
      toast.error("Error", { description: "Failed to update upvote status" });
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (postId, content) => {
    if (!user) {
      toast.error("Authentication Required", { description: "Please log in to give feedback" });
      return;
    }

    if (!content.trim()) {
      toast.error("Feedback Required", { description: "Please enter your feedback" });
      return;
    }

    setLoading(true);
    try {
      await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim()
        });

      toast("Feedback Added", { description: "Your feedback has been posted" });
    } catch (error) {
      console.error('Error adding feedback:', error);
      toast.error("Error", { description: "Failed to add feedback" });
    } finally {
      setLoading(false);
    }
  };

  const sharePost = async (postId) => {
    if (!user) {
      toast.error("Authentication Required", { description: "Please log in to share posts" });
      return;
    }

    setLoading(true);
    try {
      const { data: existingShare } = await supabase
        .from('post_shares')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingShare) {
        toast("Already Shared", { description: "You have already shared this post" });
        return;
      }

      const { error } = await supabase
        .from('post_shares')
        .insert({ post_id: postId, user_id: user.id });

      if (error) throw error;

      const postUrl = `${window.location.origin}/post/${postId}`;
      try {
        await navigator.clipboard.writeText(postUrl);
        toast("Post Shared", { description: "Post link copied to clipboard and shared to your network" });
      } catch (clipboardError) {
        toast("Post Shared", { description: "Post has been shared to your network" });
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      toast.error("Error", { description: "Failed to share post" });
    } finally {
      setLoading(false);
    }
  };

  const repostPost = async (postId, originalPost = null) => {
    if (!user) {
      toast.error("Authentication Required", { description: "Please log in to repost" });
      return;
    }

    setLoading(true);
    try {
      // Check if already reposted
      const { data: existingRepost } = await supabase
        .from('post_reposts')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingRepost) {
        toast("Already Reposted", { description: "You have already reposted this post" });
        return;
      }

      // Get the original post data if not provided
      let postData = originalPost;
      if (!postData) {
        const { data } = await supabase
          .from('posts')
          .select('*, profiles:user_id(full_name, avatar_url)')
          .eq('id', postId)
          .single();
        postData = data;
      }

      if (!postData) {
        toast.error("Error", { description: "Post not found" });
        return;
      }

      // Create repost entry in tracking table
      const { error: repostError } = await supabase
        .from('post_reposts')
        .insert({ post_id: postId, user_id: user.id });

      if (repostError) throw repostError;

      // Create new post as a repost (appears on user's profile)
      const repostContent = `🔄 Reposted from @${postData.profiles?.full_name || 'User'}\n\n${postData.content}`;
      
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: repostContent,
          image_url: postData.image_url,
          repost_of_post_id: postId,
          repost_of_user_id: postData.user_id
        });

      if (postError) throw postError;

      toast.success("Reposted!", { description: "Post has been reposted to your profile" });
    } catch (error) {
      console.error('Error reposting:', error);
      toast.error("Error", { description: "Failed to repost" });
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
