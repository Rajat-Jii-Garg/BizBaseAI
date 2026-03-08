import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, Search, Filter, Phone, Mail, Building2, DollarSign, Clock, Loader2, Plus, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BusinessCRM = () => {
  const { currentBusiness } = useBusinessContext();
  const businessId = currentBusiness?.id;
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', company: '', status: 'new', source: '', value: '', notes: '' });

  useEffect(() => { if (businessId) fetchLeads(); }, [businessId]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('business_leads').select('*').eq('business_id', businessId).order('created_at', { ascending: false });
      if (error) throw error;
      setLeads(data || []);
    } catch (error) { console.error('Error fetching leads:', error); } finally { setLoading(false); }
  };

  const handleSaveLead = async () => {
    if (!newLead.name.trim()) { toast.error('Name is required'); return; }
    try {
      const payload = {
        business_id: businessId, name: newLead.name, email: newLead.email || null,
        phone: newLead.phone || null, company: newLead.company || null, status: newLead.status,
        source: newLead.source || null, value: newLead.value ? parseFloat(newLead.value) : null, notes: newLead.notes || null
      };
      if (editingLead) {
        const { error } = await supabase.from('business_leads').update(payload).eq('id', editingLead.id);
        if (error) throw error;
        toast.success('Lead updated');
      } else {
        const { error } = await supabase.from('business_leads').insert(payload);
        if (error) throw error;
        toast.success('Lead added');
      }
      closeDialog(); fetchLeads();
    } catch (error) { console.error('Error:', error); toast.error('Failed to save lead'); }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setNewLead({ name: lead.name, email: lead.email || '', phone: lead.phone || '', company: lead.company || '', status: lead.status, source: lead.source || '', value: lead.value?.toString() || '', notes: lead.notes || '' });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('business_leads').delete().eq('id', id);
      if (error) throw error;
      toast.success('Lead deleted');
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch (error) { toast.error('Failed to delete'); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { error } = await supabase.from('business_leads').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
      toast.success('Status updated');
    } catch (error) { toast.error('Failed to update'); }
  };

  const closeDialog = () => { setIsDialogOpen(false); setEditingLead(null); setNewLead({ name: '', email: '', phone: '', company: '', status: 'new', source: '', value: '', notes: '' }); };

  const getStatusColor = (status) => ({
    new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    contacted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    qualified: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    proposal: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    negotiation: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    closed_won: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    closed_lost: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }[status] || 'bg-muted text-muted-foreground');

  const filteredLeads = leads.filter(l => {
    const matchSearch = l.name?.toLowerCase().includes(searchTerm.toLowerCase()) || l.email?.toLowerCase().includes(searchTerm.toLowerCase()) || l.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = { total: leads.length, new: leads.filter(l => l.status === 'new').length, qualified: leads.filter(l => l.status === 'qualified').length, totalValue: leads.reduce((sum, l) => sum + (l.value || 0), 0) };

  return (
    <div className="p-3 md:p-5 space-y-4 text-[13px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-foreground">CRM / Leads</h1>
          <p className="text-xs text-muted-foreground">Manage business leads and opportunities</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setIsDialogOpen(true); }}>
          <DialogTrigger asChild><Button size="sm" className="gap-1.5 text-xs h-8"><UserPlus className="w-3.5 h-3.5" />Add Lead</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="text-sm">{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-3">
              <div><Label className="text-xs">Name *</Label><Input value={newLead.name} onChange={(e) => setNewLead({ ...newLead, name: e.target.value })} placeholder="John Doe" className="h-8 text-xs mt-1" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Email</Label><Input type="email" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} placeholder="john@example.com" className="h-8 text-xs mt-1" /></div>
                <div><Label className="text-xs">Phone</Label><Input value={newLead.phone} onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })} placeholder="+91 12345 67890" className="h-8 text-xs mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Company</Label><Input value={newLead.company} onChange={(e) => setNewLead({ ...newLead, company: e.target.value })} placeholder="Company" className="h-8 text-xs mt-1" /></div>
                <div><Label className="text-xs">Value (₹)</Label><Input type="number" value={newLead.value} onChange={(e) => setNewLead({ ...newLead, value: e.target.value })} placeholder="10000" className="h-8 text-xs mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Status</Label><Select value={newLead.status} onValueChange={(v) => setNewLead({ ...newLead, status: v })}><SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="new">New</SelectItem><SelectItem value="contacted">Contacted</SelectItem><SelectItem value="qualified">Qualified</SelectItem><SelectItem value="proposal">Proposal</SelectItem><SelectItem value="negotiation">Negotiation</SelectItem><SelectItem value="closed_won">Closed Won</SelectItem><SelectItem value="closed_lost">Closed Lost</SelectItem></SelectContent></Select></div>
                <div><Label className="text-xs">Source</Label><Input value={newLead.source} onChange={(e) => setNewLead({ ...newLead, source: e.target.value })} placeholder="Website, Referral..." className="h-8 text-xs mt-1" /></div>
              </div>
              <div><Label className="text-xs">Notes</Label><Textarea value={newLead.notes} onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })} placeholder="Additional notes..." className="text-xs mt-1" rows={2} /></div>
              <Button onClick={handleSaveLead} className="w-full h-8 text-xs">{editingLead ? 'Update' : 'Add'} Lead</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: 'Total Leads', value: stats.total, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30', icon: UserPlus },
          { label: 'New', value: stats.new, color: 'text-green-600 bg-green-50 dark:bg-green-950/30', icon: Clock },
          { label: 'Qualified', value: stats.qualified, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30', icon: Building2 },
          { label: 'Pipeline', value: `₹${stats.totalValue.toLocaleString()}`, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30', icon: DollarSign },
        ].map((s, i) => (
          <Card key={i}><CardContent className="p-3 flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${s.color}`}><s.icon className="w-3.5 h-3.5" /></div>
            <div><p className="text-[10px] text-muted-foreground">{s.label}</p><p className="text-lg font-bold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search leads..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 h-8 text-xs" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-8 text-xs"><Filter className="w-3 h-3 mr-1" /><SelectValue placeholder="Filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="proposal">Proposal</SelectItem>
            <SelectItem value="closed_won">Closed Won</SelectItem>
            <SelectItem value="closed_lost">Closed Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filteredLeads.length === 0 ? (
        <Card><CardContent className="text-center py-10">
          <UserPlus className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">No leads yet</p>
          <Button size="sm" className="text-xs h-8 mt-2" onClick={() => setIsDialogOpen(true)}><Plus className="w-3.5 h-3.5 mr-1" />Add Lead</Button>
        </CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium text-[10px] text-muted-foreground uppercase">Name</th>
                    <th className="text-left p-3 font-medium text-[10px] text-muted-foreground uppercase hidden md:table-cell">Contact</th>
                    <th className="text-left p-3 font-medium text-[10px] text-muted-foreground uppercase hidden lg:table-cell">Company</th>
                    <th className="text-left p-3 font-medium text-[10px] text-muted-foreground uppercase">Status</th>
                    <th className="text-left p-3 font-medium text-[10px] text-muted-foreground uppercase hidden sm:table-cell">Value</th>
                    <th className="text-right p-3 font-medium text-[10px] text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="border-t border-border hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 flex-shrink-0"><AvatarFallback className="text-[10px] bg-primary/10 text-primary">{lead.name?.charAt(0)}</AvatarFallback></Avatar>
                          <div className="min-w-0">
                            <span className="font-medium text-xs block truncate">{lead.name}</span>
                            <span className="text-[10px] text-muted-foreground md:hidden">{lead.email || lead.phone || ''}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <div className="space-y-0.5">
                          {lead.email && <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><Mail className="w-2.5 h-2.5" />{lead.email}</div>}
                          {lead.phone && <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><Phone className="w-2.5 h-2.5" />{lead.phone}</div>}
                        </div>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground hidden lg:table-cell">{lead.company || '-'}</td>
                      <td className="p-3">
                        <Select value={lead.status} onValueChange={(v) => handleStatusChange(lead.id, v)}>
                          <SelectTrigger className="h-6 text-[10px] border-0 p-0 w-auto"><Badge className={`text-[10px] ${getStatusColor(lead.status)}`}>{lead.status?.replace('_', ' ')}</Badge></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem><SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem><SelectItem value="proposal">Proposal</SelectItem>
                            <SelectItem value="closed_won">Closed Won</SelectItem><SelectItem value="closed_lost">Closed Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3 text-xs font-medium hidden sm:table-cell">{lead.value ? `₹${lead.value.toLocaleString()}` : '-'}</td>
                      <td className="p-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="w-3.5 h-3.5" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(lead)} className="text-xs"><Edit className="w-3 h-3 mr-2" />Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(lead.id)} className="text-xs text-destructive"><Trash2 className="w-3 h-3 mr-2" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BusinessCRM;
