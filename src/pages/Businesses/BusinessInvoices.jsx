import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Loader2, Trash2, Download, Printer } from 'lucide-react';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatMoney, formatDate, CURRENCIES } from '@/lib/money';
import { downloadCsv } from '@/lib/csv';

const STATUS_STYLES = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-amber-100 text-amber-700',
};

const blankLine = () => ({ description: '', quantity: '1', rate: '', tax_rate: '' });

const BusinessInvoices = () => {
  const { currentBusiness } = useBusinessContext();
  const { user } = useAuth();
  const businessId = currentBusiness?.id;
  const currency = currentBusiness?.currency || 'INR';

  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [viewItems, setViewItems] = useState([]);

  const [form, setForm] = useState({
    customer_id: '', customer_name: '', invoice_number: '',
    issue_date: new Date().toISOString().slice(0, 10), due_date: '', notes: '',
    status: 'draft', lines: [blankLine()],
  });

  const fetchAll = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    const [inv, cus, prod] = await Promise.all([
      supabase.from('business_invoices').select('*').eq('business_id', businessId).order('created_at', { ascending: false }),
      supabase.from('business_customers').select('id, name').eq('business_id', businessId).order('name'),
      supabase.from('business_products').select('id, name, price, tax_rate').eq('business_id', businessId).eq('is_active', true),
    ]);
    if (inv.error) console.error('Error loading invoices:', inv.error);
    setInvoices(inv.data || []);
    setCustomers(cus.data || []);
    setProducts(prod.data || []);
    setLoading(false);
  }, [businessId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const nextNumber = () => {
    const year = new Date().getFullYear();
    return `INV-${year}-${String(invoices.length + 1).padStart(4, '0')}`;
  };

  const openNew = () => {
    setForm({
      customer_id: '', customer_name: '', invoice_number: nextNumber(),
      issue_date: new Date().toISOString().slice(0, 10), due_date: '', notes: '',
      status: 'draft', lines: [blankLine()],
    });
    setOpen(true);
  };

  const setLine = (idx, patch) => setForm(f => ({ ...f, lines: f.lines.map((l, i) => i === idx ? { ...l, ...patch } : l) }));

  const totals = (lines) => {
    let subtotal = 0, tax = 0;
    lines.forEach(l => {
      const amount = (parseFloat(l.quantity) || 0) * (parseFloat(l.rate) || 0);
      subtotal += amount;
      tax += amount * (parseFloat(l.tax_rate) || 0) / 100;
    });
    return { subtotal, tax, total: subtotal + tax };
  };

  const { subtotal, tax, total } = totals(form.lines);

  const save = async () => {
    const name = form.customer_name.trim() || customers.find(c => c.id === form.customer_id)?.name;
    if (!name) { toast.error('Select or type a customer name'); return; }
    const valid = form.lines.filter(l => l.description.trim() && parseFloat(l.rate) >= 0);
    if (!valid.length) { toast.error('Add at least one line item'); return; }

    setSaving(true);
    try {
      const { data: invoice, error } = await supabase.from('business_invoices').insert({
        business_id: businessId,
        customer_id: form.customer_id || null,
        customer_name: name,
        invoice_number: form.invoice_number || nextNumber(),
        issue_date: form.issue_date || null,
        due_date: form.due_date || null,
        currency,
        subtotal, tax_amount: tax, total,
        status: form.status,
        notes: form.notes || null,
        created_by: user?.id || null,
      }).select().single();
      if (error) throw error;

      const items = valid.map(l => {
        const qty = parseFloat(l.quantity) || 0;
        const rate = parseFloat(l.rate) || 0;
        return {
          invoice_id: invoice.id, business_id: businessId,
          description: l.description.trim(), quantity: qty, rate,
          tax_rate: parseFloat(l.tax_rate) || 0, amount: qty * rate,
        };
      });
      const { error: itemErr } = await supabase.from('business_invoice_items').insert(items);
      if (itemErr) throw itemErr;

      toast.success('Invoice created');
      setOpen(false);
      fetchAll();
    } catch (err) {
      console.error('Invoice save failed:', err);
      toast.error(err.message || 'Could not create invoice');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (inv, status) => {
    const patch = { status };
    if (status === 'paid') patch.amount_paid = inv.total;
    const { error } = await supabase.from('business_invoices').update(patch).eq('id', inv.id);
    if (error) { toast.error('Could not update'); return; }
    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, ...patch } : i));
  };

  const remove = async (id) => {
    const { error } = await supabase.from('business_invoices').delete().eq('id', id);
    if (error) { toast.error('Could not delete'); return; }
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  const openView = async (inv) => {
    setViewing(inv);
    const { data } = await supabase.from('business_invoice_items').select('*').eq('invoice_id', inv.id);
    setViewItems(data || []);
  };

  const paid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total || 0), 0);
  const outstanding = invoices.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((s, i) => s + Number(i.total || 0), 0);

  return (
    <div className="p-3 md:p-5 space-y-4 text-[13px]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-foreground">Invoices</h1>
          <p className="text-xs text-muted-foreground">
            Create {currentBusiness?.tax_mode === 'gst' ? 'GST' : 'tax'}-ready invoices and track payments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"
            onClick={() => downloadCsv('invoices.csv', invoices, ['invoice_number', 'customer_name', 'issue_date', 'due_date', 'currency', 'subtotal', 'tax_amount', 'total', 'status'])}>
            <Download className="w-3.5 h-3.5" />Export
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={openNew}><Plus className="w-3.5 h-3.5" />New Invoice</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: 'Invoices', value: invoices.length },
          { label: 'Paid', value: formatMoney(paid, currency) },
          { label: 'Outstanding', value: formatMoney(outstanding, currency) },
          { label: 'Drafts', value: invoices.filter(i => i.status === 'draft').length },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className="text-base font-bold truncate">{s.value}</p>
          </CardContent></Card>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : invoices.length === 0 ? (
        <Card><CardContent className="text-center py-10">
          <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">No invoices yet</p>
          <p className="text-xs text-muted-foreground mb-3">Create your first invoice from your catalog and customers.</p>
          <Button size="sm" className="h-8 text-xs" onClick={openNew}>New Invoice</Button>
        </CardContent></Card>
      ) : (
        <Card><CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                {['Invoice', 'Customer', 'Issued', 'Due', 'Total', 'Status', ''].map(h => (
                  <th key={h} className="text-left p-2.5 font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-2.5 font-medium cursor-pointer" onClick={() => openView(inv)}>{inv.invoice_number}</td>
                  <td className="p-2.5">{inv.customer_name}</td>
                  <td className="p-2.5 text-muted-foreground">{formatDate(inv.issue_date)}</td>
                  <td className="p-2.5 text-muted-foreground">{formatDate(inv.due_date)}</td>
                  <td className="p-2.5 font-semibold">{formatMoney(inv.total, inv.currency)}</td>
                  <td className="p-2.5">
                    <Select value={inv.status} onValueChange={(v) => updateStatus(inv, v)}>
                      <SelectTrigger className={`h-6 text-[10px] w-24 border-0 ${STATUS_STYLES[inv.status] || ''}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['draft', 'sent', 'paid', 'overdue', 'cancelled'].map(s => (
                          <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-2.5 text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(inv.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent></Card>
      )}

      {/* Create invoice */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-sm">New invoice</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Customer</Label>
                <Select value={form.customer_id || '__manual'} onValueChange={(v) => setForm({ ...form, customer_id: v === '__manual' ? '' : v })}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__manual" className="text-xs">Type manually</SelectItem>
                    {customers.map(c => <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Customer name</Label>
                <Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  placeholder={customers.find(c => c.id === form.customer_id)?.name || 'Name on invoice'} className="h-8 text-xs mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs">Invoice #</Label><Input value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} className="h-8 text-xs mt-1" /></div>
              <div><Label className="text-xs">Issue date</Label><Input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} className="h-8 text-xs mt-1" /></div>
              <div><Label className="text-xs">Due date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="h-8 text-xs mt-1" /></div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Line items</Label>
              {form.lines.map((l, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Input value={l.description} onChange={(e) => setLine(idx, { description: e.target.value })} placeholder="Description" className="h-8 text-xs" list="catalog-items" />
                  </div>
                  <Input className="col-span-2 h-8 text-xs" type="number" value={l.quantity} onChange={(e) => setLine(idx, { quantity: e.target.value })} placeholder="Qty" />
                  <Input className="col-span-2 h-8 text-xs" type="number" value={l.rate} onChange={(e) => setLine(idx, { rate: e.target.value })} placeholder="Rate" />
                  <Input className="col-span-2 h-8 text-xs" type="number" value={l.tax_rate} onChange={(e) => setLine(idx, { tax_rate: e.target.value })} placeholder="Tax %" />
                  <Button variant="ghost" size="icon" className="col-span-1 h-7 w-7 text-destructive"
                    onClick={() => setForm(f => ({ ...f, lines: f.lines.filter((_, i) => i !== idx) }))}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
              <datalist id="catalog-items">
                {products.map(p => <option key={p.id} value={p.name} />)}
              </datalist>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setForm(f => ({ ...f, lines: [...f.lines, blankLine()] }))}>
                  <Plus className="w-3 h-3 mr-1" />Add line
                </Button>
                {products.length > 0 && (
                  <Select onValueChange={(id) => {
                    const p = products.find(x => x.id === id);
                    if (p) setForm(f => ({ ...f, lines: [...f.lines.filter(l => l.description || l.rate), { description: p.name, quantity: '1', rate: String(p.price || ''), tax_rate: String(p.tax_rate || '') }] }));
                  }}>
                    <SelectTrigger className="h-7 text-xs w-44"><SelectValue placeholder="Add from catalog" /></SelectTrigger>
                    <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-muted/40 p-3 space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatMoney(subtotal, currency)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{currentBusiness?.tax_mode === 'gst' ? 'GST' : 'Tax'}</span><span>{formatMoney(tax, currency)}</span></div>
              <div className="flex justify-between font-semibold text-sm pt-1 border-t border-border"><span>Total</span><span>{formatMoney(total, currency)}</span></div>
            </div>

            <div><Label className="text-xs">Notes / payment terms</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="text-xs mt-1" /></div>
            <Button onClick={save} disabled={saving} className="w-full h-8 text-xs">
              {saving ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />Saving…</> : 'Create invoice'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View invoice */}
      <Dialog open={!!viewing} onOpenChange={(o) => { if (!o) { setViewing(null); setViewItems([]); } }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-sm">{viewing?.invoice_number}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold text-sm">{currentBusiness?.name}</p>
                  {currentBusiness?.tax_number && <p className="text-muted-foreground">GSTIN: {currentBusiness.tax_number}</p>}
                </div>
                <Badge className={`text-[10px] capitalize ${STATUS_STYLES[viewing.status] || ''}`}>{viewing.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <p>Billed to: <span className="text-foreground font-medium">{viewing.customer_name}</span></p>
                <p>Issued: <span className="text-foreground">{formatDate(viewing.issue_date)}</span></p>
                <p>Due: <span className="text-foreground">{formatDate(viewing.due_date)}</span></p>
              </div>
              <table className="w-full">
                <thead className="bg-muted/50"><tr>{['Item', 'Qty', 'Rate', 'Amount'].map(h => <th key={h} className="text-left p-2 font-medium">{h}</th>)}</tr></thead>
                <tbody>
                  {viewItems.map(it => (
                    <tr key={it.id} className="border-t border-border">
                      <td className="p-2">{it.description}</td>
                      <td className="p-2">{it.quantity}</td>
                      <td className="p-2">{formatMoney(it.rate, viewing.currency)}</td>
                      <td className="p-2">{formatMoney(it.amount, viewing.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatMoney(viewing.subtotal, viewing.currency)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatMoney(viewing.tax_amount, viewing.currency)}</span></div>
                <div className="flex justify-between font-semibold text-sm"><span>Total</span><span>{formatMoney(viewing.total, viewing.currency)}</span></div>
              </div>
              {viewing.notes && <p className="text-muted-foreground">{viewing.notes}</p>}
              <Button variant="outline" size="sm" className="h-8 text-xs w-full" onClick={() => window.print()}>
                <Printer className="w-3.5 h-3.5 mr-1" />Print / Save as PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessInvoices;
