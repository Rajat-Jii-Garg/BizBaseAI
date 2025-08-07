
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal, CheckCircle, Hash, AtSign, Edit, Copy, Bookmark, Flag, Trash2, X, Save } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Post } from '@/hooks/usePosts';
import PostEngagementActions from './PostEngagementActions';
import CommentsSection from './CommentsSection';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EnhancedPostCard = ({ post, onEngagementUpdate, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showFullContent, setShowFullContent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  // Extract hashtags from content
  const extractHashtags = (content) => {
    const matches = content.match(/#[\w]+/g);
    return matches || [];
  };

  // Extract mentions from content
  const extractMentions = (content) => {
    const matches = content.match(/@[\w\s]+/g);
    return matches || [];
  };

  // Render content with highlighted hashtags and mentions
  const renderContent = (content) => {
    if (!content) return null;

    // Split content and highlight hashtags and mentions
    const parts = content.split(/(\s+)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span key={index} className="text-blue-600 font-medium hover:text-blue-700 cursor-pointer">
            {part}
          </span>
        );
      } else if (part.startsWith('@')) {
        return (
          <span key={index} className="text-green-600 font-medium hover:text-green-700 cursor-pointer">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const shouldTruncate = post.content.length > 300;
  const displayContent = shouldTruncate && !showFullContent 
    ? post.content.substring(0, 300) + '...' 
    : post.content;

  const handleProfileClick = () => {
    navigate(`/user-profile?user=${post.user_id}`);
  };

  const handleEdit = async () => {
    if (!onEdit || !editContent.trim()) return;
    
    try {
      await onEdit(post.id, editContent);
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Post updated successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await onDelete(post.id);
        toast({
          title: "Success",
          description: "Post deleted successfully!"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete post",
          variant: "destructive"
        });
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast({
      title: "Success",
      description: "Post link copied to clipboard!"
    });
  };

  const isOwnPost = user?.id === post.user_id;

  return (
    <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <Avatar 
              className="h-12 w-12 ring-2 ring-gray-100 cursor-pointer hover:ring-blue-200 transition-all"
              onClick={handleProfileClick}
            >
              <AvatarImage src={post.profiles?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold text-lg">
                {post.profiles?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <h4 
                  className="font-bold text-gray-900 text-base cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={handleProfileClick}
                >
                  {post.profiles?.full_name || 'Professional User'}
                </h4>
                <CheckCircle className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-600 font-medium">
                {post.profiles?.current_position || 'Professional Member'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formatTimeAgo(post.created_at)}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border shadow-lg z-50">
              {isOwnPost && (
                <>
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bookmark className="w-4 h-4 mr-2" />
                Save Post
              </DropdownMenuItem>
              {!isOwnPost && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Flag className="w-4 h-4 mr-2" />
                    Report Post
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <div className="text-base text-gray-800 leading-relaxed mb-3">
            {renderContent(displayContent)}
            {shouldTruncate && (
              <button
                onClick={() => setShowFullContent(!showFullContent)}
                className="text-blue-600 hover:text-blue-700 font-medium ml-2"
              >
                {showFullContent ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>

          {/* Hashtags and Mentions */}
          <div className="flex flex-wrap gap-2 mb-3">
            {extractHashtags(post.content).map((hashtag, index) => (
              <Badge 
                key={`hashtag-${index}`} 
                variant="secondary" 
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer transition-colors"
              >
                <Hash className="w-3 h-3 mr-1" />
                {hashtag.substring(1)}
              </Badge>
            ))}
            {extractMentions(post.content).map((mention, index) => (
              <Badge 
                key={`mention-${index}`} 
                variant="secondary" 
                className="bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer transition-colors"
              >
                <AtSign className="w-3 h-3 mr-1" />
                {mention.substring(1)}
              </Badge>
            ))}
          </div>

          {/* Post Image */}
          {post.image_url && (
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <img 
                src={post.image_url} 
                alt="Post image" 
                className="w-full h-auto hover:scale-105 transition-transform duration-300"
              />
            </div>
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

        {/* Comments Section */}
        <CommentsSection
          postId={post.id}
          commentsCount={post.comments_count || 0}
          onCommentUpdate={onEngagementUpdate}
        />
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[120px]"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={!editContent.trim()}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EnhancedPostCard;
