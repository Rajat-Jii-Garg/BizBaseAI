import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Building2, Briefcase, Globe, Calendar, Loader2, MessageCircle, Link2, TrendingUp, UserPlus, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const statCards = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { key: 'totalPosts', label: 'Total Posts', icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10' },
  { key: 'totalBusinesses', label: 'Businesses', icon: Building2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { key: 'totalJobs', label: 'Jobs', icon: Briefcase, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { key: 'totalCommunities', label: 'Communities', icon: Globe, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { key: 'totalEvents', label: 'Events', icon: Calendar, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { key: 'totalConnections', label: 'Connections', icon: Link2, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { key: 'totalMessages', label: 'Messages', icon: MessageCircle, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
];

const AdminDashboard = () => {
  const { fetchStats, fetchRecentActivity, fetchGrowthStats } = useAdmin();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchStats(), fetchRecentActivity(), fetchGrowthStats()]).then(([s, r, g]) => {
      setStats(s);
      setRecent(r);
      setGrowth(g);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Platform overview & real-time statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(({ key, label, icon: Icon, color, bg }) => (
          <Card key={key} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stats?.[key]?.toLocaleString() || 0}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              User Growth (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {growth?.userGrowth?.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={growth.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => format(new Date(v), 'dd MMM')} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip labelFormatter={(v) => format(new Date(v), 'dd MMM yyyy')} />
                  <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Post Activity (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {growth?.postGrowth?.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={growth.postGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => format(new Date(v), 'dd MMM')} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip labelFormatter={(v) => format(new Date(v), 'dd MMM yyyy')} />
                  <Area type="monotone" dataKey="count" stroke="#22c55e" fill="rgba(34,197,94,0.2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent?.recentUsers?.map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={u.avatar_url} />
                  <AvatarFallback className="text-xs">{u.full_name?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{u.full_name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(u.created_at), 'dd MMM yyyy')}</p>
                </div>
              </div>
            ))}
            {!recent?.recentUsers?.length && <p className="text-sm text-muted-foreground">No users yet</p>}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-500" />
              Recent Posts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent?.recentPosts?.map((p) => (
              <div key={p.id} className="space-y-1">
                <p className="text-sm text-foreground line-clamp-2">{p.content}</p>
                <p className="text-xs text-muted-foreground">by {p.profiles?.full_name || 'Unknown'} • {format(new Date(p.created_at), 'dd MMM')}</p>
              </div>
            ))}
            {!recent?.recentPosts?.length && <p className="text-sm text-muted-foreground">No posts yet</p>}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-orange-500" />
              Recent Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent?.recentJobs?.map((j) => (
              <div key={j.id} className="space-y-1">
                <p className="text-sm font-medium text-foreground">{j.title}</p>
                <p className="text-xs text-muted-foreground">{j.company_name} • {format(new Date(j.created_at), 'dd MMM')}</p>
              </div>
            ))}
            {!recent?.recentJobs?.length && <p className="text-sm text-muted-foreground">No jobs yet</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
