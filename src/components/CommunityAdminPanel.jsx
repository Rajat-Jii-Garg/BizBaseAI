import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Shield,
  UserMinus,
  Ban,
  Flag,
  Pin,
  PinOff,
  Save,
  Loader2,
  CheckCircle2,
  X,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CommunityAdminPanel = ({
  community,
  user,
  isOwner,
  isAdmin,
  onCommunityUpdated,
}) => {
  const [members, setMembers] = useState([]);
  const [pending, setPending] = useState([]);
  const [bans, setBans] = useState([]);
  const [reports, setReports] = useState([]);
  const [posts, setPosts] = useState([]);
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('settings');

  const [form, setForm] = useState({
    name: community?.name || '',
    description: community?.description || '',
    category: community?.category || '',
    is_private: Boolean(community?.is_private),
    rules: community?.rules || '',
  });

  useEffect(() => {
    setForm({
      name: community?.name || '',
      description: community?.description || '',
      category: community?.category || '',
      is_private: Boolean(community?.is_private),
      rules: community?.rules || '',
    });
  }, [community]);

  const loadData = useCallback(async () => {
    if (!community?.id || !user || !isAdmin) return;

    setLoading(true);
    try {
      const [{ data: memberRows, error: memberError }, { data: banRows, error: banError }, { data: reportRows, error: reportError }, { data: postRows, error: postError }, { data: pinRows, error: pinError }] = await Promise.all([
        supabase
          .from('community_members')
          .select('id, user_id, role, status, joined_at')
          .eq('community_id', community.id)
          .order('joined_at', { ascending: false }),
        supabase
          .from('community_bans')
          .select('id, user_id, banned_by, reason, created_at')
          .eq('community_id', community.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('community_reports')
          .select('id, post_id, reported_by, reason, details, status, created_at')
          .eq('community_id', community.id)
          .in('status', ['open', 'reviewing'])
          .order('created_at', { ascending: false }),
        supabase
          .from('posts')
          .select('id, user_id, content, created_at')
          .eq('community_id', community.id)
          .order('created_at', { ascending: false })
          .limit(12),
        supabase
          .from('community_pins')
          .select('id, post_id, pinned_by, created_at')
          .eq('community_id', community.id)
          .order('created_at', { ascending: false }),
      ]);

      if (memberError) throw memberError;
      if (banError) throw banError;
      if (reportError) throw reportError;
      if (postError) throw postError;
      if (pinError) throw pinError;

      const ids = [
        ...(memberRows || []).map((row) => row.user_id),
        ...(banRows || []).map((row) => row.user_id),
        ...(reportRows || []).map((row) => row.reported_by),
        ...(postRows || []).map((row) => row.user_id),
      ].filter(Boolean);

      const uniqueIds = [...new Set(ids)];
      let profileRows = [];

      if (uniqueIds.length) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, current_position, company_name')
          .in('id', uniqueIds);
        if (error) throw error;
        profileRows = data || [];
      }

      const profileMap = new Map(profileRows.map((row) => [row.id, row]));
      const enrich = (row) => ({ ...row, profile: profileMap.get(row.user_id) || null });

      setMembers((memberRows || []).filter((row) => row.status === 'approved').map(enrich));
      setPending((memberRows || []).filter((row) => row.status === 'pending').map(enrich));
      setBans((banRows || []).map(enrich));
      setReports((reportRows || []).map((row) => ({ ...row, profile: profileMap.get(row.reported_by) || null })));
      setPosts(postRows || []);
      setPins(pinRows || []);
    } catch (error) {
      console.error('Community admin panel load error:', error);
      toast.error(error?.message || 'Failed to load community management data');
    } finally {
      setLoading(false);
    }
  }, [community?.id, isAdmin, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const pinnedIds = useMemo(() => new Set(pins.map((pin) => pin.post_id)), [pins]);

  const saveSettings = async () => {
    if (!isOwner || !community?.id) return;
    if (!form.name.trim() || !form.category.trim() || !form.rules.trim()) {
      toast.error('Name, category and guidelines are required');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('communities')
        .update({
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category.trim(),
          is_private: form.is_private,
          rules: form.rules.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', community.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Community settings updated');
      onCommunityUpdated?.(data);
    } catch (error) {
      toast.error(error?.message || 'Failed to update community');
    } finally {
      setSaving(false);
    }
  };

  const approve = async (memberId) => {
    try {
      const { error } = await supabase
        .from('community_members')
        .update({ status: 'approved' })
        .eq('id', memberId)
        .eq('community_id', community.id)
        .eq('status', 'pending');
      if (error) throw error;
      toast.success('Member approved');
      await loadData();
      onCommunityUpdated?.();
    } catch (error) {
      toast.error(error?.message || 'Failed to approve member');
    }
  };

  const reject = async (memberId) => {
    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('id', memberId)
        .eq('community_id', community.id)
        .eq('status', 'pending');
      if (error) throw error;
      toast.success('Request declined');
      await loadData();
    } catch (error) {
      toast.error(error?.message || 'Failed to decline request');
    }
  };

  const changeRole = async (member, role) => {
    if (!isOwner || member.user_id === community.user_id) return;
    try {
      const { error } = await supabase
        .from('community_members')
        .update({ role })
        .eq('id', member.id)
        .eq('community_id', community.id)
        .eq('status', 'approved');
      if (error) throw error;
      toast.success(`Role changed to ${role}`);
      await loadData();
    } catch (error) {
      toast.error(error?.message || 'Failed to change role');
    }
  };

  const removeMember = async (member) => {
    if (!isAdmin || member.user_id === community.user_id) return;
    const name = member.profile?.full_name || member.profile?.username || 'this member';
    if (!window.confirm(`Remove ${name} from ${community.name}?`)) return;

    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('id', member.id)
        .eq('community_id', community.id);
      if (error) throw error;
      toast.success('Member removed');
      await loadData();
      onCommunityUpdated?.();
    } catch (error) {
      toast.error(error?.message || 'Failed to remove member');
    }
  };

  const banMember = async (member) => {
    if (!isAdmin || member.user_id === community.user_id) return;
    const name = member.profile?.full_name || member.profile?.username || 'this member';
    if (!window.confirm(`Ban ${name} from ${community.name}?`)) return;

    try {
      const { error: banError } = await supabase
        .from('community_bans')
        .insert({
          community_id: community.id,
          user_id: member.user_id,
          banned_by: user.id,
          reason: 'Community moderation',
        });
      if (banError && banError.code !== '23505') throw banError;

      const { error: removeError } = await supabase
        .from('community_members')
        .delete()
        .eq('id', member.id)
        .eq('community_id', community.id);
      if (removeError) throw removeError;

      toast.success('Member banned');
      await loadData();
      onCommunityUpdated?.();
    } catch (error) {
      toast.error(error?.message || 'Failed to ban member');
    }
  };

  const unban = async (ban) => {
    try {
      const { error } = await supabase
        .from('community_bans')
        .delete()
        .eq('id', ban.id)
        .eq('community_id', community.id);
      if (error) throw error;
      toast.success('Member unbanned');
      await loadData();
    } catch (error) {
      toast.error(error?.message || 'Failed to unban member');
    }
  };

  const togglePin = async (postId) => {
    try {
      if (pinnedIds.has(postId)) {
        const { error } = await supabase
          .from('community_pins')
          .delete()
          .eq('community_id', community.id)
          .eq('post_id', postId);
        if (error) throw error;
        toast.success('Post unpinned');
      } else {
        const { error } = await supabase
          .from('community_pins')
          .insert({
            community_id: community.id,
            post_id: postId,
            pinned_by: user.id,
          });
        if (error) throw error;
        toast.success('Post pinned');
      }
      await loadData();
    } catch (error) {
      toast.error(error?.message || 'Failed to update pinned post');
    }
  };

  const resolveReport = async (report, action) => {
    try {
      if (action === 'delete' && report.post_id) {
        const { error: deleteError } = await supabase
          .from('posts')
          .delete()
          .eq('id', report.post_id)
          .eq('community_id', community.id);
        if (deleteError) throw deleteError;
      }

      const { error } = await supabase
        .from('community_reports')
        .update({
          status: action === 'dismiss' ? 'dismissed' : 'resolved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', report.id)
        .eq('community_id', community.id);
      if (error) throw error;

      toast.success(action === 'delete' ? 'Post removed and report resolved' : action === 'dismiss' ? 'Report dismissed' : 'Report resolved');
      await loadData();
    } catch (error) {
      toast.error(error?.message || 'Failed to resolve report');
    }
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Community link copied');
    } catch {
      toast.error('Unable to copy link');
    }
  };

  if (!isAdmin) return null;

  return (
    <Card className="border-blue-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            Community Management
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyInvite}>
              <Copy className="w-3.5 h-3.5 mr-1.5" /> Invite Link
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={loadData} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            ['settings', 'Settings'],
            ['requests', `Requests (${pending.length})`],
            ['members', `Members (${members.length})`],
            ['moderation', `Moderation (${reports.length})`],
          ].map(([key, label]) => (
            <Button
              key={key}
              size="sm"
              variant={activeSection === key ? 'default' : 'outline'}
              onClick={() => setActiveSection(key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {activeSection === 'settings' && (
          <div className="grid gap-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                disabled={!isOwner}
                placeholder="Community name"
              />
              <Input
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                disabled={!isOwner}
                placeholder="Category"
              />
            </div>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              disabled={!isOwner}
              placeholder="Community description"
              rows={3}
            />
            <Textarea
              value={form.rules}
              onChange={(e) => setForm((p) => ({ ...p, rules: e.target.value }))}
              disabled={!isOwner}
              placeholder="Community guidelines"
              rows={4}
            />
            <label className="flex items-center justify-between rounded-xl border p-3">
              <span>
                <span className="block text-sm font-medium">Private community</span>
                <span className="block text-xs text-muted-foreground">Members require approval to enter.</span>
              </span>
              <input
                type="checkbox"
                checked={form.is_private}
                disabled={!isOwner}
                onChange={(e) => setForm((p) => ({ ...p, is_private: e.target.checked }))}
              />
            </label>
            {isOwner && (
              <Button onClick={saveSettings} disabled={saving} className="w-fit">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Settings
              </Button>
            )}
          </div>
        )}

        {activeSection === 'requests' && (
          <div className="space-y-2">
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No pending join requests.</p>
            ) : pending.map((member) => (
              <div key={member.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border bg-slate-50">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={member.profile?.avatar_url || undefined} />
                    <AvatarFallback>{(member.profile?.full_name || 'U').slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{member.profile?.full_name || member.profile?.username || 'BizBase Member'}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.profile?.current_position || member.profile?.company_name || 'Professional Member'}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" onClick={() => approve(member.id)} className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="w-3.5 h-3.5 mr-1" />Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => reject(member.id)} className="text-red-600"><X className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'members' && (
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-9 w-9"><AvatarImage src={member.profile?.avatar_url || undefined} /><AvatarFallback>{(member.profile?.full_name || 'U').slice(0, 1).toUpperCase()}</AvatarFallback></Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{member.profile?.full_name || member.profile?.username || 'BizBase Member'}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.profile?.current_position || member.profile?.company_name || 'Professional Member'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {member.user_id === community.user_id ? (
                    <Badge><Shield className="w-3 h-3 mr-1" />Owner</Badge>
                  ) : (
                    <>
                      {isOwner ? (
                        <select value={member.role || 'member'} onChange={(e) => changeRole(member, e.target.value)} className="h-8 rounded-md border bg-background px-2 text-xs">
                          <option value="member">Member</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : <Badge variant="secondary">{member.role || 'member'}</Badge>}
                      <Button size="icon" variant="outline" className="h-8 w-8" title="Remove" onClick={() => removeMember(member)}><UserMinus className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="outline" className="h-8 w-8 text-red-600" title="Ban" onClick={() => banMember(member)}><Ban className="w-3.5 h-3.5" /></Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {members.length === 0 && <p className="text-sm text-muted-foreground py-4">No approved members found.</p>}
          </div>
        )}

        {activeSection === 'moderation' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2"><Flag className="w-4 h-4" />Open Reports</h3>
              {reports.length === 0 ? <p className="text-sm text-muted-foreground">No open reports.</p> : reports.map((report) => (
                <div key={report.id} className="p-3 rounded-xl border mb-2">
                  <p className="text-sm font-medium">{report.reason}</p>
                  {report.details && <p className="text-xs text-muted-foreground mt-1">{report.details}</p>}
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => resolveReport(report, 'dismiss')}>Dismiss</Button>
                    {report.post_id && <Button size="sm" variant="destructive" onClick={() => resolveReport(report, 'delete')}>Delete Post</Button>}
                    <Button size="sm" onClick={() => resolveReport(report, 'resolve')}>Resolve</Button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2"><Pin className="w-4 h-4" />Recent Posts</h3>
              <div className="space-y-2">
                {posts.map((post) => (
                  <div key={post.id} className="p-3 rounded-xl border flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">{post.id}</p>
                      <p className="text-sm line-clamp-2">{post.content}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => togglePin(post.id)} className="shrink-0">
                      {pinnedIds.has(post.id) ? <><PinOff className="w-3.5 h-3.5 mr-1" />Unpin</> : <><Pin className="w-3.5 h-3.5 mr-1" />Pin</>}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2"><Ban className="w-4 h-4" />Banned Members</h3>
              {bans.length === 0 ? <p className="text-sm text-muted-foreground">No banned members.</p> : bans.map((ban) => (
                <div key={ban.id} className="flex items-center justify-between p-3 rounded-xl border mb-2">
                  <div><p className="text-sm font-medium">{ban.profile?.full_name || ban.profile?.username || ban.user_id}</p><p className="text-xs text-muted-foreground">{ban.reason || 'Community moderation'}</p></div>
                  <Button size="sm" variant="outline" onClick={() => unban(ban)}>Unban</Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunityAdminPanel;
