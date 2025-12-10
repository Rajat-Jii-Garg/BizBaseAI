import React from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeEngagement = (onUpdate) => {
  React.useEffect(() => {
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
