import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const usePostEngagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const toggleLike = async (postId) => {
    if (!user) {
      toast.error("Authentication Required", { description: "Please log in to like posts" });
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
        
        toast("Post Unliked", { description: "You've removed your like from this post" });
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
        
        toast("Post Liked", { description: "You've liked this post" });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error("Error", { description: "Failed to update like status" });
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (postId, content) => {
    if (!user) {
      toast.error("Authentication Required", { description: "Please log in to comment" });
      return;
    }

    if (!content.trim()) {
      toast.error("Comment Required", { description: "Please enter a comment" });
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

      toast("Comment Added", { description: "Your comment has been posted" });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error("Error", { description: "Failed to add comment" });
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

  return {
    toggleLike,
    addComment,
    sharePost,
    loading
  };
};
