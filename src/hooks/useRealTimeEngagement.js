
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useRealTimeEngagement = (onUpdate) => {
  useEffect(() => {
    // Subscribe to real-time changes for posts engagement
    const likesChannel = supabase
      .channel('post-likes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes'
        },
        () => {
          // Update with 0.11 second delay for smooth UX
          setTimeout(onUpdate, 110);
        }
      )
      .subscribe();

    const commentsChannel = supabase
      .channel('post-comments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_comments'
        },
        () => {
          setTimeout(onUpdate, 110);
        }
      )
      .subscribe();

    const sharesChannel = supabase
      .channel('post-shares-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_shares'
        },
        () => {
          setTimeout(onUpdate, 110);
        }
      )
      .subscribe();

    const postsChannel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          setTimeout(onUpdate, 110);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(sharesChannel);
      supabase.removeChannel(postsChannel);
    };
  }, [onUpdate]);
};
