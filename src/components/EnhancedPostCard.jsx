import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal, CheckCircle, Hash, AtSign, Edit, Copy, Bookmark, Flag, Trash2, X, Save, Repeat2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PostEngagementActions from './PostEngagementActions';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EnhancedPostCard = ({ post, onEngagementUpdate, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showFullContent, setShowFullContent] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userHasReposted, setUserHasReposted] = useState(post.user_has_reposted || false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loadingConnection, setLoadingConnection] = useState(true);

  useEffect(() => {
    setUserHasReposted(post.user_has_reposted || false);
  }, [post.user_has_reposted]);

  useEffect(() => {
    const checkConnectionStatus = async () => {
      if (!user || !post.user_id || user.id === post.user_id) {
        setLoadingConnection(false);
        return;
      }

      const { data } = await supabase
        .from('connections')
        .select('status')
        .or(
          `and(requester_id.eq.${user.id},addressee_id.eq.${post.user_id}),and(requester_id.eq.${post.user_id},addressee_id.eq.${user.id})`
        )
        .maybeSingle();

      if (data) {
        setConnectionStatus(data.status);
      }

      setLoadingConnection(false);
    };

    checkConnectionStatus();
  }, [user, post.user_id]);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  const extractHashtags = (content) => {
    const matches = content.match(/#[\w]+/g);
    return matches || [];
  };

  const extractMentions = (content) => {
    const matches = content.match(/@[\w\s]+/g);
    return matches || [];
  };

  const renderContent = (content) => {
    if (!content) return null;
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
    navigate(`/profile/${post.user_id}`);
  };

  const handleEdit = async () => {
    if (!onEdit || !editContent.trim()) return;
    try {
      await onEdit(post.id, editContent);
      setIsEditDialogOpen(false);
      toast({ title: "Success", description: "Post updated successfully!" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update post", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await onDelete(post.id);
        toast({ title: "Success", description: "Post deleted successfully!" });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete post", variant: "destructive" });
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast({ title: "Success", description: "Post link copied to clipboard!" });
  };

  const isOwnPost = user?.id === post.user_id;
  const isConnected = post.is_connected === true;
  const isRepost = !!post.repost_of_post_id;

  const handleConnect = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          addressee_id: post.user_id,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already Sent",
            description: "Connection request already exists.",
          });
          setConnectionStatus('pending');
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Request Sent",
          description: "Connection request sent successfully!",
        });

        // 🔥 Immediately change button
        setConnectionStatus('pending');
      }

    } catch (err) {
      toast({
        title: "Error",
        description: "Unable to send request.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-card border border-border/50 overflow-hidden rounded-none sm:rounded-xl shadow-none sm:shadow-lg hover:shadow-none sm:hover:shadow-xl transition-shadow">
      <CardContent className="px-3 py-2 sm:p-6">
        {/* Repost indicator */}
        {isRepost && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 pb-2 border-b border-border/50">
            <Repeat2 className="w-4 h-4" />
            <span>Reposted by {post.profiles?.full_name || 'User'}</span>
          </div>
        )}

        {/* Post Header */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-start gap-2.5 sm:gap-4 min-w-0">
            <Avatar 
              className="h-9 w-9 sm:h-12 sm:w-12 ring-1 sm:ring-2 ring-border/30 cursor-pointer hover:ring-primary/30 transition-all"
              onClick={handleProfileClick}
            >
              <AvatarImage src={post.profiles?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold text-base sm:text-lg">
                {post.profiles?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <h4 
                  className="font-semibold text-foreground text-sm sm:text-base truncate max-w-[180px] sm:max-w-none cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={handleProfileClick}
                >
                  {post.profiles?.full_name || 'Professional User'}
                </h4>
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 shrink-0" />
              </div>
              <p className="text-[11px] sm:text-sm text-muted-foreground font-medium">
                {post.profiles?.current_position || 'Professional Member'}
              </p>
              <p className="text-[10px] sm:text-sm text-muted-foreground/70 mt-0.5">
                {formatTimeAgo(post.created_at)}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Connect/Following button logic */}
              {!isOwnPost && !loadingConnection && (
                  connectionStatus === 'accepted' ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled
                      className="h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs text-green-600 font-medium cursor-default opacity-70"
                    >
                      Following
                    </Button>
                  ) : connectionStatus === 'pending' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs opacity-60 cursor-not-allowed"
                    >
                      Request Sent
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleConnect}
                      className="h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs"
                    >
                      + Connect
                    </Button>
                  )
                )}

              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-muted/50">
                  <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </DropdownMenuTrigger>
            </div>

            <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
              {isOwnPost && (
                <>
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
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
                  <DropdownMenuItem className="text-destructive">
                    <Flag className="w-4 h-4 mr-2" />
                    Report Post
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Post Content */}
        <div className="mb-2 sm:mb-4">
          <div className="text-sm sm:text-base text-foreground leading-relaxed mb-3 whitespace-pre-line">
            {renderContent(displayContent)}
            {shouldTruncate && (
              <button
                onClick={() => setShowFullContent(!showFullContent)}
                className="text-blue-600 hover:text-blue-700 font-medium ml-2"
              >
                {showFullContent ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {/* Hashtags and Mentions */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
            {extractHashtags(post.content).map((hashtag, index) => (
              <Badge 
                key={`hashtag-${index}`} 
                variant="secondary" 
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer transition-colors text-[10px] sm:text-xs"
              >
                <Hash className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                {hashtag.substring(1)}
              </Badge>
            ))}
            {extractMentions(post.content).map((mention, index) => (
              <Badge 
                key={`mention-${index}`} 
                variant="secondary" 
                className="bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer transition-colors text-[10px] sm:text-xs"
              >
                <AtSign className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                {mention.substring(1)}
              </Badge>
            ))}
          </div>

          {/* Post Image */}
          {post.image_url && (
            <div className="mt-2 -mx-3 sm:mx-0 sm:rounded-xl overflow-hidden border-t border-b sm:border border-border/50">
              <img 
                src={post.image_url} 
                alt="Post image" 
                className="w-full h-auto object-cover"
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
          repostsCount={post.reposts_count || 0}
          userHasLiked={post.user_has_liked || false}
          userHasReposted={userHasReposted}
          onEngagementUpdate={onEngagementUpdate}
          originalPost={post}
        />
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-background">
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
