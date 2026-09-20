import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Plus, Truck, Loader2, CheckCircle2 } from 'lucide-react';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BusinessPurchases = () => {
  const { currentBusiness } = useBusinessContext();
  const { user } = useAuth();
  const bid = currentBusiness?.id;
  const [suppliers,setSuppliers]=useState([]),[products,setProducts]=useState([]),[purchases,setPurchases]=useState([]),[loading,setLoading]=useState(true),[open,setOpen]=useState(false);
  const [openSupplier,setOpenSupplier]=useState(false);
  const [supplier,setSupplier]=useState({name:'',company:'',phone:'',email:''});
  const [form,setForm]=useState({supplier_id:'',purchase_number:'',product_id:'',description:'',quantity:'1',rate:''});

  const load=useCallback(async()=>{if(!bid)return;setLoading(true);const [s,p,pu]=await Promise.all([
    supabase.from('business_suppliers').select('*').eq('business_id',bid).order('name'),
    supabase.from('business_products').select('id,name,price,stock_quantity').eq('business_id',bid).eq('is_active',true).order('name'),
    supabase.from('business_purchases').select('*,business_suppliers(name)').eq('business_id',bid).order('created_at',{ascending:false})
  ]);setSuppliers(s.data||[]);setProducts(p.data||[]);setPurchases(pu.data||[]);setLoading(false)},[bid]);
  useEffect(()=>{load()},[load]);

  const create=async()=>{
    if(!form.description.trim())return toast.error('Add an item');
    const qty=Number(form.quantity)||0,rate=Number(form.rate)||0;if(qty<=0||rate<0)return toast.error('Enter valid quantity and rate');
    const number=form.purchase_number||`PUR-${new Date().getFullYear()}-${String(purchases.length+1).padStart(4,'0')}`,total=qty*rate;
    const {data:pur,error}=await supabase.from('business_purchases').insert({business_id:bid,supplier_id:form.supplier_id||null,purchase_number:number,status:'ordered',subtotal:total,total,created_by:user?.id}).select().single();
    if(error)return toast.error(error.message);
    const {error:itemError}=await supabase.from('business_purchase_items').insert({purchase_id:pur.id,business_id:bid,product_id:form.product_id||null,description:form.description.trim(),quantity:qty,rate,amount:total});
    if(itemError)return toast.error(itemError.message);
    toast.success('Purchase created');setOpen(false);setForm({supplier_id:'',purchase_number:'',product_id:'',description:'',quantity:'1',rate:''});load();
  };
  const createSupplier=async()=>{
    if(!supplier.name.trim())return toast.error('Supplier name is required');
    const {error}=await supabase.from('business_suppliers').insert({business_id:bid,...supplier});
    if(error)toast.error(error.message);else{toast.success('Supplier added');setOpenSupplier(false);setSupplier({name:'',company:'',phone:'',email:''});load()}
  };
  const receive=async(id)=>{const {error}=await supabase.rpc('receive_business_purchase',{_purchase_id:id});if(error)toast.error(error.message);else{toast.success('Stock received and updated');load()}};

  return <div className="p-4 md:p-6 space-y-5 max-w-[1300px] mx-auto">
    <div className="flex items-center justify-between"><div><p className="text-xs text-primary font-semibold uppercase tracking-wider">Inventory</p><h1 className="text-2xl font-bold">Purchases & Suppliers</h1><p className="text-sm text-muted-foreground mt-1">Buy stock, receive it, and keep inventory connected.</p></div><div className="flex gap-2"><Button variant="outline" onClick={()=>setOpenSupplier(true)}><Plus className="w-4 h-4 mr-1.5"/>Supplier</Button><Button onClick={()=>setOpen(true)}><Plus className="w-4 h-4 mr-1.5"/>New purchase</Button></div></div>
    <div className="grid md:grid-cols-3 gap-3"><Card><CardContent className="p-4"><Truck className="w-4 h-4 text-primary"/><p className="text-xl font-bold mt-2">{suppliers.length}</p><p className="text-xs text-muted-foreground">Suppliers</p></CardContent></Card><Card><CardContent className="p-4"><Package className="w-4 h-4 text-primary"/><p className="text-xl font-bold mt-2">{products.length}</p><p className="text-xs text-muted-foreground">Catalog items</p></CardContent></Card><Card><CardContent className="p-4"><CheckCircle2 className="w-4 h-4 text-primary"/><p className="text-xl font-bold mt-2">{purchases.filter(x=>x.status==='received').length}</p><p className="text-xs text-muted-foreground">Received purchases</p></CardContent></Card></div>
    <Card><CardHeader><CardTitle className="text-base">Purchase orders</CardTitle></CardHeader><CardContent className="space-y-2">{loading&&<Loader2 className="w-5 h-5 animate-spin"/>}{purchases.map(x=><div key={x.id} className="border rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-2"><div><p className="font-medium text-sm">{x.purchase_number}</p><p className="text-xs text-muted-foreground">{x.business_suppliers?.name||'Supplier'} · {x.purchase_date}</p></div><div className="flex items-center gap-2"><b>₹{Number(x.total||0).toLocaleString('en-IN')}</b><Badge variant="outline" className="capitalize text-[10px]">{x.status}</Badge>{x.status!=='received'&&x.status!=='cancelled'&&<Button size="sm" className="h-7 text-xs" onClick={()=>receive(x.id)}>Receive stock</Button>}</div></div>)}{!purchases.length&&!loading&&<p className="py-8 text-center text-sm text-muted-foreground">No purchases yet.</p>}</CardContent></Card>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>New purchase</DialogTitle></DialogHeader><div className="space-y-3"><div className="grid grid-cols-2 gap-2"><div><Label>Purchase #</Label><Input value={form.purchase_number} onChange={e=>setForm({...form,purchase_number:e.target.value})} placeholder="Auto"/></div><div><Label>Supplier</Label><Select value={form.supplier_id} onValueChange={v=>setForm({...form,supplier_id:v})}><SelectTrigger><SelectValue placeholder="Select supplier"/></SelectTrigger><SelectContent>{suppliers.map(s=><SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div></div><div><Label>Product</Label><Select value={form.product_id} onValueChange={v=>{const x=products.find(p=>p.id===v);setForm({...form,product_id:v,description:x?.name||'',rate:String(x?.price||'')})}}><SelectTrigger><SelectValue placeholder="Select product"/></SelectTrigger><SelectContent>{products.map(x=><SelectItem key={x.id} value={x.id}>{x.name}</SelectItem>)}</SelectContent></Select></div><div><Label>Item *</Label><Input value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div><div className="grid grid-cols-2 gap-2"><div><Label>Quantity</Label><Input type="number" min="1" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})}/></div><div><Label>Purchase rate</Label><Input type="number" min="0" value={form.rate} onChange={e=>setForm({...form,rate:e.target.value})}/></div></div><Button className="w-full" onClick={create}>Create purchase</Button></div></DialogContent></Dialog>
  </div>
};
export default BusinessPurchases;
