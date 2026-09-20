import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, MessageCircle, Send, TrendingUp, Users, Target, Megaphone, Globe2 } from 'lucide-react';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BusinessGrowth = () => {
  const { currentBusiness } = useBusinessContext();
  const bid = currentBusiness?.id;
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [offer, setOffer] = useState('');
  const [audience, setAudience] = useState('Local customers');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    if (!bid) return;
    const [l, c, s] = await Promise.all([
      supabase.from('business_leads').select('id,name,status,source,created_at').eq('business_id', bid).order('created_at', { ascending: false }).limit(200),
      supabase.from('business_customers').select('id,name').eq('business_id', bid).limit(200),
      supabase.from('business_services').select('id,name,description,price').eq('business_id', bid).eq('is_active', true).limit(50),
    ]);
    setLeads(l.data || []); setCustomers(c.data || []); setServices(s.data || []);
  }, [bid]);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const won = leads.filter(x => x.status === 'closed_won').length;
    const open = leads.filter(x => !['closed_won','closed_lost'].includes(x.status)).length;
    const rate = leads.length ? Math.round((won / leads.length) * 100) : 0;
    return { total: leads.length, open, won, rate };
  }, [leads]);

  const publicUrl = `${window.location.origin}/company/${currentBusiness?.username || ''}`;
  const buildMessage = () => {
    const selected = services[0]?.name;
    const product = offer.trim() || selected || 'our services';
    const text = `🚀 ${currentBusiness?.name || 'Our business'}\n\n${product} available for ${audience}.\n\nInterested? Message us here: ${publicUrl}\n\nLimited enquiries this week. Reply to know more.`;
    setMessage(text);
  };
  const copy = async (text) => { await navigator.clipboard.writeText(text); toast.success('Copied'); };
  const whatsapp = () => { const text = message || `Hi! I want to know more about ${currentBusiness?.name || 'your business'}.`; window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); };
  const xShare = () => { const text = message || `${currentBusiness?.name || 'Our business'} — ${offer || 'See what we offer'} ${publicUrl}`; window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank'); };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div><p className="text-xs text-primary font-semibold uppercase tracking-wider">Growth OS</p><h1 className="text-2xl font-bold">Get customers, not just reports.</h1><p className="text-sm text-muted-foreground mt-1">Turn your business profile, leads and offers into a repeatable growth loop.</p></div>
        <Button variant="outline" onClick={() => window.open(publicUrl, '_blank')}><Globe2 className="w-4 h-4 mr-2"/>View public page</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><Target className="w-4 h-4 text-primary"/><p className="text-2xl font-bold mt-2">{stats.total}</p><p className="text-xs text-muted-foreground">Total leads</p></CardContent></Card>
        <Card><CardContent className="p-4"><TrendingUp className="w-4 h-4 text-primary"/><p className="text-2xl font-bold mt-2">{stats.open}</p><p className="text-xs text-muted-foreground">Open opportunities</p></CardContent></Card>
        <Card><CardContent className="p-4"><Users className="w-4 h-4 text-primary"/><p className="text-2xl font-bold mt-2">{customers.length}</p><p className="text-xs text-muted-foreground">Customers</p></CardContent></Card>
        <Card><CardContent className="p-4"><Megaphone className="w-4 h-4 text-primary"/><p className="text-2xl font-bold mt-2">{stats.rate}%</p><p className="text-xs text-muted-foreground">Lead → won</p></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">One-click campaign composer</CardTitle><p className="text-xs text-muted-foreground">Create a ready-to-share promotion from your existing business data.</p></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3"><div><Label>Offer / product</Label><Input value={offer} onChange={e=>setOffer(e.target.value)} placeholder={services[0]?.name || 'e.g. Diwali offer, website package'} /></div><div><Label>Audience</Label><Input value={audience} onChange={e=>setAudience(e.target.value)} /></div></div>
            <Button onClick={buildMessage}><Megaphone className="w-4 h-4 mr-2"/>Create campaign message</Button>
            {message && <div className="space-y-2"><Textarea value={message} onChange={e=>setMessage(e.target.value)} rows={7}/><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={()=>copy(message)}><Copy className="w-4 h-4 mr-2"/>Copy</Button><Button variant="outline" onClick={whatsapp}><MessageCircle className="w-4 h-4 mr-2"/>WhatsApp</Button><Button variant="outline" onClick={xShare}><Send className="w-4 h-4 mr-2"/>X</Button></div></div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Growth loop</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {['Publish an offer','Send people to your business page','Capture every enquiry in CRM','Follow up and close','Turn customers into repeat business'].map((x,i)=><div key={x} className="flex gap-3 items-start"><span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{i+1}</span><div><p className="font-medium">{x}</p><p className="text-[11px] text-muted-foreground">Connected to your business data.</p></div></div>)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Lead sources</CardTitle><p className="text-xs text-muted-foreground">See which channels are actually creating opportunities.</p></CardHeader>
        <CardContent>{leads.length ? <div className="flex flex-wrap gap-2">{Object.entries(leads.reduce((a,l)=>{const k=l.source||'Unknown';a[k]=(a[k]||0)+1;return a},{})).map(([k,v])=><Badge key={k} variant="outline">{k}: {v}</Badge>)}</div> : <p className="text-sm text-muted-foreground">Start capturing leads in CRM to build your growth data.</p>}</CardContent>
      </Card>
    </div>
  );
};
export default BusinessGrowth;
