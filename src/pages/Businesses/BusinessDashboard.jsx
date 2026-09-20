import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, Download, IndianRupee, Megaphone, Plus, Sparkles, Target, Users, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const money = (v, currency='INR') => new Intl.NumberFormat('en-IN',{style:'currency',currency,maximumFractionDigits:0}).format(Number(v||0));
const csv = (rows) => rows.map(r => r.map(v => `"${String(v ?? '').replaceAll('"','""')}"`).join(',')).join('\n');

export default function BusinessDashboard(){
  const {slug}=useParams(); const navigate=useNavigate(); const {currentBusiness}=useBusinessContext(); const bid=currentBusiness?.id;
  const [loading,setLoading]=useState(true); const [data,setData]=useState({leads:[],invoices:[],transactions:[],customers:[]});
  const load=useCallback(async()=>{ if(!bid)return; setLoading(true); const [l,i,t,c]=await Promise.all([
    supabase.from('business_leads').select('id,name,status,value,created_at,next_follow_up_at,follow_up_status').eq('business_id',bid).order('created_at',{ascending:false}).limit(500),
    supabase.from('business_invoices').select('id,invoice_number,total,amount_paid,status,due_date').eq('business_id',bid).limit(500),
    supabase.from('business_transactions').select('type,amount,date').eq('business_id',bid).limit(500),
    supabase.from('business_customers').select('id,name,created_at').eq('business_id',bid).limit(500)
  ]); setData({leads:l.data||[],invoices:i.data||[],transactions:t.data||[],customers:c.data||[]}); setLoading(false); },[bid]);
  useEffect(()=>{load()},[load]);
  const pulse=useMemo(()=>{const leads=data.leads; const overdue=leads.filter(l=>l.next_follow_up_at&&new Date(l.next_follow_up_at)<new Date()&&!['closed_won','closed_lost'].includes(l.status)); const open=leads.filter(l=>!['closed_won','closed_lost'].includes(l.status)); const revenue=data.transactions.filter(x=>x.type==='income').reduce((s,x)=>s+Number(x.amount||0),0); const receivable=data.invoices.reduce((s,x)=>s+Math.max(0,Number(x.total||0)-Number(x.amount_paid||0)),0); return {total:leads.length,open:open.length,overdue,revenue,receivable};},[data]);
  const alerts=[
    ...pulse.overdue.slice(0,4).map(l=>({tone:'critical',title:`Follow up ${l.name}`,detail:'This lead is overdue for a response.',path:'crm'})),
    ...(pulse.receivable>0?[{tone:'warning',title:`${money(pulse.receivable,currentBusiness?.currency)} receivable`,detail:'Review outstanding invoices and collect.',path:'finance'}]:[]),
    ...(pulse.total===0?[{tone:'info',title:'No leads yet',detail:'Create your first 7-day growth plan and start collecting enquiries.',path:'growth'}]:[])
  ].slice(0,5);
  const exportData=()=>{const lines=[['Type','Name','Status','Value','Next Follow Up'],...data.leads.map(l=>['Lead',l.name,l.status,l.value,l.next_follow_up_at])]; const blob=new Blob([csv(lines)],{type:'text/csv'}); const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${currentBusiness?.username||'business'}-bizbase-export.csv`;a.click();URL.revokeObjectURL(a.href);toast.success('Business data exported');};
  const nav=p=>navigate(`/business/${slug}/${p}`);
  return <div className="min-h-full bg-muted/20 p-4 md:p-6"><div className="max-w-[1450px] mx-auto space-y-5">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3"><div><p className="text-xs text-primary font-semibold uppercase tracking-[.15em]">Business Pulse</p><h1 className="text-2xl md:text-3xl font-bold tracking-tight">{currentBusiness?.name}</h1><p className="text-sm text-muted-foreground mt-1">Know what is happening. Fix what matters. Grow.</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={exportData}><Download className="w-4 h-4 mr-2"/>Export</Button><Button size="sm" onClick={()=>nav('growth')}><Sparkles className="w-4 h-4 mr-2"/>Grow this week</Button></div></div>
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {[['Revenue',money(pulse.revenue,currentBusiness?.currency),IndianRupee],['Open leads',pulse.open,Target],['Follow-ups due',pulse.overdue.length,AlertTriangle],['Receivable',money(pulse.receivable,currentBusiness?.currency),IndianRupee],['Customers',data.customers.length,Users]].map(([label,val,Icon])=><Card key={label}><CardContent className="p-4"><Icon className="w-4 h-4 text-primary"/><p className="text-xl md:text-2xl font-bold mt-2">{loading?'—':val}</p><p className="text-xs text-muted-foreground mt-1">{label}</p></CardContent></Card>)}
    </div>
    <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
      <Card><CardContent className="p-5"><div className="flex items-center justify-between mb-4"><div><h2 className="font-semibold">What needs attention?</h2><p className="text-xs text-muted-foreground">BizBase prioritizes the work most likely to affect growth.</p></div><Badge variant="secondary">{alerts.length} actions</Badge></div>{alerts.length?<div className="space-y-2">{alerts.map((a,i)=><div key={i} className="flex items-center gap-3 rounded-xl border p-3"><div className={`w-2 h-2 rounded-full ${a.tone==='critical'?'bg-destructive':a.tone==='warning'?'bg-amber-500':'bg-primary'}`}/><div className="min-w-0 flex-1"><p className="text-sm font-medium">{a.title}</p><p className="text-xs text-muted-foreground">{a.detail}</p></div><Button size="sm" variant="ghost" onClick={()=>nav(a.path)}>Fix <ArrowRight className="w-3.5 h-3.5 ml-1"/></Button></div>)}</div>:<div className="rounded-xl bg-emerald-500/10 p-4 text-sm flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5"/>Nothing urgent right now. Keep the growth loop moving.</div>}</CardContent></Card>
      <Card><CardContent className="p-5"><div className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary"/><h2 className="font-semibold">Quick actions</h2></div><div className="grid grid-cols-2 gap-2 mt-4">{[['New lead','crm'],['New customer','customers'],['New invoice','invoices'],['Growth plan','growth']].map(([x,p])=><Button key={x} variant="outline" className="h-12 justify-start" onClick={()=>nav(p)}><Plus className="w-4 h-4 mr-2"/>{x}</Button>)}</div><div className="mt-4 rounded-xl bg-primary/5 p-4"><div className="flex items-center gap-2 font-medium text-sm"><Megaphone className="w-4 h-4"/>This week's growth loop</div><p className="text-xs text-muted-foreground mt-1">Plan → campaign → leads → follow-up → revenue.</p><Button size="sm" className="mt-3" onClick={()=>nav('growth')}>Open Growth Engine</Button></div></CardContent></Card>
    </div>
  </div></div>;
}
