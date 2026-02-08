import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThumbsUp, MessageSquare, Send, MoreHorizontal, Edit, Trash2, Flag, Copy } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  const isCommentOwner = user?.id === comment.user_id;

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

  const handleEditComment = async () => {
    if (!user || !editText.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('post_comments')
        .update({ content: editText.trim(), updated_at: new Date().toISOString() })
        .eq('id', comment.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setIsEditing(false);
      onUpdate();
      toast.success('Comment updated');
    } catch (error) {
      console.error('Error editing comment:', error);
      toast.error('Failed to edit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!user || !window.confirm('Are you sure you want to delete this comment?')) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', comment.id)
        .eq('user_id', user.id);

      if (error) throw error;

      onUpdate();
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyComment = () => {
    navigator.clipboard.writeText(comment.content);
    toast.success('Comment copied to clipboard');
  };

  const handleReportComment = () => {
    toast.success('Comment reported. We will review it shortly.');
  };

  return (
    <div className={`group ${isReply ? 'ml-10' : ''}`}>
      <div className="flex gap-2 sm:gap-2.5">
        {/* Avatar */}
        <Avatar
          className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 cursor-pointer ring-1 ring-border/30 hover:ring-primary/30 transition-all"
          onClick={() => navigate(`/profile/${comment.user_id}`)}
        >
          <AvatarImage src={comment.profiles?.avatar_url} />
          <AvatarFallback className="bg-gradient-to-br from-blue-50 to-purple-50 text-blue-700 text-[10px] sm:text-xs font-semibold">
            {comment.profiles?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Comment Bubble */}
          <div className="bg-muted/50 rounded-xl px-2.5 py-1.5 sm:px-3.5 sm:py-2.5 inline-block max-w-full relative group/comment">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                <span
                  className="font-semibold text-[11px] sm:text-xs text-foreground cursor-pointer hover:text-blue-600 transition-colors truncate"
                  onClick={() => navigate(`/profile/${comment.user_id}`)}
                >
                  {comment.profiles?.full_name || 'User'}
                </span>
                {comment.profiles?.current_position && (
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground truncate hidden sm:inline">
                    {comment.profiles.current_position}
                  </span>
                )}
              </div>

              {/* 3-dot dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 sm:h-6 sm:w-6 p-0 opacity-0 group-hover/comment:opacity-100 focus:opacity-100 transition-opacity shrink-0 hover:bg-background/50 rounded-full"
                  >
                    <MoreHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 sm:w-48 bg-background border shadow-lg z-50">
                  {isCommentOwner ? (
                    <>
                      <DropdownMenuItem onClick={() => { setIsEditing(true); setEditText(comment.content); }}>
                        <Edit className="w-3.5 h-3.5 mr-2" />
                        <span className="text-xs sm:text-sm">Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDeleteComment} className="text-destructive focus:text-destructive">
                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                        <span className="text-xs sm:text-sm">Delete</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleCopyComment}>
                        <Copy className="w-3.5 h-3.5 mr-2" />
                        <span className="text-xs sm:text-sm">Copy text</span>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={handleCopyComment}>
                        <Copy className="w-3.5 h-3.5 mr-2" />
                        <span className="text-xs sm:text-sm">Copy text</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleReportComment} className="text-destructive focus:text-destructive">
                        <Flag className="w-3.5 h-3.5 mr-2" />
                        <span className="text-xs sm:text-sm">Report</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {isEditing ? (
              <div className="space-y-1.5 mt-1">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="min-h-[50px] text-xs sm:text-sm bg-background border-border/50 resize-none"
                  autoFocus
                />
                <div className="flex items-center gap-1.5 justify-end">
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] sm:text-xs px-2" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" className="h-6 text-[10px] sm:text-xs px-2" onClick={handleEditComment} disabled={!editText.trim() || submitting}>
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed break-words whitespace-pre-wrap">
                {comment.content}
              </p>
            )}
          </div>

          {/* Comment Actions */}
          {!isEditing && (
            <div className="flex items-center gap-2 mt-0.5 sm:mt-1 pl-1">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground">
                {formatTimeAgo(comment.created_at)}
              </span>
              <button
                onClick={handleLike}
                className={`text-[10px] sm:text-[11px] font-semibold py-0.5 transition-colors ${
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
                  className="text-[10px] sm:text-[11px] font-semibold py-0.5 text-muted-foreground hover:text-blue-600 transition-colors"
                >
                  Reply
                </button>
              )}
            </div>
          )}

          {/* Reply Input */}
          {showReplyInput && (
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
              <Avatar className="h-5 w-5 sm:h-6 sm:w-6 shrink-0">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-[9px] sm:text-[10px] bg-blue-50 text-blue-700">
                  {profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex items-center gap-1 bg-muted/40 rounded-full px-2 py-0.5 sm:px-3 sm:py-1.5 border border-border/50 focus-within:border-blue-300 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
                <Input
                  placeholder={`Reply to ${comment.profiles?.full_name || 'User'}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="border-0 bg-transparent h-6 sm:h-7 text-xs sm:text-sm p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
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
                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 shrink-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                  onClick={handleReplySubmit}
                  disabled={!replyText.trim() || submitting}
                >
                  <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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
