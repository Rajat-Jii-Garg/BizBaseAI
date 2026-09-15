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
  Trash2, Send, ImagePlus, X, RefreshCw, Crown, UserCheck
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import SEOHead from '@/components/SEOHead';
import PostCard from '@/components/PostCard';

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

  const isOwner = !!user && community?.user_id === user.id;
  const isAdmin = isOwner || membership?.role === 'admin' || membership?.role === 'moderator';
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

      const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
      const likedIds = new Set(likes.map((like) => like.post_id));
      const repostedIds = new Set(reposts.map((repost) => repost.post_id));

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
        }))
      );
    } catch (error) {
      console.error('Error loading community posts:', error);
      toast.error(error?.message || 'Failed to load discussions');
    } finally {
      setPostsLoading(false);
    }
  }, [canViewContent, id, user]);

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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <Card className="overflow-hidden animate-pulse">
            <div className="h-48 sm:h-64 bg-slate-200" />
            <CardContent className="p-6 space-y-4">
              <div className="h-7 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-10 bg-slate-200 rounded w-48" />
            </CardContent>
          </Card>
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

  return (
    <DashboardLayout>
      <SEOHead
        title={`${community.name} | BizBase Communities`}
        description={community.description?.slice(0, 155) || `Join ${community.name} on BizBase and connect with like-minded professionals.`}
        path={`/communities/${community.id}`}
        type="article"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between gap-2">
            <Button variant="outline" onClick={() => navigate('/communities')} className="h-9 text-xs sm:text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Communities
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={copyCommunityLink} title="Copy community link">
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-9 text-xs sm:text-sm" onClick={handleShare} disabled={shareLoading}>
                {shareLoading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Share2 className="w-4 h-4 mr-1.5" />}
                Share
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border-0 shadow-xl bg-white">
            <div className="relative h-48 sm:h-64 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700">
              {community.image_url && (
                <img
                  src={community.image_url}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/10" />

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <Badge className={`${community.is_private ? 'bg-red-500' : 'bg-emerald-500'} text-white border-0 shadow-md`}>
                  {community.is_private ? <><Lock className="w-3 h-3 mr-1" />Private</> : <><Globe className="w-3 h-3 mr-1" />Public</>}
                </Badge>
                {isOwner && <Badge className="bg-white/20 text-white border border-white/30"><Crown className="w-3 h-3 mr-1" />Owner</Badge>}
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">{community.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs sm:text-sm text-white/90">
                  {community.category && <span>{community.category}</span>}
                  <span>•</span>
                  <span>{(community.members_count || 0).toLocaleString()} members</span>
                  <span>•</span>
                  <span>{community.activity_level === 'very_active' ? 'Very Active' : community.activity_level === 'active' ? 'Active' : community.activity_level === 'moderate' ? 'Moderate' : 'Quiet'}</span>
                </div>
              </div>
            </div>

            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                <div className="max-w-3xl">
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                    {community.description || 'Connect, share knowledge and grow with professionals in this community.'}
                  </p>

                  {Array.isArray(community.tags) && community.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {community.tags.map((tag, index) => (
                        <Badge key={`${tag}-${index}`} variant="secondary" className="bg-slate-100 text-xs">
                          <Hash className="w-3 h-3 mr-1" />{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  {isApprovedMember ? (
                    <>
                      {!isOwner && (
                        <Button variant="outline" onClick={handleLeave} disabled={actionLoading}>
                          Leave
                        </Button>
                      )}
                      <Button onClick={scrollToDiscussions} className="bg-teal-600 hover:bg-teal-700">
                        <MessageSquare className="w-4 h-4 mr-2" /> Discussions
                      </Button>
                    </>
                  ) : isPending ? (
                    <Button variant="outline" disabled className="text-amber-700 border-amber-200 bg-amber-50">
                      <Clock className="w-4 h-4 mr-2" /> Request Pending
                    </Button>
                  ) : (
                    <Button onClick={handleJoin} disabled={actionLoading} className="bg-gradient-to-r from-blue-600 to-purple-600">
                      {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
                      {community.is_private ? 'Request to Join' : 'Join Community'}
                    </Button>
                  )}

                  {isOwner && (
                    <Button variant="outline" onClick={handleDeleteCommunity} disabled={actionLoading} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                  )}
                </div>
              </div>

              {community.rules && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h2 className="font-semibold flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-blue-600" /> Community Guidelines
                  </h2>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{community.rules}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {!canViewContent && community.is_private && (
            <Card className="border-amber-200 bg-amber-50/70">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-amber-900">This is a private community</h2>
                  <p className="text-sm text-amber-800 mt-1">
                    Discussions and member content become available after the admin approves your request.
                  </p>
                </div>
                {!isPending && !isApprovedMember && (
                  <Button onClick={handleJoin} disabled={actionLoading} className="bg-amber-600 hover:bg-amber-700 shrink-0">
                    <UserPlus className="w-4 h-4 mr-2" /> Request to Join
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {isAdmin && pendingMembers.length > 0 && (
            <Card className="border-amber-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" /> Pending Join Requests
                  <Badge variant="secondary">{pendingMembers.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <button
                      type="button"
                      className="flex items-center gap-3 min-w-0 text-left"
                      onClick={() => member.profile?.username && navigate(`/${member.profile.username}`)}
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={member.profile?.avatar_url || undefined} />
                        <AvatarFallback>{getInitials(member.profile)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{member.profile?.full_name || member.profile?.username || 'BizBase Member'}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.profile?.current_position || member.profile?.company_name || member.profile?.username || 'Professional member'}</p>
                      </div>
                    </button>

                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApprove(member.id)}>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-red-600" onClick={() => handleReject(member.id)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start" ref={discussionRef}>
            <div className="space-y-4">
              {isApprovedMember && (
                <Card className="shadow-sm border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                          {(profile?.full_name?.[0] || profile?.username?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Textarea
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                          placeholder={`Share something with ${community.name}...`}
                          className="min-h-[100px] resize-none border-slate-200 focus-visible:ring-1"
                          maxLength={3000}
                        />

                        {postPreview && (
                          <div className="relative mt-3 rounded-xl overflow-hidden border border-slate-200">
                            <img src={postPreview} alt="Selected" className="w-full max-h-72 object-cover" />
                            <Button type="button" variant="secondary" size="icon" onClick={removePostFile} className="absolute top-2 right-2 h-8 w-8 rounded-full">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 mt-3">
                          <div className="flex items-center gap-1">
                            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFileChange} />
                            <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="text-blue-600">
                              <ImagePlus className="w-4 h-4 mr-1.5" /> Photo
                            </Button>
                            <span className="text-[11px] text-muted-foreground">{postContent.length}/3000</span>
                          </div>
                          <Button onClick={handleCreatePost} disabled={posting || (!postContent.trim() && !postFile)} className="bg-gradient-to-r from-blue-600 to-purple-600">
                            {posting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                            Post
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-teal-600" /> Discussions
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Posts and conversations from community members</p>
                </div>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={fetchPosts} disabled={postsLoading}>
                  <RefreshCw className={`w-4 h-4 ${postsLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {postsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((item) => (
                    <Card key={item} className="animate-pulse">
                      <CardContent className="p-5 space-y-3">
                        <div className="h-10 bg-slate-200 rounded-full w-10" />
                        <div className="h-4 bg-slate-200 rounded w-2/3" />
                        <div className="h-16 bg-slate-200 rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <Card className="border-dashed border-2">
                  <CardContent className="p-10 text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <h3 className="font-semibold text-lg">No discussions yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isApprovedMember ? 'Start the first conversation in this community.' : 'Join the community to participate in discussions.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} onEngagementUpdate={fetchPosts} />
                  ))}
                </div>
              )}
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" /> Members</span>
                    <Badge variant="secondary">{community.members_count || members.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {membersLoading ? (
                    <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin" /></div>
                  ) : memberList.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No members yet.</p>
                  ) : (
                    memberList.map((member) => {
                      const profile = member.profile;
                      const name = profile?.full_name || profile?.username || 'BizBase Member';
                      const isMemberOwner = member.user_id === community.user_id;

                      return (
                        <div key={member.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 group">
                          <button
                            type="button"
                            className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                            onClick={() => profile?.username && navigate(`/${profile.username}`)}
                          >
                            <Avatar className="h-9 w-9 shrink-0">
                              <AvatarImage src={profile?.avatar_url || undefined} />
                              <AvatarFallback>{getInitials(profile)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{name}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{profile?.current_position || profile?.company_name || 'Professional member'}</p>
                            </div>
                          </button>

                          {isMemberOwner ? (
                            <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                          ) : isAdmin ? (
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-red-500" onClick={() => handleRemoveMember(member)} title="Remove member">
                              <UserMinus className="w-3.5 h-3.5" />
                            </Button>
                          ) : null}
                        </div>
                      );
                    })
                  )}

                  {members.length > 12 && (
                    <p className="text-xs text-center text-muted-foreground pt-1">Showing first 12 members</p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4 text-blue-600" /> Community Access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    {community.is_private ? <Lock className="w-4 h-4 text-red-500 mt-0.5" /> : <Globe className="w-4 h-4 text-emerald-500 mt-0.5" />}
                    <div>
                      <p className="font-medium">{community.is_private ? 'Private' : 'Public'} community</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {community.is_private ? 'Membership requires admin approval.' : 'Anyone can discover and join.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <UserCheck className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Member participation</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Members can publish discussions, comment, react and share community content.</p>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" onClick={handleShare} disabled={shareLoading}>
                    <Share2 className="w-4 h-4 mr-2" /> Invite / Share Community
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Community;
