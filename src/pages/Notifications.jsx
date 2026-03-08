import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Heart, MessageSquare, UserPlus, Share2, Check, X, Loader2, CheckCheck } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionRequests, setConnectionRequests] = useState([]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchConnectionRequests();

      const channel = supabase
        .channel('notif-page-realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => fetchNotifications())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'connections', filter: `addressee_id=eq.${user.id}` }, () => fetchConnectionRequests())
        .subscribe();

      return () => supabase.removeChannel(channel);
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;

      const userIds = [...new Set((data || []).map(n => n.related_user_id).filter(Boolean))];
      let profiles = [];
      if (userIds.length > 0) {
        const { data: p } = await supabase.from('profiles').select('id, full_name, avatar_url, username').in('id', userIds);
        profiles = p || [];
      }

      setNotifications((data || []).map(n => ({
        ...n,
        related_user: profiles.find(p => p.id === n.related_user_id),
      })));
    } catch (e) {
      console.error('Error fetching notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectionRequests = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('connections')
        .select('id, requester_id, created_at')
        .eq('addressee_id', user.id)
        .eq('status', 'pending');

      if (!data || data.length === 0) { setConnectionRequests([]); return; }

      const ids = data.map(r => r.requester_id);
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url, current_position, company_name').in('id', ids);

      setConnectionRequests(data.map(r => ({
        ...r,
        profile: (profiles || []).find(p => p.id === r.requester_id) || {},
      })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleConnectionRequest = async (requestId, action) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: action === 'accept' ? 'accepted' : 'rejected', updated_at: new Date().toISOString() })
        .eq('id', requestId);
      if (error) throw error;
      toast.success(action === 'accept' ? 'Connection accepted!' : 'Request declined');
      fetchConnectionRequests();
    } catch (e) {
      toast.error('Failed to update request');
    }
  };

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = async () => {
    await supabase.from('notifications').update({ read: true }).eq('user_id', user?.id).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const getIcon = (type) => {
    const icons = {
      like: <Heart className="w-4 h-4 text-red-500" />,
      comment: <MessageSquare className="w-4 h-4 text-blue-500" />,
      share: <Share2 className="w-4 h-4 text-green-500" />,
      connection: <UserPlus className="w-4 h-4 text-purple-500" />,
      follow: <UserPlus className="w-4 h-4 text-indigo-500" />,
      repost: <Share2 className="w-4 h-4 text-orange-500" />,
      event: <Bell className="w-4 h-4 text-yellow-500" />,
      job_application: <Bell className="w-4 h-4 text-emerald-500" />,
      community: <Bell className="w-4 h-4 text-cyan-500" />,
    };
    return icons[type] || <Bell className="w-4 h-4 text-muted-foreground" />;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Bell className="w-6 h-6 text-primary" /> Notifications
                {unreadCount > 0 && <Badge className="bg-red-500 text-white">{unreadCount}</Badge>}
              </CardTitle>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {connectionRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2 text-base">
                <UserPlus className="w-5 h-5 text-purple-600" /> Connection Requests
                <Badge variant="secondary">{connectionRequests.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {connectionRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={req.profile.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary">{req.profile.full_name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground text-sm">{req.profile.full_name}</p>
                      <p className="text-xs text-muted-foreground">{req.profile.current_position}{req.profile.company_name ? ` at ${req.profile.company_name}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleConnectionRequest(req.id, 'accept')} className="bg-green-600 hover:bg-green-700 text-white">
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleConnectionRequest(req.id, 'reject')}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="text-foreground">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Notifications</h3>
                <p className="text-muted-foreground">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      !n.read ? 'bg-primary/5 border-primary/20' : 'bg-card border-border hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      if (!n.read) markAsRead(n.id);
                      if (n.related_id && n.related_user?.username) {
                        navigate(`/${n.related_user.username}/post/${n.related_id}`);
                      }
                    }}
                  >
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      <AvatarImage src={n.related_user?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">{n.related_user?.full_name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getIcon(n.type)}
                        <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                        {!n.read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
                      </div>
                      {n.content && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.content}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
