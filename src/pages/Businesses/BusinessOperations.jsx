import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, ClipboardList, Clock3, FileBarChart, Loader2, Plus, Users, CalendarDays, IndianRupee } from 'lucide-react';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const today = () => new Date().toISOString().slice(0, 10);
const money = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n || 0));

const BusinessOperations = () => {
  const { currentBusiness } = useBusinessContext();
  const { user } = useAuth();
  const bid = currentBusiness?.id;
  const [tab, setTab] = useState('tasks');
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [team, setTeam] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [projects, setProjects] = useState([]);
  const [openTask, setOpenTask] = useState(false);
  const [openOrder, setOpenOrder] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', due_date: '', project_id: '' });
  const [orderForm, setOrderForm] = useState({ order_number: '', customer_id: '', notes: '', product_id: '', description: '', quantity: '1', rate: '' });
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const load = useCallback(async () => {
    if (!bid) return;
    setLoading(true);
    const [t, o, tm, a, p, c, pr] = await Promise.all([
      supabase.from('business_tasks').select('*').eq('business_id', bid).order('created_at', { ascending: false }),
      supabase.from('business_orders').select('*, business_customers(name)').eq('business_id', bid).order('created_at', { ascending: false }),
      supabase.from('business_team_members').select('id,name,email,role,status').eq('business_id', bid).order('name'),
      supabase.from('business_attendance').select('*').eq('business_id', bid).eq('work_date', today()).order('created_at'),
      supabase.from('business_projects').select('id,name').eq('business_id', bid).order('name'),
      supabase.from('business_customers').select('id,name').eq('business_id', bid).order('name'),
      supabase.from('business_products').select('id,name,price,stock_quantity').eq('business_id', bid).eq('is_active', true).order('name'),
    ]);
    setTasks(t.data || []); setOrders(o.data || []); setTeam(tm.data || []); setAttendance(a.data || []);
    setProjects(p.data || []); setCustomers(c.data || []); setProducts(pr.data || []);
    setLoading(false);
  }, [bid]);

  useEffect(() => { load(); }, [load]);

  const addTask = async () => {
    if (!taskForm.title.trim()) return toast.error('Task title is required');
    const { error } = await supabase.from('business_tasks').insert({
      business_id: bid, title: taskForm.title.trim(), description: taskForm.description || null,
      priority: taskForm.priority, due_date: taskForm.due_date || null, project_id: taskForm.project_id || null, created_by: user?.id
    });
    if (error) return toast.error(error.message);
    toast.success('Task created'); setOpenTask(false);
    setTaskForm({ title: '', description: '', priority: 'medium', due_date: '', project_id: '' }); load();
  };

  const updateTask = async (id, status) => {
    const { error } = await supabase.from('business_tasks').update({ status }).eq('id', id);
    if (error) toast.error(error.message); else setTasks(x => x.map(t => t.id === id ? { ...t, status } : t));
  };

  const addOrder = async () => {
    if (!orderForm.description.trim()) return toast.error('Add an item');
    const qty = Number(orderForm.quantity) || 0, rate = Number(orderForm.rate) || 0;
    if (qty <= 0 || rate < 0) return toast.error('Enter valid quantity and rate');
    const subtotal = qty * rate;
    const number = orderForm.order_number || `ORD-${new Date().getFullYear()}-${String(orders.length + 1).padStart(4, '0')}`;
    const { data: order, error } = await supabase.from('business_orders').insert({
      business_id: bid, customer_id: orderForm.customer_id || null, order_number: number,
      status: 'confirmed', subtotal, total: subtotal, created_by: user?.id, notes: orderForm.notes || null
    }).select().single();
    if (error) return toast.error(error.message);
    const product = products.find(p => p.id === orderForm.product_id);
    const { error: itemError } = await supabase.from('business_order_items').insert({
      order_id: order.id, business_id: bid, product_id: product?.id || null,
      description: orderForm.description.trim(), quantity: qty, rate, amount: subtotal
    });
    if (itemError) return toast.error(itemError.message);
    toast.success('Order created'); setOpenOrder(false);
    setOrderForm({ order_number: '', customer_id: '', notes: '', product_id: '', description: '', quantity: '1', rate: '' }); load();
  };

  const fulfill = async (id) => {
    const { error } = await supabase.rpc('fulfill_business_order', { _order_id: id });
    if (error) toast.error(error.message); else { toast.success('Order fulfilled and stock updated'); load(); }
  };

  const markAttendance = async (member, status) => {
    const existing = attendance.find(a => a.employee_id === member.id);
    const payload = { business_id: bid, employee_id: member.id, work_date: today(), status, check_in: status === 'present' ? new Date().toISOString() : null };
    const { error } = existing
      ? await supabase.from('business_attendance').update(payload).eq('id', existing.id)
      : await supabase.from('business_attendance').insert(payload);
    if (error) toast.error(error.message); else load();
  };

  const stats = useMemo(() => ({
    todo: tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').length,
    urgent: tasks.filter(t => ['urgent','high'].includes(t.priority) && t.status !== 'done').length,
    pendingOrders: orders.filter(o => ['draft','confirmed'].includes(o.status)).length,
    todayPresent: attendance.filter(a => a.status === 'present').length,
  }), [tasks, orders, attendance]);

  if (!bid) return null;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1500px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div><p className="text-xs text-primary font-semibold uppercase tracking-wider">Operations</p><h1 className="text-2xl font-bold">Run the work</h1><p className="text-sm text-muted-foreground mt-1">Tasks, orders and team operations in one place.</p></div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setOpenTask(true)}><Plus className="w-4 h-4 mr-1.5" />Task</Button>
          <Button size="sm" variant="outline" onClick={() => setOpenOrder(true)}><Plus className="w-4 h-4 mr-1.5" />Order</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ['Open tasks', stats.todo, ClipboardList],
          ['High priority', stats.urgent, Clock3],
          ['Pending orders', stats.pendingOrders, IndianRupee],
          ['Present today', stats.todayPresent, Users],
        ].map(([label,value,Icon]) => <Card key={label}><CardContent className="p-4"><Icon className="w-4 h-4 text-primary"/><p className="text-xl font-bold mt-2">{loading ? '—' : value}</p><p className="text-xs text-muted-foreground">{label}</p></CardContent></Card>)}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-4 w-full md:w-auto md:inline-grid">
          <TabsTrigger value="tasks">Tasks</TabsTrigger><TabsTrigger value="orders">Orders</TabsTrigger><TabsTrigger value="attendance">Attendance</TabsTrigger><TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">Team tasks</CardTitle><Button size="sm" onClick={() => setOpenTask(true)}><Plus className="w-4 h-4 mr-1"/>Add</Button></CardHeader><CardContent className="space-y-2">
            {tasks.map(t => <div key={t.id} className="border rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div><div className="flex items-center gap-2"><p className="font-medium text-sm">{t.title}</p><Badge variant="outline" className="capitalize text-[10px]">{t.priority}</Badge></div><p className="text-xs text-muted-foreground mt-1">{t.description || 'No description'} {t.due_date ? `· Due ${t.due_date}` : ''}</p></div>
              <Select value={t.status} onValueChange={v => updateTask(t.id,v)}><SelectTrigger className="h-8 w-36 text-xs"><SelectValue/></SelectTrigger><SelectContent>{['todo','in_progress','review','done','cancelled'].map(s=><SelectItem key={s} value={s} className="text-xs">{s.replace('_',' ')}</SelectItem>)}</SelectContent></Select>
            </div>)}
            {!tasks.length && <Empty text="No tasks yet. Create the first task for your team."/>}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">Sales orders</CardTitle><Button size="sm" onClick={() => setOpenOrder(true)}><Plus className="w-4 h-4 mr-1"/>Create order</Button></CardHeader><CardContent className="space-y-2">
            {orders.map(o => <div key={o.id} className="border rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3"><div><p className="font-medium text-sm">{o.order_number}</p><p className="text-xs text-muted-foreground">{o.business_customers?.name || 'Walk-in customer'} · {o.order_date}</p></div><div className="flex items-center gap-2"><span className="font-semibold">{money(o.total)}</span><Badge variant="outline" className="capitalize text-[10px]">{o.status}</Badge>{o.status !== 'fulfilled' && o.status !== 'cancelled' && <Button size="sm" className="h-7 text-xs" onClick={() => fulfill(o.id)}>Fulfill</Button>}</div></div>)}
            {!orders.length && <Empty text="No orders yet. Create your first sale order."/>}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><CalendarDays className="w-4 h-4"/>Attendance · {today()}</CardTitle></CardHeader><CardContent className="space-y-2">
            {team.map(m => { const a=attendance.find(x=>x.employee_id===m.id); return <div key={m.id} className="border rounded-xl p-3 flex items-center justify-between gap-3"><div><p className="text-sm font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.role}</p></div><div className="flex gap-1.5">{['present','absent','half_day','leave'].map(s=><Button key={s} size="sm" variant={a?.status===s?'default':'outline'} className="h-7 text-[10px] capitalize" onClick={()=>markAttendance(m,s)}>{s.replace('_',' ')}</Button>)}</div></div>})}
            {!team.length && <Empty text="Add team members first to track attendance."/>}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            <ReportCard title="Sales orders" value={money(orders.reduce((s,o)=>s+Number(o.total||0),0))} icon={IndianRupee} note={`${orders.length} orders`} />
            <ReportCard title="Tasks completed" value={`${tasks.filter(t=>t.status==='done').length}/${tasks.length}`} icon={CheckCircle2} note="Current workload" />
            <ReportCard title="Team present" value={`${stats.todayPresent}/${team.length || 0}`} icon={Users} note="Today's attendance" />
          </div>
          <Card className="mt-4"><CardHeader><CardTitle className="text-base flex items-center gap-2"><FileBarChart className="w-4 h-4"/>Business health snapshot</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm"><Metric label="Customers" value={customers.length}/><Metric label="Products" value={products.length}/><Metric label="Projects" value={projects.length}/><Metric label="Low stock" value={products.filter(p=>p.stock_quantity !== null && Number(p.stock_quantity)<=5).length}/></CardContent></Card>
        </TabsContent>
      </Tabs>

      <Dialog open={openTask} onOpenChange={setOpenTask}><DialogContent><DialogHeader><DialogTitle>Create task</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>Title *</Label><Input value={taskForm.title} onChange={e=>setTaskForm({...taskForm,title:e.target.value})}/></div><div><Label>Description</Label><Textarea value={taskForm.description} onChange={e=>setTaskForm({...taskForm,description:e.target.value})}/></div><div className="grid grid-cols-2 gap-2"><div><Label>Priority</Label><Select value={taskForm.priority} onValueChange={v=>setTaskForm({...taskForm,priority:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{['low','medium','high','urgent'].map(v=><SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div><div><Label>Due date</Label><Input type="date" value={taskForm.due_date} onChange={e=>setTaskForm({...taskForm,due_date:e.target.value})}/></div></div><div><Label>Project</Label><Select value={taskForm.project_id} onValueChange={v=>setTaskForm({...taskForm,project_id:v})}><SelectTrigger><SelectValue placeholder="No project"/></SelectTrigger><SelectContent>{projects.map(p=><SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div><Button className="w-full" onClick={addTask}>Create task</Button></div></DialogContent></Dialog>

      <Dialog open={openOrder} onOpenChange={setOpenOrder}><DialogContent><DialogHeader><DialogTitle>Create sales order</DialogTitle></DialogHeader><div className="space-y-3"><div className="grid grid-cols-2 gap-2"><div><Label>Order #</Label><Input value={orderForm.order_number} onChange={e=>setOrderForm({...orderForm,order_number:e.target.value})} placeholder="Auto"/></div><div><Label>Customer</Label><Select value={orderForm.customer_id} onValueChange={v=>setOrderForm({...orderForm,customer_id:v})}><SelectTrigger><SelectValue placeholder="Walk-in"/></SelectTrigger><SelectContent>{customers.map(c=><SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div></div><div><Label>Product</Label><Select value={orderForm.product_id} onValueChange={v=>{const p=products.find(x=>x.id===v);setOrderForm({...orderForm,product_id:v,description:p?.name||'',rate:String(p?.price||'')})}}><SelectTrigger><SelectValue placeholder="Select product"/></SelectTrigger><SelectContent>{products.map(p=><SelectItem key={p.id} value={p.id}>{p.name} · stock {p.stock_quantity ?? '—'}</SelectItem>)}</SelectContent></Select></div><div><Label>Item description *</Label><Input value={orderForm.description} onChange={e=>setOrderForm({...orderForm,description:e.target.value})}/></div><div className="grid grid-cols-2 gap-2"><div><Label>Quantity</Label><Input type="number" min="1" value={orderForm.quantity} onChange={e=>setOrderForm({...orderForm,quantity:e.target.value})}/></div><div><Label>Rate</Label><Input type="number" min="0" value={orderForm.rate} onChange={e=>setOrderForm({...orderForm,rate:e.target.value})}/></div></div><div><Label>Notes</Label><Textarea value={orderForm.notes} onChange={e=>setOrderForm({...orderForm,notes:e.target.value})}/></div><Button className="w-full" onClick={addOrder}>Create order</Button></div></DialogContent></Dialog>
    </div>
  );
};

const Empty=({text})=><div className="py-10 text-center text-sm text-muted-foreground"><ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40"/>{text}</div>;
const Metric=({label,value})=><div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-bold mt-1">{value}</p></div>;
const ReportCard=({title,value,icon:Icon,note})=><Card><CardContent className="p-4"><Icon className="w-4 h-4 text-primary"/><p className="text-xl font-bold mt-2">{value}</p><p className="text-xs font-medium">{title}</p><p className="text-[11px] text-muted-foreground mt-1">{note}</p></CardContent></Card>;
export default BusinessOperations;
