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
        </div>
      )}
    </div>
  );
};

export default PostEngagementActions;
