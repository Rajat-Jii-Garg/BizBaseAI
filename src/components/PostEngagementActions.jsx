import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowBigUp, MessageSquare, MoreVertical, Share2, Send, Repeat2 } from 'lucide-react';
import { usePostEngagement } from '@/hooks/usePostEngagement';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

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
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleUpvote = async () => {
    await toggleLike(postId);
    onEngagementUpdate();
  };

  const handleFeedback = async () => {
    if (commentText.trim()) {
      await addComment(postId, commentText);
      setCommentText('');
      setShowCommentInput(false);
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

  return (
    <div className="border-t border-gray-100 pt-2 sm:pt-3">
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <div className="flex items-center gap-3 text-[11px] sm:text-xs text-gray-500">
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
      
      <div className="flex items-center justify-between border-t border-gray-100 mt-1 pt-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex-1 h-8 sm:h-9 hover:bg-gray-50 ${
            userHasLiked ? 'text-blue-600' : 'text-gray-600'
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
          className="flex-1 h-8 sm:h-9 hover:bg-gray-50 text-gray-600"
          onClick={() => setShowCommentInput(!showCommentInput)}
        >
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
          <span className="text-xs font-medium">Feedback</span>
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex-1 h-8 sm:h-9 hover:bg-gray-50 ${
            userHasReposted ? 'text-green-600' : 'text-gray-600'
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
          className="flex-1 h-8 sm:h-9 hover:bg-gray-50 text-gray-600"
          onClick={handleShare}
          disabled={loading}
        >
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
          <span className="text-xs font-medium">Share</span>
        </Button>
      </div>

      {showCommentInput && (
        <div className="mt-3 flex gap-2">
          <Input
            placeholder="Write your feedback..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleFeedback();
              }
            }}
          />
          <Button 
            size="sm" 
            onClick={handleFeedback}
            disabled={!commentText.trim() || loading}
          >
            <Send className="w-4 h-4" />
          </Button>

          {/* Feedback List */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <Card key={comment.id} className="p-3">
                <div className="flex items-start gap-3">
                  <Avatar 
                    className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
                    onClick={() => navigate(`/profile/${comment.user_id}`)}
                  >
                    <AvatarImage src={comment.profiles?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {comment.profiles?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p 
                        className="font-medium text-sm cursor-pointer hover:text-primary transition-colors"
                        onClick={() => navigate(`/profile/${comment.user_id}`)}
                      >
                        {comment.profiles?.full_name || 'User'}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostEngagementActions;
