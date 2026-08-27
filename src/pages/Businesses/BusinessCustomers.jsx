import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Plus, Search, Loader2, Upload, Download, Pencil, Trash2, Mail, Phone } from 'lucide-react';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import CsvImporter from '@/components/business/CsvImporter';
import { downloadCsv } from '@/lib/csv';

const empty = { name: '', email: '', phone: '', company: '', tax_number: '', billing_address: '', city: '', country: 'India', notes: '' };

const BusinessCustomers = () => {
  const { currentBusiness } = useBusinessContext();
  const businessId = currentBusiness?.id;
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const fetchCustomers = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('business_customers').select('*')
      .eq('business_id', businessId).order('created_at', { ascending: false });
    if (error) console.error('Error loading customers:', error);
    setCustomers(data || []);
    setLoading(false);
  }, [businessId]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const save = async () => {
    if (!form.name.trim()) { toast.error('Customer name is required'); return; }
    const payload = { ...form, business_id: businessId };
    Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });
    payload.business_id = businessId;
    const { error } = editing
      ? await supabase.from('business_customers').update(payload).eq('id', editing.id)
      : await supabase.from('business_customers').insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? 'Customer updated' : 'Customer added');
    setDialogOpen(false); setEditing(null); setForm(empty);
    fetchCustomers();
  };

  const remove = async (id) => {
    const { error } = await supabase.from('business_customers').delete().eq('id', id);
    if (error) { toast.error('Could not delete'); return; }
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name || '', email: c.email || '', phone: c.phone || '', company: c.company || '',
      tax_number: c.tax_number || '', billing_address: c.billing_address || '', city: c.city || '',
      country: c.country || 'India', notes: c.notes || '',
    });
    setDialogOpen(true);
  };

  const filtered = customers.filter(c =>
    [c.name, c.email, c.phone, c.company].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-3 md:p-5 space-y-4 text-[13px]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-foreground">Customers</h1>
          <p className="text-xs text-muted-foreground">Your client book — used for invoices and follow-ups</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setImportOpen(true)}><Upload className="w-3.5 h-3.5" />Import CSV</Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"
            onClick={() => downloadCsv('customers.csv', customers, ['name', 'email', 'phone', 'company', 'tax_number', 'billing_address', 'city', 'country', 'notes'])}>
            <Download className="w-3.5 h-3.5" />Export
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => { setEditing(null); setForm(empty); setDialogOpen(true); }}><Plus className="w-3.5 h-3.5" />Add</Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="text-center py-10">
          <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">No customers yet</p>
          <p className="text-xs text-muted-foreground mb-3">Add them manually or import your existing customer list.</p>
          <div className="flex gap-2 justify-center">
            <Button size="sm" className="h-8 text-xs" onClick={() => setDialogOpen(true)}>Add customer</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setImportOpen(true)}>Import CSV</Button>
          </div>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(c => (
            <Card key={c.id}><CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">{c.name}</h3>
                  {c.company && <p className="text-xs text-muted-foreground truncate">{c.company}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                {c.email && <p className="flex items-center gap-1.5 truncate"><Mail className="w-3 h-3" />{c.email}</p>}
                {c.phone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{c.phone}</p>}
                {(c.city || c.country) && <p>{[c.city, c.country].filter(Boolean).join(', ')}</p>}
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); setForm(empty); } }}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-sm">{editing ? 'Edit customer' : 'Add customer'}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-3">
            <div><Label className="text-xs">Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-8 text-xs mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-8 text-xs mt-1" /></div>
              <div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-8 text-xs mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="h-8 text-xs mt-1" /></div>
              <div><Label className="text-xs">GST / Tax No.</Label><Input value={form.tax_number} onChange={(e) => setForm({ ...form, tax_number: e.target.value })} className="h-8 text-xs mt-1" /></div>
            </div>
            <div><Label className="text-xs">Billing address</Label><Textarea rows={2} value={form.billing_address} onChange={(e) => setForm({ ...form, billing_address: e.target.value })} className="text-xs mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="h-8 text-xs mt-1" /></div>
              <div><Label className="text-xs">Country</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="h-8 text-xs mt-1" /></div>
            </div>
            <div><Label className="text-xs">Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="text-xs mt-1" /></div>
            <Button onClick={save} className="w-full h-8 text-xs">{editing ? 'Update' : 'Add customer'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <CsvImporter
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import customers"
        table="business_customers"
        baseRow={{ business_id: businessId }}
        onDone={fetchCustomers}
        fields={[
          { key: 'name', label: 'Name', required: true, aliases: ['customer', 'client', 'fullname'] },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone', aliases: ['mobile', 'contact'] },
          { key: 'company', label: 'Company', aliases: ['organisation', 'organization'] },
          { key: 'tax_number', label: 'GST / Tax number', aliases: ['gstin', 'gst'] },
          { key: 'billing_address', label: 'Billing address', aliases: ['address'] },
          { key: 'city', label: 'City' },
          { key: 'country', label: 'Country' },
          { key: 'notes', label: 'Notes' },
        ]}
      />
    </div>
  );
};

export default BusinessCustomers;
