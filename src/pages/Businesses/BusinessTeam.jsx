import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Plus, Search, Loader2, UserPlus, Shield, Mail, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BusinessTeam = () => {
  const { currentBusiness } = useBusinessContext();
  const businessId = currentBusiness?.id;
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: '', department: '' });

  useEffect(() => { if (businessId) fetchTeamMembers(); }, [businessId]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('business_team_members').select('*').eq('business_id', businessId).order('created_at', { ascending: false });
      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) { console.error('Error fetching team members:', error); } finally { setLoading(false); }
  };

  const handleAddMember = async () => {
    if (!newMember.name.trim() || !newMember.role.trim()) { toast.error('Name and role are required'); return; }
    try {
      const { error } = await supabase.from('business_team_members').insert({
        business_id: businessId, name: newMember.name, email: newMember.email || null,
        role: newMember.role, department: newMember.department || null, status: 'active'
      });
      if (error) throw error;
      toast.success('Team member added');
      setIsDialogOpen(false);
      setNewMember({ name: '', email: '', role: '', department: '' });
      fetchTeamMembers();
    } catch (error) { console.error('Error:', error); toast.error('Failed to add member'); }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('business_team_members').delete().eq('id', id);
      if (error) throw error;
      toast.success('Member removed');
      setTeamMembers(prev => prev.filter(m => m.id !== id));
    } catch (error) { toast.error('Failed to remove'); }
  };

  const getStatusColor = (status) => ({
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    invited: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
  }[status] || 'bg-muted text-muted-foreground');

  const filteredMembers = teamMembers.filter(m =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-3 md:p-5 space-y-4 text-[13px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-foreground">Team</h1>
          <p className="text-xs text-muted-foreground">Manage your team members and roles</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button size="sm" className="gap-1.5 text-xs h-8"><UserPlus className="w-3.5 h-3.5" />Add Member</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="text-sm">Add Team Member</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-3">
              <div><Label className="text-xs">Name *</Label><Input value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} placeholder="John Doe" className="h-8 text-xs mt-1" /></div>
              <div><Label className="text-xs">Email</Label><Input type="email" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} placeholder="john@example.com" className="h-8 text-xs mt-1" /></div>
              <div><Label className="text-xs">Role *</Label><Input value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value })} placeholder="Developer, Designer..." className="h-8 text-xs mt-1" /></div>
              <div><Label className="text-xs">Department</Label><Input value={newMember.department} onChange={(e) => setNewMember({ ...newMember, department: e.target.value })} placeholder="Engineering, Marketing..." className="h-8 text-xs mt-1" /></div>
              <Button onClick={handleAddMember} className="w-full h-8 text-xs">Add Member</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Card><CardContent className="p-3 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-950/30"><Users className="w-3.5 h-3.5" /></div>
          <div><p className="text-[10px] text-muted-foreground">Total</p><p className="text-lg font-bold">{teamMembers.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-3 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg text-green-600 bg-green-50 dark:bg-green-950/30"><Shield className="w-3.5 h-3.5" /></div>
          <div><p className="text-[10px] text-muted-foreground">Active</p><p className="text-lg font-bold">{teamMembers.filter(m => m.status === 'active').length}</p></div>
        </CardContent></Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="Search members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 h-8 text-xs" />
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filteredMembers.length === 0 ? (
        <Card><CardContent className="text-center py-10">
          <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">No team members yet</p>
          <Button size="sm" className="text-xs h-8 mt-2" onClick={() => setIsDialogOpen(true)}><Plus className="w-3.5 h-3.5 mr-1" />Add Member</Button>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">{member.name?.charAt(0) || 'T'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-foreground truncate">{member.name}</h3>
                      <Badge className={`text-[10px] ${getStatusColor(member.status)}`}>{member.status}</Badge>
                    </div>
                    <p className="text-xs text-primary font-medium">{member.role}</p>
                    {member.department && <p className="text-[10px] text-muted-foreground">{member.department}</p>}
                    {member.email && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1.5">
                        <Mail className="w-2.5 h-2.5" /><span className="truncate">{member.email}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-3 pt-2 border-t border-border">
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] text-destructive hover:text-destructive" onClick={() => handleDelete(member.id)}>
                    <Trash2 className="w-3 h-3 mr-1" />Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessTeam;
