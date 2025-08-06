
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const usePostEngagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const toggleLike = async (postId) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like posts",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        toast({
          title: "Post Unliked",
          description: "You've removed your like from this post"
        });
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
        
        toast({
          title: "Post Liked",
          description: "You've liked this post"
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (postId, content) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to comment",
        variant: "destructive"
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Comment Required",
        description: "Please enter a comment",
        variant: "destructive"
      });
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

      toast({
        title: "Comment Added",
        description: "Your comment has been posted"
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sharePost = async (postId) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to share posts",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Check if already shared
      const { data: existingShare } = await supabase
        .from('post_shares')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingShare) {
        toast({
          title: "Already Shared",
          description: "You have already shared this post"
        });
        return;
      }

      // Add share record
      const { error } = await supabase
        .from('post_shares')
        .insert({ post_id: postId, user_id: user.id });

      if (error) throw error;

      // Copy to clipboard
      const postUrl = `${window.location.origin}/post/${postId}`;
      try {
        await navigator.clipboard.writeText(postUrl);
        toast({
          title: "Post Shared",
          description: "Post link copied to clipboard and shared to your network"
        });
      } catch (clipboardError) {
        toast({
          title: "Post Shared",
          description: "Post has been shared to your network"
        });
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      toast({
        title: "Error",
        description: "Failed to share post",
        variant: "destructive"
      });
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
