import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus, Search, Loader2, Upload, Download, Pencil, Trash2 } from 'lucide-react';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import CsvImporter from '@/components/business/CsvImporter';
import { downloadCsv } from '@/lib/csv';
import { formatMoney, CURRENCIES } from '@/lib/money';

const emptyItem = {
  kind: 'product', name: '', description: '', sku: '', price: '',
  currency: 'INR', tax_rate: '', unit: 'unit', stock_quantity: '', image_url: '', is_active: true,
};

const BusinessCatalog = () => {
  const { currentBusiness } = useBusinessContext();
  const businessId = currentBusiness?.id;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyItem);

  const fetchItems = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('business_products').select('*')
      .eq('business_id', businessId).order('created_at', { ascending: false });
    if (error) console.error('Error loading catalog:', error);
    setItems(data || []);
    setLoading(false);
  }, [businessId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  useEffect(() => {
    if (dialogOpen && !editing) {
      setForm(f => ({
        ...f,
        currency: currentBusiness?.currency || 'INR',
        tax_rate: currentBusiness?.default_tax_rate?.toString() || '',
      }));
    }
  }, [dialogOpen, editing, currentBusiness]);

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    const payload = {
      business_id: businessId,
      kind: form.kind,
      name: form.name.trim(),
      description: form.description || null,
      sku: form.sku || null,
      price: form.price ? parseFloat(form.price) : 0,
      currency: form.currency || 'INR',
      tax_rate: form.tax_rate ? parseFloat(form.tax_rate) : 0,
      unit: form.unit || null,
      stock_quantity: form.stock_quantity ? parseInt(form.stock_quantity, 10) : null,
      image_url: form.image_url || null,
      is_active: form.is_active,
    };
    const { error } = editing
      ? await supabase.from('business_products').update(payload).eq('id', editing.id)
      : await supabase.from('business_products').insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? 'Item updated' : 'Item added');
    setDialogOpen(false); setEditing(null); setForm(emptyItem);
    fetchItems();
  };

  const remove = async (id) => {
    const { error } = await supabase.from('business_products').delete().eq('id', id);
    if (error) { toast.error('Could not delete'); return; }
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success('Deleted');
  };

  const toggleActive = async (item) => {
    const { error } = await supabase.from('business_products').update({ is_active: !item.is_active }).eq('id', item.id);
    if (error) { toast.error('Could not update'); return; }
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: !item.is_active } : i));
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      kind: item.kind, name: item.name, description: item.description || '', sku: item.sku || '',
      price: item.price?.toString() || '', currency: item.currency || 'INR',
      tax_rate: item.tax_rate?.toString() || '', unit: item.unit || 'unit',
      stock_quantity: item.stock_quantity?.toString() || '', image_url: item.image_url || '',
      is_active: item.is_active,
    });
    setDialogOpen(true);
  };

  const filtered = items.filter(i =>
    (kindFilter === 'all' || i.kind === kindFilter) &&
    (i.name?.toLowerCase().includes(search.toLowerCase()) || i.sku?.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = [
    { label: 'Items', value: items.length },
    { label: 'Products', value: items.filter(i => i.kind === 'product').length },
    { label: 'Services', value: items.filter(i => i.kind === 'service').length },
    { label: 'Live', value: items.filter(i => i.is_active).length },
  ];

  return (
    <div className="p-3 md:p-5 space-y-4 text-[13px]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-foreground">Catalog</h1>
          <p className="text-xs text-muted-foreground">Products & services shown on your public business page</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setImportOpen(true)}>
            <Upload className="w-3.5 h-3.5" />Import CSV
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"
            onClick={() => downloadCsv('catalog.csv', items, ['kind', 'name', 'description', 'sku', 'price', 'currency', 'tax_rate', 'unit', 'stock_quantity', 'is_active'])}>
            <Download className="w-3.5 h-3.5" />Export
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => { setEditing(null); setForm(emptyItem); setDialogOpen(true); }}>
            <Plus className="w-3.5 h-3.5" />Add Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {stats.map(s => (
          <Card key={s.label}><CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className="text-lg font-bold">{s.value}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
        </div>
        <Select value={kindFilter} onValueChange={setKindFilter}>
          <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All items</SelectItem>
            <SelectItem value="product" className="text-xs">Products</SelectItem>
            <SelectItem value="service" className="text-xs">Services</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="text-center py-10">
          <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">Nothing in your catalog yet</p>
          <p className="text-xs text-muted-foreground mb-3">Add items one by one, or import your existing list from a CSV.</p>
          <div className="flex gap-2 justify-center">
            <Button size="sm" className="h-8 text-xs" onClick={() => { setEditing(null); setForm(emptyItem); setDialogOpen(true); }}>Add Item</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setImportOpen(true)}>Import CSV</Button>
          </div>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(item => (
            <Card key={item.id} className={item.is_active ? '' : 'opacity-60'}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary" className="text-[10px] capitalize">{item.kind}</Badge>
                  <Switch checked={item.is_active} onCheckedChange={() => toggleActive(item)} />
                </div>
                <h3 className="font-semibold text-sm text-foreground">{item.name}</h3>
                {item.sku && <p className="text-[10px] text-muted-foreground">SKU: {item.sku}</p>}
                {item.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-semibold text-primary">{formatMoney(item.price, item.currency)}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
                {item.tax_rate > 0 && <p className="text-[10px] text-muted-foreground mt-1">+ {item.tax_rate}% tax</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); setForm(emptyItem); } }}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-sm">{editing ? 'Edit item' : 'Add to catalog'}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v })}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product" className="text-xs">Product</SelectItem>
                    <SelectItem value="service" className="text-xs">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">SKU / Code</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="h-8 text-xs mt-1" /></div>
            </div>
            <div><Label className="text-xs">Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-8 text-xs mt-1" /></div>
            <div><Label className="text-xs">Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="text-xs mt-1" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs">Price</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="h-8 text-xs mt-1" /></div>
              <div>
                <Label className="text-xs">Currency</Label>
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Tax %</Label><Input type="number" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: e.target.value })} className="h-8 text-xs mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="unit / hour / kg" className="h-8 text-xs mt-1" /></div>
              <div><Label className="text-xs">Stock (products)</Label><Input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} className="h-8 text-xs mt-1" /></div>
            </div>
            <div><Label className="text-xs">Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="h-8 text-xs mt-1" /></div>
            <div className="flex items-center justify-between"><Label className="text-xs">Show publicly</Label><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /></div>
            <Button onClick={save} className="w-full h-8 text-xs">{editing ? 'Update' : 'Add item'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <CsvImporter
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import products & services"
        table="business_products"
        baseRow={{ business_id: businessId }}
        onDone={fetchItems}
        fields={[
          { key: 'name', label: 'Name', required: true, aliases: ['item', 'product', 'title'] },
          { key: 'kind', label: 'Type (product/service)', aliases: ['type'], transform: (v) => (String(v).toLowerCase().startsWith('s') ? 'service' : 'product') },
          { key: 'description', label: 'Description' },
          { key: 'sku', label: 'SKU', aliases: ['code'] },
          { key: 'price', label: 'Price', aliases: ['rate', 'amount'], transform: (v) => parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0 },
          { key: 'currency', label: 'Currency', transform: (v) => String(v).toUpperCase().slice(0, 3) },
          { key: 'tax_rate', label: 'Tax %', aliases: ['gst', 'tax'], transform: (v) => parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0 },
          { key: 'unit', label: 'Unit' },
          { key: 'stock_quantity', label: 'Stock', aliases: ['qty', 'quantity'], transform: (v) => parseInt(String(v).replace(/[^0-9]/g, ''), 10) || null },
        ]}
      />
    </div>
  );
};

export default BusinessCatalog;
