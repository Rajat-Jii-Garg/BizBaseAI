import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowBigUp, MessageSquare, Share2, Send, Repeat2 } from 'lucide-react';
import { usePostEngagement } from '@/hooks/usePostEngagement';

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
    <div className="border-t border-gray-100 pt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-4 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <ArrowBigUp className="w-3 h-3" />
            {likesCount} upvotes
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {commentsCount} feedback
          </span>
          <span className="flex items-center gap-1">
            <Repeat2 className="w-3 h-3" />
            {repostsCount} reposts
          </span>
          <span className="flex items-center gap-1">
            <Share2 className="w-3 h-3" />
            {sharesCount} shares
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-around border-t border-gray-100 pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex-1 h-8 hover:bg-gray-50 ${
            userHasLiked ? 'text-blue-600' : 'text-gray-600'
          }`}
          onClick={handleUpvote}
          disabled={loading}
        >
          <ArrowBigUp className={`w-5 h-5 mr-1 ${userHasLiked ? 'fill-current' : ''}`} />
          <span className="text-xs font-medium">Upvote</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 h-8 hover:bg-gray-50 text-gray-600"
          onClick={() => setShowCommentInput(!showCommentInput)}
        >
          <MessageSquare className="w-4 h-4 mr-1" />
          <span className="text-xs font-medium">Feedback</span>
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex-1 h-8 hover:bg-gray-50 ${
            userHasReposted ? 'text-green-600' : 'text-gray-600'
          }`}
          onClick={handleRepost}
          disabled={loading || userHasReposted}
        >
          <Repeat2 className={`w-4 h-4 mr-1 ${userHasReposted ? 'text-green-600' : ''}`} />
          <span className="text-xs font-medium">{userHasReposted ? 'Reposted' : 'Repost'}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 h-8 hover:bg-gray-50 text-gray-600"
          onClick={handleShare}
          disabled={loading}
        >
          <Share2 className="w-4 h-4 mr-1" />
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
