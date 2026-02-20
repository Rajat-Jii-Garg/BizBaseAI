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

  const [localLikes, setLocalLikes] = useState(likesCount || 0);
  const [localComments, setLocalComments] = useState(commentsCount || 0);
  const [localShares, setLocalShares] = useState(sharesCount || 0);
  const [localReposts, setLocalReposts] = useState(repostsCount || 0);
  const [localUserHasLiked, setLocalUserHasLiked] = useState(userHasLiked);
  const [localUserHasReposted, setLocalUserHasReposted] = useState(userHasReposted);
  const [showShareModal, setShowShareModal] = useState(false);

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

  useEffect(() => {
    if (showCommentInput) {
      fetchComments();
    }
  }, [showCommentInput, fetchComments]);

  useEffect(() => {
    setLocalLikes(likesCount || 0);
    setLocalComments(commentsCount || 0);
    setLocalShares(sharesCount || 0);
    setLocalReposts(repostsCount || 0);
    setLocalUserHasLiked(userHasLiked);
    setLocalUserHasReposted(userHasReposted);
  }, [likesCount, commentsCount, sharesCount, repostsCount, userHasLiked, userHasReposted]);

  const handleUpvote = async () => {
    const wasLiked = localUserHasLiked;
    await toggleLike(postId);
    if (wasLiked) {
      setLocalLikes(prev => (prev > 0 ? prev - 1 : 0));
    } else {
      setLocalLikes(prev => prev + 1);
    }
    setLocalUserHasLiked(!wasLiked);
  };

  const handleFeedback = async () => {
    if (commentText.trim()) {
      await addComment(postId, commentText);
      setCommentText('');
      await fetchComments();
      setLocalComments(prev => prev + 1);
    }
  };

  const handleShare = async () => {
    setShowShareModal(true);
    const result = await sharePost(postId);
    if (result !== false) {
      setLocalShares(prev => prev + 1);
    }
  };

  const handleRepost = async () => {
    const result = await repostPost(postId, originalPost);
    if (result === "added") {
      setLocalReposts(prev => prev + 1);
      setLocalUserHasReposted(true);
    }
    if (result === "removed") {
      setLocalReposts(prev => (prev > 0 ? prev - 1 : 0));
      setLocalUserHasReposted(false);
    }
  };

  const handleCommentUpdate = () => {
    fetchComments();
  };

  const visibleComments = showAllComments ? comments : comments.slice(0, MAX_VISIBLE_COMMENTS);
  const hasMoreComments = comments.length > MAX_VISIBLE_COMMENTS;

  return (
    <div className="border-t border-border/50 pt-2 sm:pt-3">
      {/* Stats Row - mobile: left (upvotes, feedback) right (reposts, shares) */}
      <div className="flex items-center justify-between mb-1 sm:mb-2 text-[11px] sm:text-xs text-muted-foreground">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1">
            <ArrowBigUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {localLikes} <span className="hidden sm:inline">upvotes</span>
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {localComments} <span className="hidden sm:inline">feedback</span>
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1">
            <Repeat2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {localReposts} <span className="hidden sm:inline">reposts</span>
          </span>
          <span className="flex items-center gap-1">
            <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {localShares} <span className="hidden sm:inline">shares</span>
          </span>
        </div>
      </div>

      {/* Action Buttons Row - mobile: icon only, centered, equal space */}
      <div className="flex items-center justify-between border-t border-border/50 mt-1 pt-1">
        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 h-8 sm:h-9 hover:bg-muted/50 ${
            localUserHasLiked ? 'text-blue-600' : 'text-muted-foreground'
          }`}
          onClick={handleUpvote}
          disabled={loading}
        >
          <ArrowBigUp className={`w-4 h-4 sm:w-5 sm:h-5 ${localUserHasLiked ? 'fill-current' : ''}`} />
          <span className="text-xs font-medium hidden sm:inline sm:ml-1">Upvote</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 h-8 sm:h-9 hover:bg-muted/50 ${
            showCommentInput ? 'text-blue-600 bg-blue-50/50' : 'text-muted-foreground'
          }`}
          onClick={() => setShowCommentInput(!showCommentInput)}
        >
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs font-medium hidden sm:inline sm:ml-1">Feedback</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 h-8 sm:h-9 hover:bg-muted/50 ${
            localUserHasReposted ? 'text-green-600' : 'text-muted-foreground'
          }`}
          onClick={handleRepost}
          disabled={loading}
        >
          <Repeat2 className={`w-4 h-4 sm:w-5 sm:h-5 ${localUserHasReposted ? 'text-green-600' : ''}`} />
          <span className="text-xs font-medium hidden sm:inline sm:ml-1">{localUserHasReposted ? 'Reposted' : 'Repost'}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-8 sm:h-9 hover:bg-muted/50 text-muted-foreground"
          onClick={handleShare}
          disabled={loading}
        >
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs font-medium hidden sm:inline sm:ml-1">Share</span>
        </Button>
      </div>

      {/* Comments Section */}
      {showCommentInput && (
        <div className="mt-3 space-y-3">
          {/* Comment Input */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 ring-1 ring-border/30">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-50 to-purple-50 text-blue-700 text-[10px] sm:text-xs font-semibold">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex items-center gap-1.5 bg-muted/40 rounded-full px-3 py-1 sm:px-3.5 sm:py-1.5 border border-border/50 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Input
                placeholder="Write your feedback..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="border-0 bg-transparent h-7 sm:h-8 text-xs sm:text-sm p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
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
                className="h-6 w-6 sm:h-7 sm:w-7 p-0 shrink-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full disabled:opacity-40"
                onClick={handleFeedback}
                disabled={!commentText.trim() || loading}
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>

          {/* Comments List */}
          {loadingComments ? (
            <div className="flex items-center justify-center py-3">
              <div className="h-5 w-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              <div
                className={`space-y-2 sm:space-y-3 ${
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

              {hasMoreComments && (
                <button
                  onClick={() => setShowAllComments(!showAllComments)}
                  className="text-[10px] sm:text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors pl-9 sm:pl-10"
                >
                  {showAllComments
                    ? 'Show less'
                    : `View ${comments.length - MAX_VISIBLE_COMMENTS} more feedback${comments.length - MAX_VISIBLE_COMMENTS > 1 ? 's' : ''}`
                  }
                </button>
              )}
            </div>
          ) : (
            <p className="text-[10px] sm:text-xs text-muted-foreground text-center py-2">
              No feedback yet. Be the first to share your thoughts!
            </p>
          )}
        </div>
      )}

      {/* Share Popup Screen */}
      {showShareModal && (
      <div className="fixed inset-0 bg-black/40 flex items-end z-50">
        <div className="bg-white w-full rounded-t-2xl p-4 space-y-4 animate-slide-up">
          <h3 className="text-sm font-semibold text-center">Share Post</h3>

          <div className="flex justify-around text-sm">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setShowShareModal(false);
              }}
              className="flex flex-col items-center"
            >
              🔗
              <span>Copy Link</span>
            </button>

            <button
              onClick={() => {
                window.open(`https://wa.me/?text=${window.location.href}`);
                setShowShareModal(false);
              }}
              className="flex flex-col items-center"
            >
              🟢
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => {
                window.open(`https://twitter.com/intent/tweet?url=${window.location.href}`);
                setShowShareModal(false);
              }}
              className="flex flex-col items-center"
            >
              🐦
              <span>Twitter</span>
            </button>
          </div>

          <Button
            variant="ghost"
            onClick={() => setShowShareModal(false)}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </div>
    )}
    </div>
  );
};

export default PostEngagementActions;
