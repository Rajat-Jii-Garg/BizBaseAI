import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, Copy, IndianRupee, MessageCircle, Phone, Plus, Users, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const money=(v,c='INR')=>new Intl.NumberFormat('en-IN',{style:'currency',currency:c,maximumFractionDigits:0}).format(Number(v||0));
const wa=(phone)=>{const d=String(phone||'').replace(/\D/g,'');return d?`https://wa.me/${d.length===10?`91${d}`:d}`:'#';};

export default function BusinessDashboard(){
  const {slug}=useParams(); const navigate=useNavigate(); const {currentBusiness}=useBusinessContext(); const bid=currentBusiness?.id;
  const [leads,setLeads]=useState([]); const [invoices,setInvoices]=useState([]); const [customers,setCustomers]=useState([]); const [loading,setLoading]=useState(true);

  const load=useCallback(async()=>{
    if(!bid)return; setLoading(true);
    const [l,i,c]=await Promise.all([
      supabase.from('business_leads').select('id,name,phone,email,status,source,value,next_follow_up_at,last_contacted_at,created_at').eq('business_id',bid).order('created_at',{ascending:false}).limit(100),
      supabase.from('business_invoices').select('id,total,amount_paid,status,due_date').eq('business_id',bid).limit(200),
      supabase.from('business_customers').select('id').eq('business_id',bid).limit(500)
    ]);
    setLeads(l.data||[]);setInvoices(i.data||[]);setCustomers(c.data||[]);setLoading(false);
  },[bid]);

  useEffect(()=>{load()},[load]);

  const due=useMemo(()=>leads.filter(l=>l.next_follow_up_at&&new Date(l.next_follow_up_at)<=new Date()&&!['closed_won','closed_lost'].includes(l.status)),[leads]);
  const open=leads.filter(l=>!['closed_won','closed_lost'].includes(l.status)).length;
  const won=leads.filter(l=>l.status==='closed_won').length;
  const receivable=invoices.reduce((s,x)=>s+Math.max(0,Number(x.total||0)-Number(x.amount_paid||0)),0);
  const formUrl=currentBusiness?.lead_capture_token?`${window.location.origin}/lead/${currentBusiness.lead_capture_token}`:'';

  const copy=async()=>{if(!formUrl)return;await navigator.clipboard.writeText(formUrl);toast.success('Enquiry link copied');};
  const contact=async(lead,type)=>{
    await supabase.rpc('record_business_lead_activity',{p_lead_id:lead.id,p_type:type,p_note:`${type} started from BizBase`});
    if(type==='whatsapp') window.open(wa(lead.phone),'_blank'); else window.location.href=`tel:${lead.phone}`;
  };
  const nav=p=>navigate(`/business/${slug}/${p}`);

  return <div className="min-h-full bg-muted/20 p-4 md:p-6"><div className="max-w-[1450px] mx-auto space-y-5">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div><p className="text-xs text-primary font-semibold uppercase tracking-[.15em]">Business Control Center</p><h1 className="text-2xl md:text-3xl font-bold">{currentBusiness?.name}</h1><p className="text-sm text-muted-foreground mt-1">Leads in → follow-up → sale. BizBase keeps the loop moving.</p></div>
      <div className="flex gap-2"><Button variant="outline" size="sm" onClick={()=>nav('leads')}><Users className="w-4 h-4 mr-2"/>Lead Engine</Button><Button size="sm" onClick={()=>nav('leads')}><Plus className="w-4 h-4 mr-2"/>Add lead</Button></div>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {[['New leads',leads.filter(x=>x.status==='new').length],['Open pipeline',open],['Follow-ups due',due.length],['Won',won],['Receivable',money(receivable,currentBusiness?.currency)]].map(([label,val])=><Card key={label}><CardContent className="p-4"><p className="text-xl md:text-2xl font-bold">{loading?'—':val}</p><p className="text-xs text-muted-foreground mt-1">{label}</p></CardContent></Card>)}
    </div>

    <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5">
      <Card><CardContent className="p-5">
        <div className="flex items-center justify-between mb-4"><div><h2 className="font-semibold">Today’s lead actions</h2><p className="text-xs text-muted-foreground">Contact the people most likely to need a response.</p></div><Badge variant="secondary">{due.length} due</Badge></div>
        {due.length===0?<div className="rounded-xl bg-emerald-500/10 p-4 text-sm flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5"/>No overdue follow-ups. Keep collecting enquiries.</div>:
        <div className="space-y-2">{due.slice(0,8).map(l=><div key={l.id} className="flex items-center gap-3 border rounded-xl p-3"><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{l.name}</p><p className="text-xs text-muted-foreground">{l.source||'manual'} • {l.phone||l.email||'no contact'}</p></div>{l.phone&&<><Button size="icon" variant="outline" onClick={()=>contact(l,'whatsapp')}><MessageCircle className="w-4 h-4"/></Button><Button size="icon" variant="outline" onClick={()=>contact(l,'call')}><Phone className="w-4 h-4"/></Button></>}<Button size="sm" variant="ghost" onClick={()=>nav('leads')}>Open <ArrowRight className="w-3.5 h-3.5 ml-1"/></Button></div>)}</div>}
      </CardContent></Card>

      <Card><CardContent className="p-5">
        <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary"/><h2 className="font-semibold">Get leads into BizBase</h2></div>
        <p className="text-xs text-muted-foreground mt-2">Use this enquiry link on your website, Instagram/Facebook bio, ads and campaigns.</p>
        <div className="mt-3 rounded-lg bg-muted p-2 text-[11px] break-all">{formUrl||'Run the Lead Engine migration first.'}</div>
        <div className="flex gap-2 mt-3"><Button size="sm" onClick={copy} disabled={!formUrl}><Copy className="w-4 h-4 mr-2"/>Copy link</Button><Button size="sm" variant="outline" onClick={()=>nav('leads')}>Manage leads</Button></div>
        <div className="mt-4 text-xs text-muted-foreground">Every enquiry from this form appears in the Lead Engine automatically.</div>
      </CardContent></Card>
    </div>

    <Card><CardContent className="p-5">
      <div className="flex items-center justify-between mb-3"><div><h2 className="font-semibold">Recent enquiries</h2><p className="text-xs text-muted-foreground">Your latest customer opportunities.</p></div><Button size="sm" variant="ghost" onClick={()=>nav('leads')}>View all <ArrowRight className="w-3.5 h-3.5 ml-1"/></Button></div>
      <div className="space-y-2">{leads.slice(0,6).map(l=><div key={l.id} className="flex items-center gap-3 border-b last:border-0 py-2.5"><div className="flex-1"><p className="text-sm font-medium">{l.name}</p><p className="text-xs text-muted-foreground">{l.source||'manual'} {l.value?`• ${money(l.value,currentBusiness?.currency)}`:''}</p></div><Badge variant="outline">{l.status.replace('_',' ')}</Badge></div>)}{!leads.length&&!loading&&<p className="py-6 text-center text-sm text-muted-foreground">No enquiries yet. Copy the enquiry link above and start sending traffic.</p>}</div>
    </CardContent></Card>
  </div></div>;
}
