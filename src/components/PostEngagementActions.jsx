import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowBigUp, MessageSquare, Share2, Send, Repeat2 } from 'lucide-react';
import { usePostEngagement } from '@/hooks/usePostEngagement';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import CommentItem from './CommentItem';

const MAX_VISIBLE_COMMENTS = 3;

const PostEngagementActions = ({
  postId,
  likesCount,
  commentsCount,
  sharesCount,
  repostsCount = 0,
  userHasLiked,
  userHasReposted = false,
  onEngagementUpdate,
  originalPost = null
}) => {
  const { toggleLike, addComment, sharePost, repostPost, loading } = usePostEngagement();
  const { user, profile } = useAuth();
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = [...new Set(data?.map(c => c.user_id) || [])];
      if (userIds.length === 0) {
        setComments([]);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, current_position')
        .in('id', userIds);

      const commentsWithProfiles = data?.map(comment => ({
        ...comment,
        profiles: profiles?.find(p => p.id === comment.user_id)
      })) || [];

      setComments(commentsWithProfiles);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  }, [postId]);

  // Fetch comments when section opens
  useEffect(() => {
    if (showCommentInput) {
      fetchComments();
    }
  }, [showCommentInput, fetchComments]);

  const handleUpvote = async () => {
    await toggleLike(postId);
    onEngagementUpdate();
  };

  const handleFeedback = async () => {
    if (commentText.trim()) {
      await addComment(postId, commentText);
      setCommentText('');
      // Refetch comments to show the new one
      await fetchComments();
      onEngagementUpdate();
    }
  };

  const handleShare = async () => {
    await sharePost(postId);
    onEngagementUpdate();
  };

  const handleRepost = async () => {
    await repostPost(postId, originalPost);
    onEngagementUpdate();
  };

  const handleCommentUpdate = () => {
    fetchComments();
    onEngagementUpdate();
  };

  const visibleComments = showAllComments ? comments : comments.slice(0, MAX_VISIBLE_COMMENTS);
  const hasMoreComments = comments.length > MAX_VISIBLE_COMMENTS;

  return (
    <div className="border-t border-border/50 pt-2 sm:pt-3">
      {/* Stats Row */}
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <div className="flex items-center gap-3 text-[11px] sm:text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ArrowBigUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {likesCount} upvotes
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {commentsCount} feedback
          </span>
          <span className="flex items-center gap-1">
            <Repeat2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {repostsCount} reposts
          </span>
          <span className="flex items-center gap-1">
            <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {sharesCount} shares
          </span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center justify-between border-t border-border/50 mt-1 pt-1">
        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 h-8 sm:h-9 hover:bg-muted/50 ${
            userHasLiked ? 'text-blue-600' : 'text-muted-foreground'
          }`}
          onClick={handleUpvote}
          disabled={loading}
        >
          <ArrowBigUp className={`w-4 h-4 sm:w-5 sm:h-5 mr-1 ${userHasLiked ? 'fill-current' : ''}`} />
          <span className="text-xs font-medium">Upvote</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 h-8 sm:h-9 hover:bg-muted/50 ${
            showCommentInput ? 'text-blue-600 bg-blue-50/50' : 'text-muted-foreground'
          }`}
          onClick={() => setShowCommentInput(!showCommentInput)}
        >
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
          <span className="text-xs font-medium">Feedback</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 h-8 sm:h-9 hover:bg-muted/50 ${
            userHasReposted ? 'text-green-600' : 'text-muted-foreground'
          }`}
          onClick={handleRepost}
          disabled={loading || userHasReposted}
        >
          <Repeat2 className={`w-4 h-4 sm:w-5 sm:h-5 mr-1 ${userHasReposted ? 'text-green-600' : ''}`} />
          <span className="text-xs font-medium">{userHasReposted ? 'Reposted' : 'Repost'}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-8 sm:h-9 hover:bg-muted/50 text-muted-foreground"
          onClick={handleShare}
          disabled={loading}
        >
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
          <span className="text-xs font-medium">Share</span>
        </Button>
      </div>

      {/* Comments Section */}
      {showCommentInput && (
        <div className="mt-3 space-y-3">
          {/* Comment Input */}
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 shrink-0 ring-1 ring-border/30">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-50 to-purple-50 text-blue-700 text-xs font-semibold">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex items-center gap-1.5 bg-muted/40 rounded-full px-3.5 py-1.5 border border-border/50 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Input
                placeholder="Write your feedback..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="border-0 bg-transparent h-8 text-sm p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleFeedback();
                  }
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 shrink-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full disabled:opacity-40"
                onClick={handleFeedback}
                disabled={!commentText.trim() || loading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Comments List */}
          {loadingComments ? (
            <div className="flex items-center justify-center py-3">
              <div className="h-5 w-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3 sm:space-y-3">
              {/* Scrollable container with hidden scrollbar */}
              <div
                className={`space-y-3 ${
                  showAllComments && comments.length > MAX_VISIBLE_COMMENTS
                    ? 'max-h-[260px] sm:max-h-[320px] overflow-y-auto scrollbar-hide'
                    : ''
                }`}
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {visibleComments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    postId={postId}
                    onUpdate={handleCommentUpdate}
                  />
                ))}
              </div>

              {/* Show more / Show less */}
              {hasMoreComments && (
                <button
                  onClick={() => setShowAllComments(!showAllComments)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors pl-10"
                >
                  {showAllComments
                    ? 'Show less'
                    : `View ${comments.length - MAX_VISIBLE_COMMENTS} more feedback${comments.length - MAX_VISIBLE_COMMENTS > 1 ? 's' : ''}`
                  }
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              No feedback yet. Be the first to share your thoughts!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PostEngagementActions;
