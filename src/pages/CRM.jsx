import React, { useState, useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from '@/components/AppSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Mail, Phone, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from '@/integrations/supabase/client';

const CRM = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    business: '',
    website: '',
    audience: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('LEADS')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Error",
        description: "Failed to load leads",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  function getStageColor(stage) {
    switch (stage) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Won': return 'bg-green-100 text-green-800';
      case 'Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  function getScoreColor(score) {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  }
  const handleAddLead = async () => {
    if (!newLead.name || !newLead.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in at least name and email",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('LEADS')
        .insert([{
          name: newLead.name,
          email: newLead.email,
          business: newLead.business,
          website: newLead.website,
          audience: newLead.audience
        }])
        .select()
        .single();

      if (error) throw error;

      setModalOpen(false);
      toast({
        title: "Lead Added",
        description: "Lead has been successfully added to your CRM"
      });
      
      setLeads(old => [data, ...old]);
      setNewLead({ name: '', email: '', business: '', website: '', audience: '' });
    } catch (error) {
      console.error('Error adding lead:', error);
      toast({
        title: "Error", 
        description: "Failed to add lead",
        variant: "destructive"
      });
    }
  };

  const filteredLeads = leads.filter(
    lead =>
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.business?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex">
      <AppSidebar isCollapsed={false} />
      <div className="flex-1 ml-0 md:ml-64 bg-gray-50">
        <DashboardHeader />
        <main className="p-4 md:p-8 max-w-6xl mx-auto w-full">
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">CRM</h1>
              <p className="text-gray-600">Manage your leads and customer relationships</p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Lead
            </Button>
          </div>
          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-3 h-4 w-4 text-gray-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <Input
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Table or Skeleton/Empty State */}
          <Card>
            <CardHeader>
              <CardTitle>Leads</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-5 py-2">
                      <Skeleton className="h-5 w-1/4" />
                      <Skeleton className="h-5 w-1/4" />
                      <Skeleton className="h-5 w-1/5" />
                      <Skeleton className="h-8 w-16 ml-auto" />
                    </div>
                  ))}
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="flex flex-col items-center p-8">
                  <span className="text-5xl mb-3">📭</span>
                  <h3 className="font-bold text-lg mb-1">No leads found</h3>
                  <p className="text-sm text-gray-500 mb-4 text-center">Get started by adding your first lead.</p>
                  <Button onClick={() => setModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lead
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead>
                      <tr className="text-xs text-gray-500 bg-gray-50">
                        <th className="py-2 px-4">Name</th>
                        <th className="py-2 px-4">Email</th>
                        <th className="py-2 px-4">Business</th>
                        <th className="py-2 px-4">Website</th>
                        <th className="py-2 px-4">Target Audience</th>
                        <th className="py-2 px-4">Created</th>
                        <th className="py-2 px-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map(lead => (
                        <tr key={lead.id} className="border-b hover:bg-gray-50 transition">
                          <td className="py-2 px-4 font-medium text-gray-900">{lead.name}</td>
                          <td className="py-2 px-4">{lead.email}</td>
                          <td className="py-2 px-4">{lead.business || '-'}</td>
                          <td className="py-2 px-4">{lead.website || '-'}</td>
                          <td className="py-2 px-4">{lead.audience || '-'}</td>
                          <td className="py-2 px-4">{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}</td>
                          <td className="py-2 px-4"><Button size="sm" variant="outline">View Details</Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Add Lead Dialog */}
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 mt-3" onSubmit={(e) => { e.preventDefault(); handleAddLead(); }}>
                <Input 
                  placeholder="Name/Company" 
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  required 
                />
                <Input 
                  placeholder="Email" 
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  required 
                />
                <Input 
                  placeholder="Business Type"
                  value={newLead.business}
                  onChange={(e) => setNewLead({ ...newLead, business: e.target.value })}
                />
                <Input 
                  placeholder="Website"
                  value={newLead.website}
                  onChange={(e) => setNewLead({ ...newLead, website: e.target.value })}
                />
                <Input 
                  placeholder="Target Audience"
                  value={newLead.audience}
                  onChange={(e) => setNewLead({ ...newLead, audience: e.target.value })}
                />
                <Button type="submit" className="w-full bg-blue-600 text-white">Save Lead</Button>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default CRM;
