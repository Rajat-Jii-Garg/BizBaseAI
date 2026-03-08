import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Building2, Briefcase, Globe, Calendar, Loader2, MessageSquare, Link2, TrendingUp, UserPlus, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const statCards = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { key: 'totalPosts', label: 'Total Posts', icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10' },
  { key: 'totalBusinesses', label: 'Businesses', icon: Building2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { key: 'totalJobs', label: 'Jobs', icon: Briefcase, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { key: 'totalCommunities', label: 'Communities', icon: Globe, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { key: 'totalEvents', label: 'Events', icon: Calendar, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { key: 'totalConnections', label: 'Connections', icon: Link2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { key: 'totalMessages', label: 'Messages', icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-500/10' },
];

const AdminDashboard = () => {
  const { fetchStats, fetchRecentActivity, fetchGrowthData } = useAdmin();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchStats(),
      fetchRecentActivity(),
      fetchGrowthData(),
    ]).then(([s, a, g]) => {
      setStats(s);
      setActivity(a);
      setGrowthData(g);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Platform overview & real-time statistics</p>
      </div>

      {/* Quick Stats Highlight */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">New Users (7d)</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{stats?.recentUsers || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">New Posts (7d)</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{stats?.recentPosts || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">New Biz (7d)</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{stats?.recentBusinesses || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Monthly Users</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{stats?.monthlyUsers || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* All Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {statCards.map(({ key, label, icon: Icon, color, bg }) => (
          <Card key={key} className="border-border/50">
            <CardContent className="pt-5 pb-4">
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

      {/* Growth Chart */}
      {growthData.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Growth (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} interval={4} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorUsers)" name="Users" />
                  <Area type="monotone" dataKey="posts" stroke="#22c55e" fillOpacity={1} fill="url(#colorPosts)" name="Posts" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Users */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity?.recentUsers?.map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={u.avatar_url} />
                  <AvatarFallback className="text-xs">{u.full_name?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{u.full_name || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {format(new Date(u.created_at), 'dd MMM')}
                </span>
              </div>
            ))}
            {(!activity?.recentUsers || activity.recentUsers.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No recent users</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-500" />
              Recent Posts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity?.recentPosts?.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={p.profiles?.avatar_url} />
                  <AvatarFallback className="text-xs">{p.profiles?.full_name?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.profiles?.full_name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.content?.substring(0, 60)}...</p>
                </div>
              </div>
            ))}
            {(!activity?.recentPosts || activity.recentPosts.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No recent posts</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Businesses */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-500" />
              Recent Businesses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity?.recentBusinesses?.map((b) => (
              <div key={b.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={b.logo_url} />
                  <AvatarFallback className="text-xs">{b.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{b.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{b.industry}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {format(new Date(b.created_at), 'dd MMM')}
                </span>
              </div>
            ))}
            {(!activity?.recentBusinesses || activity.recentBusinesses.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No recent businesses</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
