import React, { useEffect, useMemo, useState } from 'react';
import { Phone, MessageCircle, Mail, Plus, Search, Copy, ExternalLink, CheckCircle2, Clock3, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const statuses = ['new','contacted','qualified','proposal','negotiation','closed_won','closed_lost'];

const wa = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}` : '#';
};

export default function BusinessLeadCenter() {
  const { currentBusiness } = useBusinessContext();
  const bid = currentBusiness?.id;
  const [leads,setLeads] = useState([]);
  const [loading,setLoading] = useState(true);
  const [search,setSearch] = useState('');
  const [filter,setFilter] = useState('all');
  const [open,setOpen] = useState(false);
  const [form,setForm] = useState({name:'',phone:'',email:'',company:'',source:'manual',value:'',notes:''});

  const load = async () => {
    if (!bid) return;
    setLoading(true);
    const {data,error} = await supabase.from('business_leads')
      .select('id,name,phone,email,company,status,stage,source,value,notes,next_follow_up_at,last_contacted_at,created_at')
      .eq('business_id',bid).order('created_at',{ascending:false}).limit(500);
    if (error) toast.error(error.message);
    setLeads(data || []);
    setLoading(false);
  };

  useEffect(()=>{ load(); },[bid]);

  const filtered = useMemo(() => leads.filter(l => {
    const q=search.toLowerCase();
    const matches = !q || [l.name,l.phone,l.email,l.company,l.source].some(x=>String(x||'').toLowerCase().includes(q));
    return matches && (filter==='all' || l.status===filter);
  }),[leads,search,filter]);

  const addLead = async () => {
    if (!form.name.trim() || (!form.phone.trim() && !form.email.trim())) {
      toast.error('Name and phone/email are required'); return;
    }
    const {error}=await supabase.from('business_leads').insert({
      business_id:bid,name:form.name.trim(),phone:form.phone.trim()||null,email:form.email.trim()||null,
      company:form.company.trim()||null,source:form.source||'manual',
      value:form.value?Number(form.value):null,notes:form.notes.trim()||null,status:'new',stage:'new'
    });
    if(error){toast.error(error.message);return;}
    toast.success('Lead added'); setOpen(false);
    setForm({name:'',phone:'',email:'',company:'',source:'manual',value:'',notes:''}); load();
  };

  const contact = async (lead,type) => {
    const {error}=await supabase.rpc('record_business_lead_activity',{p_lead_id:lead.id,p_type:type,p_note:`${type} started from BizBase`});
    if(error) toast.error(error.message); else load();
  };

  const changeStatus = async (lead,status) => {
    const {error}=await supabase.from('business_leads').update({status,stage:status,updated_at:new Date().toISOString()}).eq('id',lead.id);
    if(error) toast.error(error.message); else { setLeads(x=>x.map(l=>l.id===lead.id?{...l,status,stage:status}:l)); }
  };

  const formUrl = currentBusiness?.lead_capture_token
    ? `${window.location.origin}/lead/${currentBusiness.lead_capture_token}` : '';

  const copyForm = async () => {
    if(!formUrl){toast.error('Lead form is not available yet. Run the BizBase Lead Engine migration.');return;}
    await navigator.clipboard.writeText(formUrl); toast.success('Lead form link copied');
  };

  const stats = {
    total:leads.length,new:leads.filter(x=>x.status==='new').length,
    contacted:leads.filter(x=>['contacted','qualified','proposal','negotiation'].includes(x.status)).length,
    won:leads.filter(x=>x.status==='closed_won').length
  };

  return <div className="p-4 md:p-6 space-y-5">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div><p className="text-xs font-semibold text-primary uppercase tracking-widest">Lead Engine</p><h1 className="text-2xl font-bold">Leads that need action</h1><p className="text-sm text-muted-foreground">All enquiries in one place. Contact, qualify and convert from BizBase.</p></div>
      <div className="flex gap-2"><Button variant="outline" size="sm" onClick={copyForm}><Copy className="w-4 h-4 mr-2"/>Copy enquiry link</Button><Button size="sm" onClick={()=>setOpen(true)}><Plus className="w-4 h-4 mr-2"/>Add lead</Button></div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[['All leads',stats.total],['New',stats.new],['In pipeline',stats.contacted],['Won',stats.won]].map(([a,b])=><Card key={a}><CardContent className="p-4"><p className="text-2xl font-bold">{b}</p><p className="text-xs text-muted-foreground">{a}</p></CardContent></Card>)}
    </div>

    <Card><CardContent className="p-4">
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <div className="relative flex-1"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/><Input className="pl-9" placeholder="Search name, phone, email or company" value={search} onChange={e=>setSearch(e.target.value)}/></div>
        <Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-full md:w-40"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem>{statuses.map(x=><SelectItem key={x} value={x}>{x.replace('_',' ')}</SelectItem>)}</SelectContent></Select>
      </div>

      {loading ? <p className="py-10 text-center text-muted-foreground">Loading leads...</p> :
      filtered.length===0 ? <div className="py-12 text-center"><UserPlus className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40"/><p className="font-medium">No leads yet</p><p className="text-sm text-muted-foreground mt-1">Put your BizBase enquiry link on your website, ads and social profiles.</p><Button className="mt-4" variant="outline" onClick={copyForm}><Copy className="w-4 h-4 mr-2"/>Copy enquiry link</Button></div> :
      <div className="space-y-2">{filtered.map(lead=><div key={lead.id} className="rounded-xl border p-3 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="font-semibold text-sm">{lead.name}</span><Badge variant="secondary">{lead.status.replace('_',' ')}</Badge></div><p className="text-xs text-muted-foreground mt-1">{[lead.company,lead.phone,lead.email,lead.source].filter(Boolean).join(' • ')}</p>{lead.notes&&<p className="text-xs mt-1 truncate">{lead.notes}</p>}</div>
        <div className="flex items-center gap-1">
          {lead.phone&&<><Button size="icon" variant="outline" title="WhatsApp" onClick={()=>{contact(lead,'whatsapp');window.open(wa(lead.phone),'_blank')}}><MessageCircle className="h-4 w-4"/></Button><Button size="icon" variant="outline" title="Call" onClick={()=>{contact(lead,'call');window.location.href=`tel:${lead.phone}`}}><Phone className="h-4 w-4"/></Button></>}
          {lead.email&&<Button size="icon" variant="outline" title="Email" onClick={()=>{contact(lead,'email');window.location.href=`mailto:${lead.email}`}}><Mail className="h-4 w-4"/></Button>}
          <Select value={lead.status} onValueChange={v=>changeStatus(lead,v)}><SelectTrigger className="w-32 h-9"><SelectValue/></SelectTrigger><SelectContent>{statuses.map(x=><SelectItem key={x} value={x}>{x.replace('_',' ')}</SelectItem>)}</SelectContent></Select>
        </div>
      </div>)}</div>}
    </CardContent></Card>

    {formUrl&&<Card className="bg-primary/5 border-primary/20"><CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-3"><div className="flex-1"><p className="font-medium text-sm">Your BizBase enquiry link</p><p className="text-xs text-muted-foreground break-all mt-1">{formUrl}</p></div><div className="flex gap-2"><Button size="sm" onClick={copyForm}><Copy className="w-4 h-4 mr-2"/>Copy</Button><Button size="sm" variant="outline" onClick={()=>window.open(formUrl,'_blank')}><ExternalLink className="w-4 h-4 mr-2"/>Open</Button></div></CardContent></Card>}

    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Add lead</DialogTitle></DialogHeader><div className="space-y-3">
      <div><Label>Name *</Label><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
      <div className="grid grid-cols-2 gap-2"><div><Label>Phone</Label><Input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div><div><Label>Email</Label><Input value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div></div>
      <div className="grid grid-cols-2 gap-2"><div><Label>Company</Label><Input value={form.company} onChange={e=>setForm({...form,company:e.target.value})}/></div><div><Label>Source</Label><Input value={form.source} onChange={e=>setForm({...form,source:e.target.value})}/></div></div>
      <div><Label>Expected value</Label><Input type="number" value={form.value} onChange={e=>setForm({...form,value:e.target.value})}/></div>
      <div><Label>Notes</Label><Textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></div>
      <Button className="w-full" onClick={addLead}>Save lead</Button>
    </div></DialogContent></Dialog>
  </div>;
}
