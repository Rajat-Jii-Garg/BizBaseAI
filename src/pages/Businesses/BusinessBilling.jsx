import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BusinessBilling = () => {
  const { currentBusiness } = useBusinessContext();
  const [paying,setPaying]=useState(false);
  const [loaded,setLoaded]=useState(false);
  useEffect(()=>{ const s=document.createElement('script'); s.src='https://checkout.razorpay.com/v1/checkout.js'; s.onload=()=>setLoaded(true); s.onerror=()=>setLoaded(false); document.body.appendChild(s); return()=>s.remove()},[]);
  const active=currentBusiness?.subscription_status==='active' && currentBusiness?.subscription_ends_at && new Date(currentBusiness.subscription_ends_at)>new Date();
  const trial=currentBusiness?.subscription_status==='trialing';
  const pay=async()=>{
    if(!currentBusiness?.id)return;
    if(!loaded)return toast.error('Payment checkout could not load. Check your internet connection.');
    setPaying(true);
    try{
      const {data,error}=await supabase.functions.invoke('create-business-payment-order',{body:{business_id:currentBusiness.id}});
      if(error||data?.error)throw new Error(error?.message||data?.error);
      const options={
        key:data.key_id,amount:data.order.amount,currency:data.order.currency,name:'BizBase',description:'Business Plan — 30 days',
        order_id:data.order.id,prefill:{name:currentBusiness.name,email:currentBusiness.email||''},
        theme:{color:'#2563eb'},
        handler:async(response)=>{
          const {data:verified,error:verifyError}=await supabase.functions.invoke('verify-business-payment',{body:{business_id:currentBusiness.id,...response}});
          if(verifyError||verified?.error)throw new Error(verifyError?.message||verified?.error);
          toast.success('Business plan activated for 30 days');window.location.reload();
        },
        modal:{ondismiss:()=>setPaying(false)}
      };
      const rzp=new window.Razorpay(options);rzp.on('payment.failed',()=>{toast.error('Payment failed. Please try again.');setPaying(false)});rzp.open();
    }catch(e){toast.error(e.message||'Could not start payment');setPaying(false)}
  };
  return <div className="p-4 md:p-6 max-w-[1000px] mx-auto space-y-5">
    <div><p className="text-xs text-primary font-semibold uppercase tracking-wider">Billing</p><h1 className="text-2xl font-bold">Business plan</h1><p className="text-sm text-muted-foreground mt-1">One workspace for CRM, sales, inventory, finance, team and operations.</p></div>
    <Card className="border-primary/20"><CardHeader><div className="flex items-center justify-between"><CardTitle className="text-xl">BizBase Business</CardTitle><Badge>{active?'Active':trial?'Free trial':'Inactive'}</Badge></div></CardHeader><CardContent className="space-y-5"><div className="flex items-end gap-2"><span className="text-4xl font-bold">₹5,000</span><span className="text-sm text-muted-foreground mb-1">/ 30 days</span></div><div className="grid sm:grid-cols-2 gap-2 text-sm">{['CRM & leads','Customers & sales','Invoices & payments','Products & inventory','Purchases & suppliers','Team & attendance','Projects & tasks','Business dashboard & reports'].map(x=><div key={x} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600"/>{x}</div>)}</div>{trial&&currentBusiness?.trial_ends_at&&<p className="text-sm bg-primary/5 rounded-lg p-3">Trial ends on <b>{new Date(currentBusiness.trial_ends_at).toLocaleDateString('en-IN')}</b>. Upgrade now to keep uninterrupted access.</p>}{active&&<p className="text-sm bg-emerald-500/10 rounded-lg p-3">Active until <b>{new Date(currentBusiness.subscription_ends_at).toLocaleDateString('en-IN')}</b>.</p>}<Button size="lg" className="w-full" onClick={pay} disabled={paying||active}>{paying?<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Opening secure checkout…</>:active?<><ShieldCheck className="w-4 h-4 mr-2"/>Plan active</>:<><CreditCard className="w-4 h-4 mr-2"/>Upgrade for ₹5,000</>}</Button><p className="text-[11px] text-center text-muted-foreground">Secure checkout powered by Razorpay. Configure Razorpay secrets in Supabase Edge Functions before accepting live payments.</p></CardContent></Card>
  </div>
};
export default BusinessBilling;
