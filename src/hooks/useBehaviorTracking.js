import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useBehaviorTracking = () => {
  const { user } = useAuth();
  const viewStartTimes = useRef(new Map());
  const trackedViews = useRef(new Set());

  // Track when a post comes into view
  const trackPostView = useCallback(async (postId) => {
    if (!user || trackedViews.current.has(postId)) return;
    
    trackedViews.current.add(postId);
    viewStartTimes.current.set(postId, Date.now());

    try {
      await supabase
        .from('user_content_interactions')
        .upsert({
          user_id: user.id,
          post_id: postId,
          interaction_type: 'view',
          view_duration_seconds: 0
        }, {
          onConflict: 'user_id,post_id,interaction_type'
        });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }, [user]);

  // Track when user scrolls away from a post (end view)
  const trackPostViewEnd = useCallback(async (postId) => {
    if (!user || !viewStartTimes.current.has(postId)) return;

    const startTime = viewStartTimes.current.get(postId);
    const viewDuration = Math.floor((Date.now() - startTime) / 1000);
    viewStartTimes.current.delete(postId);

    // Only track if viewed for more than 1 second
    if (viewDuration < 1) return;

    try {
      await supabase
        .from('user_content_interactions')
        .upsert({
          user_id: user.id,
          post_id: postId,
          interaction_type: 'view',
          view_duration_seconds: viewDuration
        }, {
          onConflict: 'user_id,post_id,interaction_type',
          ignoreDuplicates: false
        });

      console.log(`Tracked view duration: ${viewDuration}s for post ${postId}`);
    } catch (error) {
      console.error('Error tracking view duration:', error);
    }
  }, [user]);

  // Track engagement actions (like, comment, share, repost)
  const trackEngagement = useCallback(async (postId, interactionType) => {
    if (!user) return;

    try {
      await supabase
        .from('user_content_interactions')
        .upsert({
          user_id: user.id,
          post_id: postId,
          interaction_type: interactionType
        }, {
          onConflict: 'user_id,post_id,interaction_type'
        });

      console.log(`Tracked ${interactionType} for post ${postId}`);
    } catch (error) {
      console.error('Error tracking engagement:', error);
    }
  }, [user]);

  // Track post click/expand
  const trackPostClick = useCallback(async (postId) => {
    if (!user) return;

    try {
      await supabase
        .from('user_content_interactions')
        .upsert({
          user_id: user.id,
          post_id: postId,
          interaction_type: 'click'
        }, {
          onConflict: 'user_id,post_id,interaction_type'
        });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  }, [user]);

  // Track post save/bookmark
  const trackPostSave = useCallback(async (postId) => {
    if (!user) return;

    try {
      await supabase
        .from('user_content_interactions')
        .upsert({
          user_id: user.id,
          post_id: postId,
          interaction_type: 'save'
        }, {
          onConflict: 'user_id,post_id,interaction_type'
        });
    } catch (error) {
      console.error('Error tracking save:', error);
    }
  }, [user]);

  // Cleanup function to track remaining views on unmount
  useEffect(() => {
    return () => {
      // Track any remaining views when component unmounts
      viewStartTimes.current.forEach((startTime, postId) => {
        const viewDuration = Math.floor((Date.now() - startTime) / 1000);
        if (viewDuration >= 1 && user) {
          // Fire and forget - don't await
          supabase
            .from('user_content_interactions')
            .upsert({
              user_id: user.id,
              post_id: postId,
              interaction_type: 'view',
              view_duration_seconds: viewDuration
            }, {
              onConflict: 'user_id,post_id,interaction_type'
            })
            .then(() => {})
            .catch(() => {});
        }
      });
    };
  }, [user]);

  return {
    trackPostView,
    trackPostViewEnd,
    trackEngagement,
    trackPostClick,
    trackPostSave
  };
};
