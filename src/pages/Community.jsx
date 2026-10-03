import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Hash, Globe, Lock, Users, MessageSquare, ArrowLeft, Loader2,
  UserPlus, Clock, CheckCircle2, Share2, Copy, Shield, UserMinus,
  Trash2, Send, ImagePlus, X, RefreshCw, Crown, UserCheck, MoreHorizontal, Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import SEOHead from '@/components/SEOHead';
import EnhancedPostCard from '@/components/EnhancedPostCard';
import CommunityAdminPanel from '@/components/CommunityAdminPanel';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CommunityManagementDialog from '@/components/CommunityManagementDialog';

const Community = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const discussionRef = useRef(null);
  const fileInputRef = useRef(null);

  const [community, setCommunity] = useState(null);
  const [membership, setMembership] = useState(null);
  const [members, setMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postFile, setPostFile] = useState(null);
  const [postPreview, setPostPreview] = useState(null);
  const [posting, setPosting] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [activeView, setActiveView] = useState('home');
  const [managementOpen, setManagementOpen] = useState(false);
  const [managementSection, setManagementSection] = useState('settings');

  const isOwner = !!user && community?.user_id === user.id;
  const isAdmin = isOwner || (membership?.status === 'approved' && ['admin', 'moderator'].includes(membership?.role));
  const isApprovedMember = isOwner || membership?.status === 'approved';
  const isPending = membership?.status === 'pending';
  const canViewContent = !community?.is_private || isApprovedMember;


  const fetchCommunity = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setCommunity(data || null);
    } catch (error) {
      console.error('Error loading community:', error);
      toast.error(error?.message || 'Unable to load community');
      setCommunity(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchMembership = useCallback(async () => {
    if (!user || !id) {
      setMembership(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('community_members')
        .select('id, community_id, user_id, role, status, joined_at')
        .eq('community_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setMembership(data || null);
    } catch (error) {
      console.error('Error loading membership:', error);
    }
  }, [id, user]);

  const fetchMembers = useCallback(async () => {
    if (!id || !community) return;

    setMembersLoading(true);
    try {
      const { data: memberRows, error } = await supabase
        .from('community_members')
        .select('id, user_id, role, status, joined_at')
        .eq('community_id', id)
        .eq('status', 'approved')
        .order('joined_at', { ascending: true });

      if (error) throw error;

      const userIds = [...new Set((memberRows || []).map((row) => row.user_id))];
      let profiles = [];

      if (userIds.length > 0) {
        const { data: profileRows, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, current_position, company_name')
          .in('id', userIds);

        if (profileError) throw profileError;
        profiles = profileRows || [];
      }

      const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
      setMembers(
        (memberRows || []).map((row) => ({
          ...row,
          profile: profileMap.get(row.user_id) || null,
        }))
      );
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setMembersLoading(false);
    }
  }, [community, id]);

  const fetchPendingMembers = useCallback(async () => {
    if (!isAdmin || !id) {
      setPendingMembers([]);
      return;
    }

    try {
      const { data: memberRows, error } = await supabase
        .from('community_members')
        .select('id, user_id, role, status, joined_at')
        .eq('community_id', id)
        .eq('status', 'pending')
        .order('joined_at', { ascending: true });

      if (error) throw error;

      const userIds = [...new Set((memberRows || []).map((row) => row.user_id))];
      let profiles = [];

      if (userIds.length > 0) {
        const { data: profileRows, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, current_position, company_name')
          .in('id', userIds);

        if (profileError) throw profileError;
        profiles = profileRows || [];
      }

      const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
      setPendingMembers(
        (memberRows || []).map((row) => ({
          ...row,
          profile: profileMap.get(row.user_id) || null,
        }))
      );
    } catch (error) {
      console.error('Error loading pending members:', error);
    }
  }, [id, isAdmin]);

  const fetchPosts = useCallback(async () => {
    if (!id || !canViewContent) {
      setPosts([]);
      return;
    }

    setPostsLoading(true);
    try {
      const { data: postRows, error } = await supabase
        .from('posts')
        .select('*')
        .eq('community_id', id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const rows = postRows || [];
      const userIds = [...new Set(rows.map((post) => post.user_id))];
      const postIds = rows.map((post) => post.id);

      let profiles = [];
      let likes = [];
      let reposts = [];
      let pinRows = [];

      if (userIds.length > 0) {
        const { data: profileRows } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, current_position, company_name')
          .in('id', userIds);
        profiles = profileRows || [];
      }

      if (user && postIds.length > 0) {
        const [{ data: likeRows }, { data: repostRows }] = await Promise.all([
          supabase
            .from('post_likes')
            .select('post_id')
            .eq('user_id', user.id)
            .in('post_id', postIds),
          supabase
            .from('post_reposts')
            .select('post_id')
            .eq('user_id', user.id)
            .in('post_id', postIds),
        ]);
        likes = likeRows || [];
        reposts = repostRows || [];
      }

      if (isApprovedMember && postIds.length > 0) {
        const { data: rows, error: pinError } = await supabase
          .from('community_pins')
          .select('post_id')
          .eq('community_id', id)
          .in('post_id', postIds);
        if (pinError) throw pinError;
        pinRows = rows || [];
      }

      const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
      const likedIds = new Set(likes.map((like) => like.post_id));
      const repostedIds = new Set(reposts.map((repost) => repost.post_id));
      const pinnedIds = new Set(pinRows.map((pin) => pin.post_id));

      setPosts(
        rows.map((post) => ({
          ...post,
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          shares_count: post.shares_count || 0,
          reposts_count: post.reposts_count || 0,
          profiles: profileMap.get(post.user_id) || {
            full_name: 'BizBase Member',
            username: null,
            avatar_url: null,
          },
          user_has_liked: likedIds.has(post.id),
          user_has_reposted: repostedIds.has(post.id),
          is_pinned: pinnedIds.has(post.id),
        }))
      );
    } catch (error) {
      console.error('Error loading community posts:', error);
      toast.error(error?.message || 'Failed to load discussions');
    } finally {
      setPostsLoading(false);
    }
  }, [canViewContent, id, isApprovedMember, user]);

  useEffect(() => {
    fetchCommunity();
  }, [fetchCommunity]);

  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);

  useEffect(() => {
    if (!community) return;
    fetchMembers();
    fetchPendingMembers();
    fetchPosts();
  }, [community, fetchMembers, fetchPendingMembers, fetchPosts]);

  useEffect(() => {
    if (!id) return undefined;

    const channel = supabase
      .channel(`community_${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_members', filter: `community_id=eq.${id}` },
        () => {
          fetchCommunity();
          fetchMembership();
          fetchMembers();
          fetchPendingMembers();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts', filter: `community_id=eq.${id}` },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCommunity, fetchMembers, fetchMembership, fetchPendingMembers, fetchPosts, id]);

  const handleJoin = async () => {
    if (!user) {
      toast.error('Please login to join this community');
      return;
    }

    if (membership?.status === 'approved') return;
    if (membership?.status === 'pending') {
      toast.info('Your join request is already pending');
      return;
    }

    setActionLoading(true);
    try {
      const status = community.is_private ? 'pending' : 'approved';
      const { error } = await supabase
        .from('community_members')
        .insert({
          community_id: id,
          user_id: user.id,
          role: 'member',
          status,
        });

      if (error) throw error;

      await Promise.all([fetchCommunity(), fetchMembership()]);

      if (status === 'pending') {
        toast.success('Join request sent', {
          description: 'The community admin will review your request.',
        });
      } else {
        toast.success('You joined the community');
      }
    } catch (error) {
      console.error('Error joining community:', error);
      toast.error(error?.message || 'Failed to join community');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!user || !membership) return;
    if (isOwner) {
      toast.error('The community owner cannot leave. Delete or transfer the community first.');
      return;
    }

    if (!window.confirm(`Leave ${community.name}?`)) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await Promise.all([fetchCommunity(), fetchMembership(), fetchMembers()]);
      toast.success('You left the community');
    } catch (error) {
      console.error('Error leaving community:', error);
      toast.error(error?.message || 'Failed to leave community');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (memberId) => {
    if (!isAdmin) return;
    try {
      const { error } = await supabase
        .from('community_members')
        .update({ status: 'approved' })
        .eq('id', memberId)
        .eq('community_id', id);

      if (error) throw error;
      toast.success('Member approved');
      await Promise.all([fetchCommunity(), fetchMembers(), fetchPendingMembers()]);
    } catch (error) {
      console.error('Error approving member:', error);
      toast.error(error?.message || 'Failed to approve member');
    }
  };

  const handleReject = async (memberId) => {
    if (!isAdmin) return;
    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('id', memberId)
        .eq('community_id', id);

      if (error) throw error;
      toast.success('Join request declined');
      await fetchPendingMembers();
    } catch (error) {
      console.error('Error rejecting member:', error);
      toast.error(error?.message || 'Failed to decline request');
    }
  };

  const handleRemoveMember = async (member) => {
    if (!isAdmin || !member?.user_id || member.user_id === community.user_id) return;

    const name = member.profile?.full_name || member.profile?.username || 'this member';
    if (!window.confirm(`Remove ${name} from ${community.name}?`)) return;

    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('id', member.id)
        .eq('community_id', id);

      if (error) throw error;
      toast.success('Member removed');
      await Promise.all([fetchCommunity(), fetchMembers()]);
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(error?.message || 'Failed to remove member');
    }
  };

  const handleDeleteCommunity = async () => {
    if (!isOwner) return;
    if (!window.confirm(`Delete ${community.name}? This will permanently remove the community and its discussions.`)) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('communities')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Community deleted');
      navigate('/communities');
    } catch (error) {
      console.error('Error deleting community:', error);
      toast.error(error?.message || 'Failed to delete community');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image is too large', { description: 'Maximum size is 10MB.' });
      return;
    }

    setPostFile(file);
    const reader = new FileReader();
    reader.onload = () => setPostPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removePostFile = () => {
    setPostFile(null);
    setPostPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadPostImage = async () => {
    if (!postFile || !user) return null;

    const extension = postFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `community/${id}/${user.id}/${Date.now()}.${extension}`;

    const { error } = await supabase.storage
      .from('posts')
      .upload(path, postFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: postFile.type,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from('posts')
      .getPublicUrl(path);

    return data.publicUrl;
  };

  const handleCreatePost = async () => {
    if (!user) {
      toast.error('Please login to post');
      return;
    }
    if (!isApprovedMember) {
      toast.error('Join the community before posting');
      return;
    }
    if (!postContent.trim() && !postFile) {
      toast.error('Write something or add an image');
      return;
    }

    setPosting(true);
    try {
      const imageUrl = await uploadPostImage();

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: postContent.trim() || 'Shared an image with the community.',
          image_url: imageUrl,
          community_id: id,
        })
        .select('*')
        .single();

      if (error) throw error;

      try {
        await supabase.rpc('process_post_hashtags', {
          post_id: data.id,
          content: data.content,
        });
      } catch (hashtagError) {
        console.warn('Hashtag processing skipped:', hashtagError);
      }

      setPostContent('');
      removePostFile();
      toast.success('Posted to the community');
      await fetchPosts();
    } catch (error) {
      console.error('Error creating community post:', error);
      toast.error(error?.message || 'Failed to publish post');
    } finally {
      setPosting(false);
    }
  };

  const scrollToDiscussions = () => {
    discussionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleShare = async () => {
    setShareLoading(true);
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${community.name} | BizBase`,
          text: community.description || `Join ${community.name} on BizBase`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Community link copied');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(url);
          toast.success('Community link copied');
        } catch (clipboardError) {
          console.error('Share error:', clipboardError);
          toast.error('Unable to share community');
        }
      }
    } finally {
      setShareLoading(false);
    }
  };

  const copyCommunityLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Community link copied');
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('Unable to copy link');
    }
  };

  const getInitials = (profile) => {
    const value = profile?.full_name || profile?.username || 'U';
    return value
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const memberList = useMemo(() => members.slice(0, 12), [members]);

  const pinnedPosts = useMemo(() => posts.filter((post) => post.is_pinned), [posts]);
  const regularPosts = useMemo(() => posts.filter((post) => !post.is_pinned), [posts]);
  const activeMembers = useMemo(() => members.slice(0, 8), [members]);
  const adminMembers = useMemo(
    () => members.filter((member) => ['admin', 'moderator'].includes(member.role)).slice(0, 6),
    [members]
  );

  const navigateSection = (view) => {
    setActiveView(view);
    window.setTimeout(() => {
      const target = document.getElementById(view === 'members' ? 'community-members-list' : `community-${view}`);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 20);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5 animate-pulse">
            <div className="h-9 bg-slate-200 rounded-lg w-32" />
            <div className="h-72 bg-slate-200 rounded-2xl" />
            <div className="grid lg:grid-cols-[1fr_320px] gap-5">
              <div className="space-y-4"><div className="h-32 bg-slate-200 rounded-xl" /><div className="h-72 bg-slate-200 rounded-xl" /></div>
              <div className="h-72 bg-slate-200 rounded-xl" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!community) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto p-6">
          <Button variant="outline" onClick={() => navigate('/communities')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Communities
          </Button>
          <Card>
            <CardContent className="p-10 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <h1 className="text-2xl font-semibold">Community not available</h1>
              <p className="text-muted-foreground mt-2">This community may have been removed or is not available.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'members', label: 'Members' },
    { id: 'about', label: 'About' },
  ];

  return (
    <DashboardLayout>
      <SEOHead
        title={`${community.name} | BizBase Communities`}
        description={community.description?.slice(0, 155) || `Join ${community.name} on BizBase and connect with like-minded professionals.`}
        path={`/communities/${community.id}`}
        type="article"
      />

      <div className="min-h-screen bg-[#f6f8fb]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <Button variant="ghost" onClick={() => navigate('/communities')} className="h-9 px-2 sm:px-3 text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Communities
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 bg-white"
                onClick={copyCommunityLink}
                title="Copy community link"
              >
                <Copy className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-9 bg-white"
                onClick={handleShare}
                disabled={shareLoading}
              >
                {shareLoading ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4 mr-1.5" />
                )}
                Share
              </Button>

              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 bg-white"
                      title="Community options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-52">
                    {isOwner && (
                      <DropdownMenuItem
                        onClick={() => {
                          setManagementSection('settings');
                          setManagementOpen(true);
                        }}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Community
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      onClick={() => {
                        setManagementSection('members');
                        setManagementOpen(true);
                      }}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Manage Members
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => {
                        setManagementSection('moderation');
                        setManagementOpen(true);
                      }}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Moderation
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={copyCommunityLink}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Community Link
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Professional community header */}
          <Card className="overflow-hidden border border-slate-200 shadow-sm rounded-2xl bg-white">
            <div className="relative h-48 sm:h-64 lg:h-72 bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800">
              {community.image_url && <img src={community.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                <div className="flex flex-wrap gap-2">
                  <Badge className={`${community.is_private ? 'bg-rose-500' : 'bg-emerald-500'} text-white border-0 shadow-sm`}>
                    {community.is_private ? <><Lock className="w-3 h-3 mr-1" /> Private</> : <><Globe className="w-3 h-3 mr-1" /> Public</>}
                  </Badge>
                  {isOwner && <Badge className="bg-white/15 text-white border border-white/30 backdrop-blur"><Crown className="w-3 h-3 mr-1" /> Owner</Badge>}
                </div>
                <Badge className="bg-white/10 text-white border border-white/20 backdrop-blur hidden sm:flex">
                  {community.activity_level === 'very_active' ? 'Very Active' : community.activity_level === 'active' ? 'Active' : community.activity_level === 'moderate' ? 'Moderate' : 'Quiet'}
                </Badge>
              </div>
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <div className="flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-white/75 mb-1">{community.category || 'Professional Community'}</p>
                    <h1 className="text-2xl sm:text-4xl font-bold tracking-tight truncate">{community.name}</h1>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-white/80">
                      <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {(community.members_count || 0).toLocaleString()} members</span>
                      <span>•</span>
                      <span>Professional community on BizBase</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 px-4 sm:px-6">
              <div className="flex items-center justify-between gap-3 py-2 overflow-x-auto">
                <div className="flex items-center gap-1 min-w-max">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigateSection(item.id)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${activeView === item.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  {isApprovedMember ? (
                    !isOwner && <Button variant="outline" size="sm" onClick={handleLeave} disabled={actionLoading}>Leave</Button>
                  ) : isPending ? (
                    <Button variant="outline" size="sm" disabled className="text-amber-700">Request Pending</Button>
                  ) : (
                    <Button size="sm" onClick={handleJoin} disabled={actionLoading} className="bg-blue-600 hover:bg-blue-700">
                      {actionLoading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <UserPlus className="w-4 h-4 mr-1.5" />}
                      {community.is_private ? 'Request to Join' : 'Join Community'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Community intro + stats */}
          <div id="community-home" className="scroll-mt-24 mt-5 grid lg:grid-cols-[1fr_320px] gap-5">
            <main className="min-w-0 space-y-5">
              <Card className="border-slate-200 shadow-sm rounded-2xl">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">About this community</p>
                      <p className="mt-2 text-sm sm:text-base text-slate-700 leading-7">
                        {community.description || 'A professional space to exchange ideas, knowledge, opportunities and meaningful conversations.'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 shrink-0 sm:min-w-[230px]">
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3"><p className="text-xs text-slate-500">Members</p><p className="text-lg font-bold mt-1">{(community.members_count || 0).toLocaleString()}</p></div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3"><p className="text-xs text-slate-500">Discussions</p><p className="text-lg font-bold mt-1">{posts.length}</p></div>
                    </div>
                  </div>
                  {Array.isArray(community.tags) && community.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-100">
                      {community.tags.map((tag, index) => <Badge key={`${tag}-${index}`} variant="secondary" className="bg-slate-100 text-slate-600"><Hash className="w-3 h-3 mr-1" />{tag}</Badge>)}
                    </div>
                  )}
                </CardContent>
              </Card>

              {isAdmin && pendingMembers.length > 0 && (
                <Card className="border-amber-200 bg-amber-50/60 shadow-sm rounded-2xl">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div><p className="font-semibold text-amber-900">{pendingMembers.length} join request{pendingMembers.length > 1 ? 's' : ''} waiting</p><p className="text-xs text-amber-800 mt-1">Review requests from Community Management.</p></div>
                    <Button size="sm" onClick={() => navigateSection('manage')} className="bg-amber-600 hover:bg-amber-700">Review Requests</Button>
                  </CardContent>
                </Card>
              )}

              {canViewContent && pinnedPosts.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Community highlights</p><h2 className="text-xl font-bold text-slate-900 mt-1">Pinned discussions</h2></div></div>
                  <div className="space-y-3">{pinnedPosts.slice(0, 2).map((post) => <EnhancedPostCard key={`pinned-${post.id}`} post={post} onEngagementUpdate={fetchPosts} />)}</div>
                </section>
              )}

              {!canViewContent && community.is_private ? (
                <Card className="border-amber-200 bg-white shadow-sm rounded-2xl">
                  <CardContent className="p-8 text-center">
                    <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto"><Lock className="w-5 h-5" /></div>
                    <h2 className="font-bold text-lg mt-4">Private community</h2>
                    <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">Request access to view discussions, participate and meet other members.</p>
                    {!isPending && <Button onClick={handleJoin} disabled={actionLoading} className="mt-5 bg-blue-600 hover:bg-blue-700"><UserPlus className="w-4 h-4 mr-2" /> Request to Join</Button>}
                  </CardContent>
                </Card>
              ) : (
                <>
                  {isApprovedMember && (
                    <Card className="border-slate-200 shadow-sm rounded-2xl" id="community-discussions">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 shrink-0"><AvatarImage src={profile?.avatar_url || undefined} /><AvatarFallback>{getInitials(profile)}</AvatarFallback></Avatar>
                          <div className="flex-1 min-w-0">
                            <Textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder={`Start a professional discussion in ${community.name}...`} className="min-h-[96px] resize-none border-slate-200 rounded-xl" maxLength={3000} />
                            {postPreview && <div className="relative mt-3 rounded-xl overflow-hidden border border-slate-200"><img src={postPreview} alt="Selected" className="w-full max-h-72 object-cover" /><Button type="button" variant="secondary" size="icon" onClick={removePostFile} className="absolute top-2 right-2 h-8 w-8 rounded-full"><X className="w-4 h-4" /></Button></div>}
                            <div className="flex items-center justify-between gap-2 mt-3"><div className="flex items-center gap-2"><input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFileChange} /><Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="text-blue-600"><ImagePlus className="w-4 h-4 mr-1.5" /> Photo</Button><span className="text-[11px] text-slate-400">{postContent.length}/3000</span></div><Button onClick={handleCreatePost} disabled={posting || (!postContent.trim() && !postFile)} className="bg-blue-600 hover:bg-blue-700">{posting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />} Publish</Button></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <section ref={discussionRef} className="scroll-mt-24 space-y-3">
                    <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Community feed</p><h2 className="text-xl font-bold text-slate-900 mt-1">Latest discussions</h2><p className="text-sm text-slate-500 mt-1">Ideas, questions, updates and opportunities shared by members.</p></div><Button variant="outline" size="icon" className="h-9 w-9 bg-white" onClick={fetchPosts} disabled={postsLoading}><RefreshCw className={`w-4 h-4 ${postsLoading ? 'animate-spin' : ''}`} /></Button></div>
                    {postsLoading ? <div className="space-y-4">{[1, 2].map((item) => <Card key={item} className="animate-pulse rounded-2xl"><CardContent className="p-5 space-y-3"><div className="h-10 bg-slate-200 rounded-full w-10" /><div className="h-4 bg-slate-200 rounded w-2/3" /><div className="h-20 bg-slate-200 rounded" /></CardContent></Card>)}</div> : regularPosts.length === 0 ? <Card className="border-dashed border-2 rounded-2xl"><CardContent className="p-10 text-center"><MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-300" /><h3 className="font-semibold text-lg">No discussions yet</h3><p className="text-sm text-slate-500 mt-1">{isApprovedMember ? 'Start the first professional conversation in this community.' : 'Join the community to participate in discussions.'}</p></CardContent></Card> : <div className="space-y-4">{regularPosts.map((post) => <EnhancedPostCard key={post.id} post={post} onEngagementUpdate={fetchPosts} />)}</div>}
                  </section>
                </>
              )}
            </main>

            <aside className="space-y-4 lg:sticky lg:top-24 self-start">
              <Card className="border-slate-200 shadow-sm rounded-2xl bg-white" id="community-members">
                <CardHeader className="pb-3"><CardTitle className="text-base flex items-center justify-between"><span className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" /> Community members</span><Badge variant="secondary">{community.members_count || members.length}</Badge></CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {canViewContent ? (activeMembers.length ? activeMembers.map((member) => { const p = member.profile; const name = p?.full_name || p?.username || 'BizBase Member'; return <button key={member.id} type="button" className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 text-left" onClick={() => p?.username && navigate(`/${p.username}`)}><Avatar className="h-9 w-9 shrink-0"><AvatarImage src={p?.avatar_url || undefined} /><AvatarFallback>{getInitials(p)}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="font-medium text-sm truncate">{name}</p><p className="text-[11px] text-slate-500 truncate">{p?.current_position || p?.company_name || 'Professional member'}</p></div>{member.user_id === community.user_id && <Crown className="w-4 h-4 text-amber-500" />}</button> }) : <p className="text-sm text-slate-500 text-center py-4">No members yet.</p>) : <p className="text-sm text-slate-500 text-center py-4">Members are visible after you join.</p>}
                  {canViewContent && members.length > 8 && <button type="button" onClick={() => navigateSection('members')} className="w-full text-xs font-medium text-blue-600 hover:underline pt-1">View all members</button>}
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm rounded-2xl" id="community-about">
                <CardHeader className="pb-3"><CardTitle className="text-base">Community information</CardTitle></CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex gap-3"><div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Shield className="w-4 h-4" /></div><div><p className="font-medium">Community access</p><p className="text-xs text-slate-500 mt-0.5">{community.is_private ? 'Private — membership is approval based.' : 'Public — professionals can discover and join.'}</p></div></div>
                  {community.rules && <div className="pt-3 border-t border-slate-100"><p className="font-medium mb-2">Community guidelines</p><p className="text-xs text-slate-600 whitespace-pre-wrap leading-5">{community.rules}</p></div>}
                  <Button variant="outline" className="w-full" onClick={handleShare} disabled={shareLoading}><Share2 className="w-4 h-4 mr-2" /> Invite / Share</Button>
                </CardContent>
              </Card>
            </aside>
          </div>

          {activeView === 'members' && canViewContent && (
            <section id="community-members-list" className="mt-5 scroll-mt-24">
              <Card className="border-slate-200 shadow-sm rounded-2xl">
                <CardHeader><CardTitle>All members</CardTitle></CardHeader>
                <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {members.map((member) => { const p = member.profile; return <button key={member.id} type="button" onClick={() => p?.username && navigate(`/${p.username}`)} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 text-left"><Avatar className="h-10 w-10"><AvatarImage src={p?.avatar_url || undefined} /><AvatarFallback>{getInitials(p)}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="font-medium text-sm truncate">{p?.full_name || p?.username || 'BizBase Member'}</p><p className="text-xs text-slate-500 truncate">{p?.current_position || p?.company_name || 'Professional member'}</p></div><Badge variant="secondary" className="capitalize">{member.user_id === community.user_id ? 'Owner' : member.role || 'member'}</Badge></button> })}
                </CardContent>
              </Card>
            </section>
          )}
          {activeView === 'about' && (
            <section id="community-about-full" className="mt-5 scroll-mt-24">
              <Card className="border-slate-200 shadow-sm rounded-2xl"><CardHeader><CardTitle>About {community.name}</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-6"><div><p className="text-sm text-slate-700 leading-7">{community.description || 'A professional community for knowledge sharing, networking and collaboration.'}</p></div><div className="rounded-xl bg-slate-50 border border-slate-100 p-4"><p className="font-semibold text-sm mb-2">Guidelines</p><p className="text-sm text-slate-600 whitespace-pre-wrap leading-6">{community.rules || 'Be respectful, stay on topic and contribute useful professional knowledge.'}</p></div></CardContent></Card>
            </section>
          )}
        </div>
        <CommunityManagementDialog
          open={managementOpen}
          onOpenChange={setManagementOpen}
          community={community}
          user={user}
          isOwner={isOwner}
          isAdmin={isAdmin}
          initialSection={managementSection}
          onCommunityUpdated={(updated) => {
            if (updated) {
              setCommunity(updated);
            }

            fetchCommunity();
            fetchMembership();
            fetchMembers();
            fetchPendingMembers();
            fetchPosts();
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default Community;
