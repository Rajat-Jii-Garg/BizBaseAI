
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, CheckCircle } from 'lucide-react';
import PostEngagementActions from './PostEngagementActions';

const PostCard = ({ post, onEngagementUpdate }) => {
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.profiles?.avatar_url} />
              <AvatarFallback className="bg-gray-100 text-gray-600 font-semibold">
                {post.profiles?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-1">
                <h4 className="font-semibold text-gray-900 text-sm">
                  {post.profiles?.full_name || 'Unknown User'}
                </h4>
                <CheckCircle className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-xs text-gray-600">Professional Member</p>
              <p className="text-xs text-gray-500">{formatTimeAgo(post.created_at)}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-sm text-gray-800 leading-relaxed">{post.content}</p>
          {post.image_url && (
            <img 
              src={post.image_url} 
              alt="Post image" 
              className="mt-3 rounded-lg max-w-full h-auto"
            />
          )}
        </div>

        {/* Post Engagement */}
        <PostEngagementActions
          postId={post.id}
          likesCount={post.likes_count || 0}
          commentsCount={post.comments_count || 0}
          sharesCount={post.shares_count || 0}
          userHasLiked={post.user_has_liked || false}
          onEngagementUpdate={onEngagementUpdate}
        />
      </CardContent>
    </Card>
  );
};

export default PostCard;
