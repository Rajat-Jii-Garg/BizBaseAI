import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Calendar,
  Edit,
  Settings,
  Users,
  Briefcase,
  FileText,
  DollarSign,
  Eye,
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  Share2,
  ExternalLink,
  UserPlus,
  ArrowRight
} from 'lucide-react';
import BusinessLayout from '@/components/BusinessLayout';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const BusinessDashboard = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    services: 0,
    projects: 0,
    leads: 0,
    team: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentLeads, setRecentLeads] = useState([]);

  useEffect(() => {
    if (businessId) {
      fetchStats();
      fetchRecentLeads();
    }
  }, [businessId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch counts in parallel
      const [servicesRes, projectsRes, leadsRes, teamRes, transactionsRes] = await Promise.all([
        supabase.from('business_services').select('id', { count: 'exact', head: true }).eq('business_id', businessId),
        supabase.from('business_projects').select('id', { count: 'exact', head: true }).eq('business_id', businessId),
        supabase.from('business_leads').select('id', { count: 'exact', head: true }).eq('business_id', businessId),
        supabase.from('business_team_members').select('id', { count: 'exact', head: true }).eq('business_id', businessId),
        supabase.from('business_transactions').select('amount').eq('business_id', businessId).eq('type', 'income')
      ]);

      const totalRevenue = transactionsRes.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      setStats({
        services: servicesRes.count || 0,
        projects: projectsRes.count || 0,
        leads: leadsRes.count || 0,
        team: teamRes.count || 0,
        revenue: totalRevenue
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentLeads = async () => {
    try {
      const { data } = await supabase
        .from('business_leads')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      setRecentLeads(data || []);
    } catch (error) {
      console.error('Error fetching recent leads:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-yellow-100 text-yellow-700',
      qualified: 'bg-purple-100 text-purple-700',
      closed_won: 'bg-green-100 text-green-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const statCards = [
    { label: 'Profile Views', value: currentBusiness?.views_count || 0, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Followers', value: currentBusiness?.followers_count || 0, icon: Users, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
    { label: 'Total Leads', value: stats.leads, icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
    { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' }
  ];

  const quickActions = [
    { label: 'Add Service', icon: Package, path: `/business/${businessId}/services`, color: 'text-blue-600' },
    { label: 'Add Project', icon: Briefcase, path: `/business/${businessId}/projects`, color: 'text-green-600' },
    { label: 'Add Lead', icon: UserPlus, path: `/business/${businessId}/crm`, color: 'text-purple-600' },
    { label: 'Add Team Member', icon: Users, path: `/business/${businessId}/team`, color: 'text-orange-600' },
    { label: 'Record Transaction', icon: DollarSign, path: `/business/${businessId}/finance`, color: 'text-emerald-600' },
    { label: 'Settings', icon: Settings, path: `/business/${businessId}/settings`, color: 'text-gray-600' }
  ];

  return (
    <BusinessLayout>
      <div className="p-6 space-y-6">
        {/* Business Header Card */}
        <Card className="overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
            {currentBusiness?.banner_url && (
              <img src={currentBusiness.banner_url} alt="Banner" className="w-full h-full object-cover" />
            )}
          </div>
          
          {/* Business Info */}
          <CardContent className="relative pt-14 pb-4">
            {/* Logo */}
            <div className="absolute -top-10 left-6">
              <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
                <AvatarImage src={currentBusiness?.logo_url} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                  {currentBusiness?.name?.charAt(0)?.toUpperCase() || 'B'}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Actions */}
            <div className="absolute top-4 right-6 flex gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Edit Profile</span>
              </Button>
            </div>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">{currentBusiness?.name}</h1>
                  {currentBusiness?.is_verified && (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  <Badge variant="outline" className="capitalize">
                    {currentBusiness?.status}
                  </Badge>
                </div>
                
                {currentBusiness?.username && (
                  <p className="text-primary font-medium">@{currentBusiness.username}</p>
                )}
                
                <p className="text-muted-foreground">{currentBusiness?.category} • {currentBusiness?.industry}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {currentBusiness?.city}, {currentBusiness?.country}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {currentBusiness?.created_at ? formatDate(currentBusiness.created_at) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your business from here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {quickActions.map((action, index) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    className="h-auto py-4 flex-col gap-2 hover:bg-muted"
                    onClick={() => navigate(action.path)}
                  >
                    <action.icon className={`w-6 h-6 ${action.color}`} />
                    <span className="text-sm">{action.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <a href={`mailto:${currentBusiness?.email}`} className="text-sm text-primary hover:underline truncate block">
                    {currentBusiness?.email}
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <a href={`tel:${currentBusiness?.phone}`} className="text-sm text-primary hover:underline">
                    {currentBusiness?.phone}
                  </a>
                </div>
              </div>
              
              {currentBusiness?.website && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                    <Globe className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Website</p>
                    <a 
                      href={currentBusiness.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {currentBusiness.website.replace(/https?:\/\//, '').slice(0, 20)}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Leads</CardTitle>
              <CardDescription>Latest leads added to your CRM</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate(`/business/${businessId}/crm`)}>
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p>No leads yet</p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => navigate(`/business/${businessId}/crm`)}
                >
                  Add your first lead
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{lead.name?.charAt(0) || 'L'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">{lead.company || lead.email || 'No details'}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {currentBusiness?.description || 'No description added yet.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  );
};

export default BusinessDashboard;
