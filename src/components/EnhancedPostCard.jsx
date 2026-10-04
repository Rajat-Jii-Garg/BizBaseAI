import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { AtSign, Bookmark, CheckCircle, Copy, Edit, ExternalLink, Flag, Hash, MoreHorizontal, Repeat2, Save, Trash2, UserPlus, Users, Loader2, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import PostEngagementActions from './PostEngagementActions';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { buildShareUrl } from '@/lib/siteUrl';
import { formatTimeAgo } from '@/lib/timeAgo';
import { useNavigate } from 'react-router-dom';

const EnhancedPostCard = ({ post, onEngagementUpdate, onEdit, onDelete, showCommunityContext = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showFullContent, setShowFullContent] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userHasReposted, setUserHasReposted] = useState(post.user_has_reposted || false);
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [loadingConnection, setLoadingConnection] = useState(true);
  const [communityMembership, setCommunityMembership] = useState(post.community_membership || null);
  const [communityActionLoading, setCommunityActionLoading] = useState(false);

  useEffect(() => {
    setCommunityMembership(post.community_membership || null);
  }, [post.community_membership]);

  useEffect(() => {
    setUserHasReposted(post.user_has_reposted || false);
  }, [post.user_has_reposted]);

  useEffect(() => {
    const checkConnectionStatus = async () => {
      if (!user || !post.user_id || user.id === post.user_id) {
        setConnectionStatus('none');
        setLoadingConnection(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('connections')
          .select('status')
          .or(
            `and(requester_id.eq.${user.id},addressee_id.eq.${post.user_id}),and(requester_id.eq.${post.user_id},addressee_id.eq.${user.id})`
          )
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          setConnectionStatus(data[0].status); // pending / accepted
        } else {
          setConnectionStatus('none');
        }

      } catch (err) {
        console.error("Connection check error:", err);
        setConnectionStatus('none');
      }

      setLoadingConnection(false);
    };

    checkConnectionStatus();
  }, [user?.id, post.user_id]);


  const handlePostClick = () => {
    if (post.profiles?.username) {
      navigate(`/${post.profiles.username}/post/${post.id}`);
    }
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

  const hashtags = extractHashtags(post.content);
  const contentWithoutHashtags = post.content
    .replace(/#[\p{L}\p{N}_]+/gu, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const displayContent = shouldTruncate && !showFullContent
    ? post.content.substring(0, 300) + '...'
    : post.content;

  const handleProfileClick = () => {
    if (post.profiles?.username) {
      navigate(`/${post.profiles.username}`);
    }
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
    if (!post.profiles?.username) return;

    const postUrl = buildShareUrl(`/${post.profiles.username}/post/${post.id}`);
    navigator.clipboard.writeText(postUrl);
  };

  const isOwnPost = user?.id === post.user_id;
  const isConnected = post.is_connected === true;
  const isRepost = !!post.repost_of_post_id;

  const handleReport = async () => {
    if (!user || !post.community_id || isOwnPost) return;
    try {
      const { error } = await supabase
        .from('community_reports')
        .insert({
          community_id: post.community_id,
          post_id: post.id,
          reported_by: user.id,
          reason: 'Reported by community member',
        });
      if (error) throw error;
      toast({ title: 'Report submitted', description: 'Community moderators will review this post.' });
    } catch (error) {
      toast({ title: 'Unable to report', description: error?.message || 'Please try again.', variant: 'destructive' });
    }
  };

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

  const handleCommunityJoin = async () => {
    if (!user || !post.community?.id) return;

    if (communityMembership?.status === 'approved') {
      navigate(`/communities/${post.community.id}`);
      return;
    }

    if (communityMembership?.status === 'pending') {
      toast({
        title: 'Request pending',
        description: 'Your request is waiting for approval.'
      });
      return;
    }

    setCommunityActionLoading(true);

    try {
      const status = post.community.is_private
        ? 'pending'
        : 'approved';

      const { error } = await supabase
        .from('community_members')
        .insert({
          community_id: post.community.id,
          user_id: user.id,
          role: 'member',
          status
        });

      if (error) throw error;

      setCommunityMembership({
        community_id: post.community.id,
        status,
        role: 'member'
      });

      toast({
        title:
          status === 'approved'
            ? 'Joined community'
            : 'Join request sent',
        description:
          status === 'approved'
            ? `You are now a member of ${post.community.name}.`
            : `Your request to join ${post.community.name} is pending approval.`
      });

    } catch (error) {
      toast({
        title: 'Unable to join',
        description:
          error?.message || 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setCommunityActionLoading(false);
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

        {showCommunityContext && post.community && (
          <div className="mb-4 -mx-3 sm:-mx-6 -mt-2 sm:-mt-6">
            <div className="bg-white px-3 pt-3 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                {/* COMMUNITY IDENTITY */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      `/communities/${post.community.id}`
                    );
                  }}
                  className="flex min-w-0 items-center gap-3 text-left"
                >

                  <Avatar className="h-10 w-10 shrink-0 rounded-xl border border-slate-200">

                    <AvatarImage
                      src={
                        post.community.image_url ||
                        undefined
                      }
                    />

                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700">
                      <Users className="h-5 w-5" />
                    </AvatarFallback>

                  </Avatar>

                  <div className="min-w-0">

                    <div className="flex items-center gap-1.5">

                      <span className="truncate text-sm font-bold text-slate-900 hover:text-blue-600">
                        {post.community.name}
                      </span>

                      {post.community.is_private && (
                        <Lock className="h-3 w-3 shrink-0 text-slate-400" />
                      )}

                    </div>

                    <p className="truncate text-[10px] text-slate-500 sm:text-[11px]">
                      {(
                        post.community.members_count ||
                        0
                      ).toLocaleString()}{' '}
                      members
                      {post.community.category
                        ? ` • ${post.community.category}`
                        : ''}
                    </p>
                  </div>
                </button>
                {/* COMMUNITY ACTIONS */}
                <div
                  className="flex shrink-0 items-center gap-1"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >
                  <Button
                    size="sm"
                    variant={
                      communityMembership?.status ===
                      'approved'
                        ? 'outline'
                        : 'default'
                    }
                    className="h-8 rounded-lg px-3 text-xs"
                    onClick={
                      handleCommunityJoin
                    }
                    disabled={
                      communityActionLoading
                    }
                  >

                    {communityActionLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : communityMembership?.status ===
                      'approved' ? (
                      'Joined'
                    ) : communityMembership?.status ===
                      'pending' ? (
                      'Requested'
                    ) : (
                      <>
                        <UserPlus className="mr-1 h-3.5 w-3.5" />
                        Join
                      </>
                    )}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent
                      align="end"
                      className="w-48"
                    >
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(
                            `/communities/${post.community.id}`
                          )
                        }
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Community
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              `${window.location.origin}/communities/${post.community.id}`
                            );
                            toast({
                              title:
                                'Community link copied',
                            });
                          } catch {
                            toast({
                              title:
                                'Failed to copy community link',
                              variant:
                                'destructive',
                            });
                          }
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Community Link
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {/* LIGHT DIVIDER — EXACT COMMUNITY/POST SEPARATION */}
              <div className="mt-3 border-b border-slate-100" />
            </div>
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
              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
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
                  <DropdownMenuItem onClick={handleReport} className="text-destructive">
                    <Flag className="w-4 h-4 mr-2" />
                    Report Post
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Post Content */}
        <div className="mb-2 sm:mb-4 cursor-pointer" onClick={handlePostClick}>
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
            {hashtags.map((hashtag, index) => (
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
        <div onClick={(e) => e.stopPropagation()}>
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
        </div>
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
