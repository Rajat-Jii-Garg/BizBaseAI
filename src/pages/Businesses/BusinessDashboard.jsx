import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, Mail, Phone, Globe, MapPin, Calendar, Edit, Settings,
  Users, Briefcase, DollarSign, Eye, TrendingUp, Package, CheckCircle,
  Share2, ExternalLink, UserPlus, ArrowRight, ArrowUpRight, ArrowDownRight,
  Clock, FolderKanban, Target, Activity, Zap, BarChart3, PieChart,
  Star, AlertCircle, ChevronRight
} from 'lucide-react';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const BusinessDashboard = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    services: 0, projects: 0, leads: 0, team: 0, revenue: 0, expenses: 0,
    activeProjects: 0, completedProjects: 0, newLeads: 0, contactedLeads: 0,
    activeServices: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);

  useEffect(() => {
    if (currentBusiness?.id) {
      fetchAllData();
    }
  }, [currentBusiness?.id]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const bid = currentBusiness.id;

      const [servicesRes, projectsRes, leadsRes, teamRes, incomeRes, expenseRes,
             activeProjectsRes, completedProjectsRes, newLeadsRes, contactedLeadsRes,
             activeServicesRes, recentLeadsRes, recentTxRes, recentProjRes] = await Promise.all([
        supabase.from('business_services').select('id', { count: 'exact', head: true }).eq('business_id', bid),
        supabase.from('business_projects').select('id', { count: 'exact', head: true }).eq('business_id', bid),
        supabase.from('business_leads').select('id', { count: 'exact', head: true }).eq('business_id', bid),
        supabase.from('business_team_members').select('id', { count: 'exact', head: true }).eq('business_id', bid),
        supabase.from('business_transactions').select('amount').eq('business_id', bid).eq('type', 'income'),
        supabase.from('business_transactions').select('amount').eq('business_id', bid).eq('type', 'expense'),
        supabase.from('business_projects').select('id', { count: 'exact', head: true }).eq('business_id', bid).eq('status', 'active'),
        supabase.from('business_projects').select('id', { count: 'exact', head: true }).eq('business_id', bid).eq('status', 'completed'),
        supabase.from('business_leads').select('id', { count: 'exact', head: true }).eq('business_id', bid).eq('status', 'new'),
        supabase.from('business_leads').select('id', { count: 'exact', head: true }).eq('business_id', bid).eq('status', 'contacted'),
        supabase.from('business_services').select('id', { count: 'exact', head: true }).eq('business_id', bid).eq('is_active', true),
        supabase.from('business_leads').select('*').eq('business_id', bid).order('created_at', { ascending: false }).limit(5),
        supabase.from('business_transactions').select('*').eq('business_id', bid).order('created_at', { ascending: false }).limit(5),
        supabase.from('business_projects').select('*').eq('business_id', bid).order('created_at', { ascending: false }).limit(4),
      ]);

      const totalIncome = incomeRes.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const totalExpense = expenseRes.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      setStats({
        services: servicesRes.count || 0,
        projects: projectsRes.count || 0,
        leads: leadsRes.count || 0,
        team: teamRes.count || 0,
        revenue: totalIncome,
        expenses: totalExpense,
        activeProjects: activeProjectsRes.count || 0,
        completedProjects: completedProjectsRes.count || 0,
        newLeads: newLeadsRes.count || 0,
        contactedLeads: contactedLeadsRes.count || 0,
        activeServices: activeServicesRes.count || 0,
      });
      setRecentLeads(recentLeadsRes.data || []);
      setRecentTransactions(recentTxRes.data || []);
      setRecentProjects(recentProjRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const profit = stats.revenue - stats.expenses;

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      contacted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      qualified: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      closed_won: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      closed_lost: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      on_hold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getProjectProgress = (project) => {
    if (project.status === 'completed') return 100;
    if (project.status === 'active' && project.start_date) {
      const start = new Date(project.start_date);
      const end = project.end_date ? new Date(project.end_date) : new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000);
      const now = new Date();
      const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
      return Math.round(progress);
    }
    return 0;
  };

  // Overview stat cards
  const overviewCards = [
    { label: 'Total Revenue', value: formatCurrency(stats.revenue), icon: DollarSign, trend: '+12%', trendUp: true, color: 'from-emerald-500 to-green-600' },
    { label: 'Total Leads', value: stats.leads, icon: UserPlus, sub: `${stats.newLeads} new`, trend: '+8%', trendUp: true, color: 'from-blue-500 to-indigo-600' },
    { label: 'Active Projects', value: stats.activeProjects, icon: FolderKanban, sub: `${stats.completedProjects} done`, trend: null, color: 'from-violet-500 to-purple-600' },
    { label: 'Team Members', value: stats.team, icon: Users, sub: `${stats.activeServices} services`, trend: null, color: 'from-orange-500 to-amber-600' },
  ];

  const quickActions = [
    { label: 'Add Service', icon: Package, path: `/business/${slug}/services`, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
    { label: 'New Project', icon: FolderKanban, path: `/business/${slug}/projects`, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
    { label: 'Add Lead', icon: Target, path: `/business/${slug}/crm`, color: 'text-green-600 bg-green-50 dark:bg-green-950/30' },
    { label: 'Add Member', icon: UserPlus, path: `/business/${slug}/team`, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30' },
    { label: 'Transaction', icon: DollarSign, path: `/business/${slug}/finance`, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Settings', icon: Settings, path: `/business/${slug}/settings`, color: 'text-slate-600 bg-slate-50 dark:bg-slate-950/30' },
  ];

  return (
    <div className="p-3 md:p-5 space-y-4 max-w-[1400px] mx-auto text-[13px]">
      {/* Business Profile Card */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="h-24 sm:h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
          {currentBusiness?.banner_url && (
            <img src={currentBusiness.banner_url} alt="Banner" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
        
        <CardContent className="relative pt-10 sm:pt-12 pb-4 px-4 sm:px-6">
          <div className="absolute -top-8 sm:-top-10 left-4 sm:left-6">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-background shadow-lg">
              <AvatarImage src={currentBusiness?.logo_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl sm:text-2xl font-bold">
                {currentBusiness?.name?.charAt(0)?.toUpperCase() || 'B'}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="absolute top-2 sm:top-4 right-4 sm:right-6 flex gap-2">
            <Button variant="secondary" size="sm" className="text-xs sm:text-sm h-8">
              <Share2 className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button variant="secondary" size="sm" className="text-xs sm:text-sm h-8"
              onClick={() => navigate(`/business/${slug}/settings`)}>
              <Edit className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-foreground">{currentBusiness?.name}</h1>
              {currentBusiness?.is_verified && (
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />Verified
                </Badge>
              )}
              <Badge variant="outline" className="capitalize text-xs">{currentBusiness?.status}</Badge>
            </div>
            {currentBusiness?.username && <p className="text-primary font-medium text-sm">@{currentBusiness.username}</p>}
            <p className="text-muted-foreground text-xs sm:text-sm">{currentBusiness?.category} • {currentBusiness?.industry}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {(currentBusiness?.city || currentBusiness?.country) && (
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{[currentBusiness?.city, currentBusiness?.country].filter(Boolean).join(', ')}</span>
              )}
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />
                Joined {currentBusiness?.created_at ? formatDate(currentBusiness.created_at) : 'N/A'}
              </span>
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{currentBusiness?.views_count || 0} views</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {overviewCards.map((card, i) => (
          <Card key={i} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color} text-white`}>
                  <card.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                {card.trend && (
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {card.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {card.trend}
                  </span>
                )}
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
              {card.sub && <p className="text-xs text-primary mt-1">{card.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial Summary + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Financial Overview */}
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Revenue</span>
                <span className="text-sm font-semibold text-green-600">{formatCurrency(stats.revenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expenses</span>
                <span className="text-sm font-semibold text-red-600">{formatCurrency(stats.expenses)}</span>
              </div>
              <div className="border-t border-border pt-2 flex items-center justify-between">
                <span className="text-sm font-medium">Net Profit</span>
                <span className={`text-sm font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(profit)}
                </span>
              </div>
            </div>
            {stats.revenue > 0 && (
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Profit Margin</span>
                  <span>{Math.round((profit / stats.revenue) * 100)}%</span>
                </div>
                <Progress value={Math.max(0, Math.min(100, (profit / stats.revenue) * 100))} className="h-2" />
              </div>
            )}
            <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate(`/business/${slug}/finance`)}>
              View Finances <ArrowRight className="w-3.5 h-3.5 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-xs">Manage your business operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all group"
                >
                  <div className={`p-2.5 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground text-center leading-tight">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects + Leads Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Projects */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-primary" />
                Recent Projects
              </CardTitle>
              <CardDescription className="text-xs">{stats.projects} total • {stats.activeProjects} active</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate(`/business/${slug}/projects`)}>
              View All <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className="text-center py-6">
                <FolderKanban className="w-10 h-10 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No projects yet</p>
                <Button variant="link" size="sm" className="mt-1" onClick={() => navigate(`/business/${slug}/projects`)}>
                  Create your first project
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => {
                  const progress = getProjectProgress(project);
                  return (
                    <div key={project.id} className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{project.name}</p>
                          {project.client_name && <p className="text-xs text-muted-foreground">{project.client_name}</p>}
                        </div>
                        <Badge className={`text-[10px] ${getStatusColor(project.status)}`}>
                          {project.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground">{progress}%</span>
                      </div>
                      {project.budget && (
                        <p className="text-xs text-muted-foreground mt-1.5">Budget: {formatCurrency(project.budget)}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Recent Leads
              </CardTitle>
              <CardDescription className="text-xs">{stats.leads} total • {stats.newLeads} new</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate(`/business/${slug}/crm`)}>
              View All <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <div className="text-center py-6">
                <UserPlus className="w-10 h-10 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No leads yet</p>
                <Button variant="link" size="sm" className="mt-1" onClick={() => navigate(`/business/${slug}/crm`)}>
                  Add your first lead
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {lead.name?.charAt(0) || 'L'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{lead.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{lead.company || lead.email || 'No details'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {lead.value && <span className="text-xs font-medium text-green-600">{formatCurrency(lead.value)}</span>}
                      <Badge className={`text-[10px] ${getStatusColor(lead.status)}`}>
                        {lead.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions + Contact + About */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Recent Transactions
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate(`/business/${slug}/finance`)}>
              View All <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-6">
                <DollarSign className="w-10 h-10 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No transactions yet</p>
                <Button variant="link" size="sm" className="mt-1" onClick={() => navigate(`/business/${slug}/finance`)}>
                  Record your first transaction
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`p-2 rounded-lg ${tx.type === 'income' ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
                        {tx.type === 'income' 
                          ? <ArrowUpRight className="w-4 h-4 text-green-600" />
                          : <ArrowDownRight className="w-4 h-4 text-red-600" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{tx.description || tx.category || tx.type}</p>
                        <p className="text-xs text-muted-foreground">{tx.date ? formatDate(tx.date) : formatDate(tx.created_at)}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Contact Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg flex-shrink-0">
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
              <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded-lg flex-shrink-0">
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
                <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg flex-shrink-0">
                  <Globe className="w-4 h-4 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Website</p>
                  <a href={currentBusiness.website} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1">
                    {currentBusiness.website.replace(/https?:\/\//, '').slice(0, 25)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
            {currentBusiness?.address && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg flex-shrink-0">
                  <MapPin className="w-4 h-4 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm text-foreground">{currentBusiness.address}</p>
                </div>
              </div>
            )}

            {currentBusiness?.description && (
              <div className="pt-3 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">About</p>
                <p className="text-sm text-muted-foreground line-clamp-4">{currentBusiness.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Business Health Overview */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Business Health Overview
          </CardTitle>
          <CardDescription className="text-xs">Quick snapshot of your business operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Services', value: stats.services, active: stats.activeServices, icon: Package, path: 'services' },
              { label: 'Projects', value: stats.projects, active: stats.activeProjects, icon: FolderKanban, path: 'projects' },
              { label: 'Team', value: stats.team, active: stats.team, icon: Users, path: 'team' },
              { label: 'Leads', value: stats.leads, active: stats.newLeads, icon: Target, path: 'crm' },
              { label: 'Revenue', value: formatCurrency(stats.revenue), active: null, icon: TrendingUp, path: 'finance' },
              { label: 'Expenses', value: formatCurrency(stats.expenses), active: null, icon: DollarSign, path: 'finance' },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => navigate(`/business/${slug}/${item.path}`)}
                className="p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/50 transition-all text-left group"
              >
                <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
                <p className="text-lg font-bold text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                {item.active !== null && (
                  <p className="text-[10px] text-primary mt-0.5">{item.active} active</p>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessDashboard;
