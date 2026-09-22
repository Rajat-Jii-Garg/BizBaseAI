import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle2, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function LeadCapture() {
  const { token } = useParams();
  const [business,setBusiness]=useState(null);
  const [loading,setLoading]=useState(true);
  const [sending,setSending]=useState(false);
  const [sent,setSent]=useState(false);
  const [error,setError]=useState('');
  const [form,setForm]=useState({name:'',phone:'',email:'',message:''});

  useEffect(()=>{(async()=>{
    const {data,error}=await supabase.rpc('get_public_business_lead_form',{p_token:token});
    if(error || !data?.[0]) setError('This enquiry link is not available.');
    else setBusiness(data[0]);
    setLoading(false);
  })()},[token]);

  const submit=async(e)=>{
    e.preventDefault(); setError('');
    if(!form.name.trim() || (!form.phone.trim() && !form.email.trim())) {setError('Please enter your name and phone or email.');return;}
    setSending(true);
    const {error}=await supabase.rpc('capture_public_business_lead',{
      p_token:token,p_name:form.name,p_phone:form.phone||null,p_email:form.email||null,
      p_message:form.message||null,p_source:'bizbase_public_form'
    });
    setSending(false);
    if(error){setError(error.message);return;}
    setSent(true);
  };

  if(loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>;
  if(error && !business) return <div className="min-h-screen flex items-center justify-center p-6"><Card><CardContent className="p-8 text-center"><p className="font-medium">{error}</p></CardContent></Card></div>;

  return <div className="min-h-screen bg-muted/30 flex items-center justify-center p-5">
    <Card className="w-full max-w-md shadow-sm"><CardContent className="p-6">
      <div className="text-center mb-6">
        {business?.logo_url&&<img src={business.logo_url} className="h-14 w-14 rounded-xl object-cover mx-auto mb-3" alt=""/>}
        <h1 className="text-xl font-bold">{business?.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">Send an enquiry</p>
      </div>
      {sent ? <div className="text-center py-8"><CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3"/><h2 className="font-semibold">Enquiry sent</h2><p className="text-sm text-muted-foreground mt-1">The business will contact you soon.</p></div> :
      <form onSubmit={submit} className="space-y-4">
        {error&&<p className="text-sm text-destructive">{error}</p>}
        <div><Label>Name *</Label><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name"/></div>
        <div className="grid grid-cols-2 gap-3"><div><Label>Phone</Label><Input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+91"/></div><div><Label>Email</Label><Input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@email.com"/></div></div>
        <div><Label>What do you need?</Label><Textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Tell us what you are looking for"/></div>
        <Button className="w-full" disabled={sending}>{sending?<Loader2 className="h-4 w-4 mr-2 animate-spin"/>:<Send className="h-4 w-4 mr-2"/>}Send enquiry</Button>
      </form>}
      <p className="text-[11px] text-center text-muted-foreground mt-5">Powered by BizBase</p>
    </CardContent></Card>
  </div>;
}
