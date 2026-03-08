import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Plus, Search, Loader2, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BusinessServices = () => {
  const { currentBusiness } = useBusinessContext();
  const businessId = currentBusiness?.id;
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({ name: '', description: '', price: '', duration: '', is_active: true });

  useEffect(() => {
    if (businessId) fetchServices();
  }, [businessId]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('business_services').select('*').eq('business_id', businessId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally { setLoading(false); }
  };

  const handleAddService = async () => {
    if (!newService.name.trim()) { toast.error('Service name is required'); return; }
    try {
      const payload = {
        business_id: businessId, name: newService.name,
        description: newService.description || null,
        price: newService.price ? parseFloat(newService.price) : null,
        duration: newService.duration || null, is_active: newService.is_active
      };
      
      if (editingService) {
        const { error } = await supabase.from('business_services').update(payload).eq('id', editingService.id);
        if (error) throw error;
        toast.success('Service updated');
      } else {
        const { error } = await supabase.from('business_services').insert(payload);
        if (error) throw error;
        toast.success('Service added');
      }
      setIsDialogOpen(false);
      setEditingService(null);
      setNewService({ name: '', description: '', price: '', duration: '', is_active: true });
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setNewService({
      name: service.name, description: service.description || '',
      price: service.price?.toString() || '', duration: service.duration || '',
      is_active: service.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('business_services').delete().eq('id', id);
      if (error) throw error;
      toast.success('Service deleted');
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  const toggleServiceStatus = async (serviceId, currentStatus) => {
    try {
      const { error } = await supabase.from('business_services').update({ is_active: !currentStatus }).eq('id', serviceId);
      if (error) throw error;
      setServices(prev => prev.map(s => s.id === serviceId ? { ...s, is_active: !currentStatus } : s));
      toast.success(`Service ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error) { toast.error('Failed to update'); }
  };

  const filteredServices = services.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const activeServices = services.filter(s => s.is_active).length;

  return (
    <div className="p-3 md:p-5 space-y-4 text-[13px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-foreground">Services</h1>
          <p className="text-xs text-muted-foreground">Manage services you offer to clients</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingService(null); setNewService({ name: '', description: '', price: '', duration: '', is_active: true }); } }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 text-xs h-8"><Plus className="w-3.5 h-3.5" />Add Service</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="text-sm">{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-3">
              <div><Label className="text-xs">Service Name *</Label><Input value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} placeholder="Web Development" className="h-8 text-xs mt-1" /></div>
              <div><Label className="text-xs">Description</Label><Textarea value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} placeholder="Describe your service..." className="text-xs mt-1" rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Price (₹)</Label><Input type="number" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} placeholder="5000" className="h-8 text-xs mt-1" /></div>
                <div><Label className="text-xs">Duration</Label><Input value={newService.duration} onChange={(e) => setNewService({ ...newService, duration: e.target.value })} placeholder="2 weeks" className="h-8 text-xs mt-1" /></div>
              </div>
              <div className="flex items-center justify-between"><Label className="text-xs">Active</Label><Switch checked={newService.is_active} onCheckedChange={(checked) => setNewService({ ...newService, is_active: checked })} /></div>
              <Button onClick={handleAddService} className="w-full h-8 text-xs">{editingService ? 'Update Service' : 'Add Service'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total', value: services.length, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Active', value: activeServices, color: 'text-green-600 bg-green-50 dark:bg-green-950/30' },
          { label: 'Inactive', value: services.length - activeServices, color: 'text-slate-600 bg-slate-50 dark:bg-slate-950/30' },
        ].map((s, i) => (
          <Card key={i}><CardContent className="p-3 flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${s.color}`}><Briefcase className="w-3.5 h-3.5" /></div>
            <div><p className="text-[10px] text-muted-foreground">{s.label}</p><p className="text-lg font-bold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="Search services..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 h-8 text-xs" />
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filteredServices.length === 0 ? (
        <Card><CardContent className="text-center py-10">
          <Briefcase className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">No services yet</p>
          <p className="text-xs text-muted-foreground mb-3">Add your first service to get started</p>
          <Button size="sm" className="text-xs h-8" onClick={() => setIsDialogOpen(true)}><Plus className="w-3.5 h-3.5 mr-1" />Add Service</Button>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredServices.map((service) => (
            <Card key={service.id} className={`hover:shadow-md transition-shadow ${!service.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg"><Briefcase className="w-4 h-4 text-primary" /></div>
                  <div className="flex items-center gap-2">
                    <Badge variant={service.is_active ? 'default' : 'secondary'} className="text-[10px]">{service.is_active ? 'Active' : 'Inactive'}</Badge>
                    <Switch checked={service.is_active} onCheckedChange={() => toggleServiceStatus(service.id, service.is_active)} />
                  </div>
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1">{service.name}</h3>
                {service.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{service.description}</p>}
                <div className="flex items-center justify-between text-xs">
                  {service.price && <span className="flex items-center gap-0.5 text-green-600 font-semibold"><DollarSign className="w-3 h-3" />₹{service.price.toLocaleString()}</span>}
                  {service.duration && <span className="text-muted-foreground">{service.duration}</span>}
                </div>
                <div className="flex gap-2 mt-3 pt-2 border-t border-border">
                  <Button variant="ghost" size="sm" className="flex-1 h-7 text-[10px]" onClick={() => handleEdit(service)}>Edit</Button>
                  <Button variant="ghost" size="sm" className="flex-1 h-7 text-[10px] text-destructive hover:text-destructive" onClick={() => handleDelete(service.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessServices;
