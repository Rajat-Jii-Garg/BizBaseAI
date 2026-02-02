import React, { useRef, useEffect } from 'react';
import EnhancedPostCard from './EnhancedPostCard';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';

const TrackedPostCard = ({ post, onEngagementUpdate, onEdit, onDelete }) => {
  const cardRef = useRef(null);
  const { trackPostView, trackPostViewEnd, trackEngagement, trackPostClick } = useBehaviorTracking();
  const hasTrackedView = useRef(false);

  // Set up intersection observer to track views
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedView.current) {
            // Post is now visible
            trackPostView(post.id);
            hasTrackedView.current = true;
          } else if (!entry.isIntersecting && hasTrackedView.current) {
            // Post is no longer visible - track end of view
            trackPostViewEnd(post.id);
          }
        });
      },
      {
        threshold: 0.5, // 50% of the post must be visible
        rootMargin: '0px'
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
      // Track view end on unmount
      if (hasTrackedView.current) {
        trackPostViewEnd(post.id);
      }
    };
  }, [post.id, trackPostView, trackPostViewEnd]);

  // Wrap engagement update to also track behavior
  const handleEngagementUpdate = async (type) => {
    if (type) {
      await trackEngagement(post.id, type);
    }
    if (onEngagementUpdate) {
      onEngagementUpdate();
    }
  };

  // Track clicks on the card
  const handleCardClick = () => {
    trackPostClick(post.id);
  };

  return (
    <div ref={cardRef} onClick={handleCardClick}>
      <EnhancedPostCard
        post={post}
        onEngagementUpdate={handleEngagementUpdate}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default TrackedPostCard;
