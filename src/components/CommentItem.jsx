import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThumbsUp, MessageSquare, Send, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CommentItem = ({ comment, postId, onUpdate, isReply = false }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleReplySubmit = async () => {
    if (!user || !replyText.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: replyText.trim()
        });

      if (error) throw error;

      setReplyText('');
      setShowReplyInput(false);
      onUpdate();
      toast.success('Reply posted');
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`group ${isReply ? 'ml-10' : ''}`}>
      <div className="flex gap-2.5">
        {/* Avatar */}
        <Avatar
          className="h-8 w-8 shrink-0 cursor-pointer ring-1 ring-gray-100 hover:ring-blue-200 transition-all"
          onClick={() => navigate(`/profile/${comment.user_id}`)}
        >
          <AvatarImage src={comment.profiles?.avatar_url} />
          <AvatarFallback className="bg-gradient-to-br from-blue-50 to-purple-50 text-blue-700 text-xs font-semibold">
            {comment.profiles?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Comment Bubble */}
          <div className="bg-muted/50 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 inline-block max-w-full">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="font-semibold text-xs text-foreground cursor-pointer hover:text-blue-600 transition-colors truncate"
                onClick={() => navigate(`/profile/${comment.user_id}`)}
              >
                {comment.profiles?.full_name || 'User'}
              </span>
              {comment.profiles?.current_position && (
                <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                  {comment.profiles.current_position}
                </span>
              )}
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed break-words whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          {/* Comment Actions */}
          <div className="flex items-center gap-2 mt-0.5 sm:mt-1 pl-1">
            <span className="text-[11px] text-muted-foreground">
              {formatTimeAgo(comment.created_at)}
            </span>
            <button
              onClick={handleLike}
              className={`text-[11px] font-semibold py-0.5 transition-colors ${
                isLiked
                  ? 'text-blue-600'
                  : 'text-muted-foreground hover:text-blue-600'
              }`}
            >
              Like{likesCount > 0 ? ` · ${likesCount}` : ''}
            </button>
            {!isReply && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="text-[11px] font-semibold py-0.5 text-muted-foreground hover:text-blue-600 transition-colors"
              >
                Reply
              </button>
            )}
          </div>

          {/* Reply Input */}
          {showReplyInput && (
            <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-[10px] bg-blue-50 text-blue-700">
                  {profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex items-center gap-1 bg-muted/40 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 border border-border/50 focus-within:border-blue-300 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
                <Input
                  placeholder={`Reply to ${comment.profiles?.full_name || 'User'}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="border-0 bg-transparent h-7 text-sm p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleReplySubmit();
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 shrink-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                  onClick={handleReplySubmit}
                  disabled={!replyText.trim() || submitting}
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
