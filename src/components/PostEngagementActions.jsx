
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Share2, Send } from 'lucide-react';
import { usePostEngagement } from '@/hooks/usePostEngagement';

const PostEngagementActions = ({
  postId,
  likesCount,
  commentsCount,
  sharesCount,
  userHasLiked,
  onEngagementUpdate
}) => {
  const { toggleLike, addComment, sharePost, loading } = usePostEngagement();
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleLike = async () => {
    await toggleLike(postId);
    onEngagementUpdate();
  };

  const handleComment = async () => {
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

  return (
    <div className="border-t border-gray-100 pt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-4 text-xs text-gray-600">
          <span>{likesCount} likes</span>
          <span>{commentsCount} comments</span>
          <span>{sharesCount} shares</span>
        </div>
      </div>
      
      <div className="flex items-center justify-around border-t border-gray-100 pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex-1 h-8 hover:bg-gray-50 ${
            userHasLiked ? 'text-red-500' : 'text-gray-600'
          }`}
          onClick={handleLike}
          disabled={loading}
        >
          <Heart className={`w-4 h-4 mr-1 ${userHasLiked ? 'fill-current' : ''}`} />
          <span className="text-xs">Like</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 h-8 hover:bg-gray-50 text-gray-600"
          onClick={() => setShowCommentInput(!showCommentInput)}
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          <span className="text-xs">Comment</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 h-8 hover:bg-gray-50 text-gray-600"
          onClick={handleShare}
          disabled={loading}
        >
          <Share2 className="w-4 h-4 mr-1" />
          <span className="text-xs">Share</span>
        </Button>
      </div>

      {showCommentInput && (
        <div className="mt-3 flex gap-2">
          <Input
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleComment();
              }
            }}
          />
          <Button 
            size="sm" 
            onClick={handleComment}
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
