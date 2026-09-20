import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Activity, ArrowRight, Bell, CheckCircle2, ChevronRight, CircleDollarSign,
  FileText, FolderKanban, Package, Plus, ReceiptIndianRupee, Settings2,
  Target, UserPlus, Users, WalletCards, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';

const money = (value, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(value || 0));

const dateLabel = (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '';

const BusinessDashboard = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentBusiness } = useBusinessContext();
  const [data, setData] = useState({
    customers: [], leads: [], invoices: [], products: [], projects: [], transactions: [], activities: []
  });
  const [loading, setLoading] = useState(true);

  const bid = currentBusiness?.id;
  const currency = currentBusiness?.currency || 'INR';

  const load = useCallback(async () => {
    if (!bid) return;
    setLoading(true);
    const [customers, leads, invoices, products, projects, transactions, activities] = await Promise.all([
      supabase.from('business_customers').select('id,name,company,created_at').eq('business_id', bid).order('created_at', { ascending: false }).limit(100),
      supabase.from('business_leads').select('id,name,status,value,created_at').eq('business_id', bid).order('created_at', { ascending: false }).limit(100),
      supabase.from('business_invoices').select('id,invoice_number,customer_name,total,amount_paid,status,due_date,created_at').eq('business_id', bid).order('created_at', { ascending: false }).limit(100),
      supabase.from('business_products').select('id,name,stock_quantity,price,is_active').eq('business_id', bid).eq('is_active', true).order('created_at', { ascending: false }).limit(100),
      supabase.from('business_projects').select('id,name,status,end_date,budget,created_at').eq('business_id', bid).order('created_at', { ascending: false }).limit(50),
      supabase.from('business_transactions').select('id,type,amount,description,date,created_at').eq('business_id', bid).order('created_at', { ascending: false }).limit(100),
      supabase.from('business_activities').select('*').eq('business_id', bid).order('created_at', { ascending: false }).limit(8),
    ]);
    setData({
      customers: customers.data || [], leads: leads.data || [], invoices: invoices.data || [],
      products: products.data || [], projects: projects.data || [], transactions: transactions.data || [],
      activities: activities.data || []
    });
    setLoading(false);
  }, [bid]);

  useEffect(() => { load(); }, [load]);

  const metrics = useMemo(() => {
    const income = data.transactions.filter(x => x.type === 'income').reduce((s, x) => s + Number(x.amount || 0), 0);
    const expenses = data.transactions.filter(x => x.type === 'expense').reduce((s, x) => s + Number(x.amount || 0), 0);
    const invoiced = data.invoices.reduce((s, x) => s + Number(x.total || 0), 0);
    const paid = data.invoices.reduce((s, x) => s + Number(x.amount_paid || (x.status === 'paid' ? x.total : 0) || 0), 0);
    const outstanding = Math.max(0, invoiced - paid);
    return {
      income, expenses, profit: income - expenses, invoiced, paid, outstanding,
      newLeads: data.leads.filter(x => x.status === 'new').length,
      openLeads: data.leads.filter(x => !['closed_won','closed_lost'].includes(x.status)).length,
      lowStock: data.products.filter(x => x.stock_quantity !== null && Number(x.stock_quantity) <= 5).length,
      activeProjects: data.projects.filter(x => x.status === 'active').length
    };
  }, [data]);

  const actions = [
    ['New lead', UserPlus, 'crm'],
    ['New customer', Users, 'customers'],
    ['Create invoice', FileText, 'invoices'],
    ['Add product', Package, 'catalog'],
    ['Record expense', WalletCards, 'finance'],
    ['New project', FolderKanban, 'projects'],
  ];

  const nav = (path) => navigate(`/business/${slug}/${path}`);

  return (
    <div className="min-h-full bg-muted/20">
      <div className="max-w-[1500px] mx-auto p-4 md:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-xs text-primary font-semibold uppercase tracking-[0.14em]">Business HQ</p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{currentBusiness?.name || 'Your business'}</h1>
            <p className="text-sm text-muted-foreground mt-1">Everything your team needs to run the business, connected in one workspace.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => nav('settings')}><Settings2 className="w-4 h-4 mr-2" />Settings</Button>
            <Button size="sm" onClick={() => nav('invoices')}><Plus className="w-4 h-4 mr-2" />Create</Button>
          </div>
        </div>

        <Card className="border-primary/10 bg-gradient-to-br from-primary/[0.07] via-background to-background shadow-sm">
          <CardContent className="p-4 md:p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="font-semibold">Today's control room</p>
                <p className="text-xs text-muted-foreground">See what needs attention before you start working.</p>
              </div>
              <Badge variant="outline" className="gap-1"><Zap className="w-3 h-3" />Live data</Badge>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
              {[
                ['Revenue', money(metrics.income, currency), CircleDollarSign, 'finance'],
                ['Outstanding', money(metrics.outstanding, currency), ReceiptIndianRupee, 'invoices'],
                ['Open leads', metrics.openLeads, Target, 'crm'],
                ['Customers', data.customers.length, Users, 'customers'],
                ['Low stock', metrics.lowStock, Package, 'catalog'],
                ['Active projects', metrics.activeProjects, FolderKanban, 'projects'],
              ].map(([label, value, Icon, path]) => (
                <button key={label} onClick={() => nav(path)} className="text-left rounded-xl border bg-background/80 p-3 hover:border-primary/30 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between">
                    <Icon className="w-4 h-4 text-primary" />
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-bold mt-2">{loading ? '—' : value}</p>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
          {actions.map(([label, Icon, path]) => (
            <button key={label} onClick={() => nav(path)} className="flex items-center gap-2 rounded-xl border bg-background px-3 py-3 text-sm font-medium hover:border-primary/30 hover:bg-primary/[0.03] transition-colors">
              <span className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="w-4 h-4" /></span>{label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div><CardTitle className="text-base">Money flow</CardTitle><p className="text-xs text-muted-foreground mt-1">Sales, collections and expenses at a glance.</p></div>
              <Button variant="ghost" size="sm" onClick={() => nav('finance')}>Open finance <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <div><p className="text-xs text-muted-foreground">Income</p><p className="text-xl font-bold text-emerald-600 mt-1">{money(metrics.income,currency)}</p></div>
                <div><p className="text-xs text-muted-foreground">Expenses</p><p className="text-xl font-bold text-rose-600 mt-1">{money(metrics.expenses,currency)}</p></div>
                <div><p className="text-xs text-muted-foreground">Net</p><p className={`text-xl font-bold mt-1 ${metrics.profit >= 0 ? 'text-foreground' : 'text-rose-600'}`}>{money(metrics.profit,currency)}</p></div>
              </div>
              <div className="mt-5">
                <div className="flex justify-between text-xs mb-1.5"><span className="text-muted-foreground">Invoice collection</span><span>{metrics.invoiced ? Math.round((metrics.paid / metrics.invoiced) * 100) : 0}%</span></div>
                <Progress value={metrics.invoiced ? Math.min(100,(metrics.paid / metrics.invoiced) * 100) : 0} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4 text-primary" />Needs attention</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {metrics.outstanding > 0 && <button onClick={() => nav('invoices')} className="w-full text-left rounded-lg bg-amber-500/10 p-3"><p className="text-sm font-medium">Payments pending</p><p className="text-xs text-muted-foreground">{money(metrics.outstanding,currency)} outstanding</p></button>}
              {metrics.lowStock > 0 && <button onClick={() => nav('catalog')} className="w-full text-left rounded-lg bg-rose-500/10 p-3"><p className="text-sm font-medium">{metrics.lowStock} low-stock items</p><p className="text-xs text-muted-foreground">Review inventory</p></button>}
              {metrics.newLeads > 0 && <button onClick={() => nav('crm')} className="w-full text-left rounded-lg bg-blue-500/10 p-3"><p className="text-sm font-medium">{metrics.newLeads} new leads</p><p className="text-xs text-muted-foreground">Follow up today</p></button>}
              {!metrics.outstanding && !metrics.lowStock && !metrics.newLeads && <div className="text-center py-6 text-muted-foreground"><CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" /><p className="text-sm">You're all caught up.</p></div>}
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between"><div><CardTitle className="text-base">Recent invoices</CardTitle><p className="text-xs text-muted-foreground">Your latest customer billing activity.</p></div><Button variant="ghost" size="sm" onClick={() => nav('invoices')}>View all</Button></CardHeader>
            <CardContent className="space-y-1">
              {data.invoices.slice(0,6).map(i => (
                <div key={i.id} className="flex items-center justify-between py-2.5 border-b last:border-0">
                  <div className="min-w-0"><p className="text-sm font-medium truncate">{i.customer_name || 'Customer'}</p><p className="text-[11px] text-muted-foreground">{i.invoice_number} · {dateLabel(i.created_at)}</p></div>
                  <div className="text-right"><p className="text-sm font-semibold">{money(i.total,currency)}</p><Badge variant="outline" className="text-[10px] capitalize">{i.status}</Badge></div>
                </div>
              ))}
              {!data.invoices.length && <Empty label="No invoices yet" action="Create your first invoice" onClick={() => nav('invoices')} />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between"><div><CardTitle className="text-base">Activity</CardTitle><p className="text-xs text-muted-foreground">What changed in your business.</p></div><Activity className="w-4 h-4 text-muted-foreground" /></CardHeader>
            <CardContent>
              {data.activities.length ? data.activities.map(a => (
                <div key={a.id} className="flex gap-3 py-2.5 border-b last:border-0">
                  <div className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary"><Activity className="w-3.5 h-3.5" /></div>
                  <div><p className="text-sm">{a.detail || `${a.action} ${a.entity_type}`}</p><p className="text-[11px] text-muted-foreground">{dateLabel(a.created_at)}</p></div>
                </div>
              )) : <Empty label="Your activity will appear here" action="Start with a customer" onClick={() => nav('customers')} />}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Empty = ({ label, action, onClick }) => (
  <div className="py-8 text-center text-muted-foreground">
    <p className="text-sm">{label}</p>
    <Button variant="link" size="sm" onClick={onClick}>{action}</Button>
  </div>
);

export default BusinessDashboard;
