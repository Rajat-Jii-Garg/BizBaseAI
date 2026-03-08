import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Building2, Briefcase, Globe, Calendar, Loader2 } from 'lucide-react';

const statCards = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: 'text-blue-500' },
  { key: 'totalPosts', label: 'Total Posts', icon: FileText, color: 'text-green-500' },
  { key: 'totalBusinesses', label: 'Businesses', icon: Building2, color: 'text-purple-500' },
  { key: 'totalJobs', label: 'Jobs', icon: Briefcase, color: 'text-orange-500' },
  { key: 'totalCommunities', label: 'Communities', icon: Globe, color: 'text-pink-500' },
  { key: 'totalEvents', label: 'Events', icon: Calendar, color: 'text-cyan-500' },
];

const AdminDashboard = () => {
  const { fetchStats } = useAdmin();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats().then((s) => {
      setStats(s);
      setLoading(false);
    });
  }, [fetchStats]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Platform overview & statistics</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map(({ key, label, icon: Icon, color }) => (
            <Card key={key} className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {stats?.[key]?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl bg-accent/50`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
