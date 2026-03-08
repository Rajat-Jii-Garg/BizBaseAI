import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, Users, FileText, BarChart3 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

const COLORS = ['hsl(var(--primary))', '#22c55e', '#a855f7', '#f97316', '#ec4899', '#06b6d4'];

const AdminAnalytics = () => {
  const { fetchStats, fetchGrowthStats } = useAdmin();
  const [stats, setStats] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchStats(), fetchGrowthStats()]).then(([s, g]) => {
      setStats(s);
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

  const pieData = [
    { name: 'Users', value: stats?.totalUsers || 0 },
    { name: 'Posts', value: stats?.totalPosts || 0 },
    { name: 'Businesses', value: stats?.totalBusinesses || 0 },
    { name: 'Jobs', value: stats?.totalJobs || 0 },
    { name: 'Communities', value: stats?.totalCommunities || 0 },
    { name: 'Events', value: stats?.totalEvents || 0 },
  ].filter(d => d.value > 0);

  const overviewData = [
    { name: 'Users', count: stats?.totalUsers || 0 },
    { name: 'Posts', count: stats?.totalPosts || 0 },
    { name: 'Business', count: stats?.totalBusinesses || 0 },
    { name: 'Jobs', count: stats?.totalJobs || 0 },
    { name: 'Communities', count: stats?.totalCommunities || 0 },
    { name: 'Events', count: stats?.totalEvents || 0 },
    { name: 'Connections', count: stats?.totalConnections || 0 },
    { name: 'Messages', count: stats?.totalMessages || 0 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Platform growth & engagement metrics</p>
      </div>

      {/* Platform Overview Bar Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Platform Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={overviewData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              User Signups (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {growth?.userGrowth?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={growth.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => format(new Date(v), 'dd')} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip labelFormatter={(v) => format(new Date(v), 'dd MMM yyyy')} />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="rgba(59,130,246,0.2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-12 text-center">No signup data in the last 30 days</p>
            )}
          </CardContent>
        </Card>

        {/* Post Activity */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-500" />
              Post Activity (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {growth?.postGrowth?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={growth.postGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => format(new Date(v), 'dd')} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip labelFormatter={(v) => format(new Date(v), 'dd MMM yyyy')} />
                  <Area type="monotone" dataKey="count" stroke="#22c55e" fill="rgba(34,197,94,0.2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-12 text-center">No post data in the last 30 days</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Distribution Pie */}
      {pieData.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Content Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminAnalytics;
