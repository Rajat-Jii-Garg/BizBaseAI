import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FolderKanban, Plus, Search, Loader2, Calendar, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BusinessProjects = () => {
  const { currentBusiness } = useBusinessContext();
  const businessId = currentBusiness?.id;
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newProject, setNewProject] = useState({ name: '', client_name: '', description: '', status: 'active', start_date: '', end_date: '', budget: '' });

  useEffect(() => { if (businessId) fetchProjects(); }, [businessId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('business_projects').select('*').eq('business_id', businessId).order('created_at', { ascending: false });
      if (error) throw error;
      setProjects(data || []);
    } catch (error) { console.error('Error fetching projects:', error); } finally { setLoading(false); }
  };

  const handleSaveProject = async () => {
    if (!newProject.name.trim()) { toast.error('Project name is required'); return; }
    try {
      const payload = {
        business_id: businessId, name: newProject.name,
        client_name: newProject.client_name || null, description: newProject.description || null,
        status: newProject.status, start_date: newProject.start_date || null,
        end_date: newProject.end_date || null, budget: newProject.budget ? parseFloat(newProject.budget) : null
      };
      if (editingProject) {
        const { error } = await supabase.from('business_projects').update(payload).eq('id', editingProject.id);
        if (error) throw error;
        toast.success('Project updated');
      } else {
        const { error } = await supabase.from('business_projects').insert(payload);
        if (error) throw error;
        toast.success('Project created');
      }
      closeDialog(); fetchProjects();
    } catch (error) { console.error('Error:', error); toast.error('Failed to save project'); }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('business_projects').delete().eq('id', id);
      if (error) throw error;
      toast.success('Project deleted');
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) { toast.error('Failed to delete'); }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setNewProject({ name: project.name, client_name: project.client_name || '', description: project.description || '', status: project.status, start_date: project.start_date || '', end_date: project.end_date || '', budget: project.budget?.toString() || '' });
    setIsDialogOpen(true);
  };

  const closeDialog = () => { setIsDialogOpen(false); setEditingProject(null); setNewProject({ name: '', client_name: '', description: '', status: 'active', start_date: '', end_date: '', budget: '' }); };

  const getStatusColor = (status) => ({
    active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    on_hold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }[status] || 'bg-muted text-muted-foreground');

  const getProgress = (project) => {
    if (project.status === 'completed') return 100;
    if (project.status === 'cancelled') return 0;
    if (!project.start_date || !project.end_date) return 50;
    const start = new Date(project.start_date), end = new Date(project.end_date), now = new Date();
    if (now < start) return 0; if (now > end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const filteredProjects = projects.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.client_name?.toLowerCase().includes(searchTerm.toLowerCase()));
  const stats = { total: projects.length, active: projects.filter(p => p.status === 'active').length, completed: projects.filter(p => p.status === 'completed').length, totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0) };

  return (
    <div className="p-3 md:p-5 space-y-4 text-[13px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-foreground">Projects</h1>
          <p className="text-xs text-muted-foreground">Manage your business projects</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setIsDialogOpen(true); }}>
          <DialogTrigger asChild><Button size="sm" className="gap-1.5 text-xs h-8"><Plus className="w-3.5 h-3.5" />New Project</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="text-sm">{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-3">
              <div><Label className="text-xs">Project Name *</Label><Input value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} placeholder="Website Redesign" className="h-8 text-xs mt-1" /></div>
              <div><Label className="text-xs">Client Name</Label><Input value={newProject.client_name} onChange={(e) => setNewProject({ ...newProject, client_name: e.target.value })} placeholder="ABC Corp" className="h-8 text-xs mt-1" /></div>
              <div><Label className="text-xs">Description</Label><Textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} placeholder="Project details..." className="text-xs mt-1" rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Start Date</Label><Input type="date" value={newProject.start_date} onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })} className="h-8 text-xs mt-1" /></div>
                <div><Label className="text-xs">End Date</Label><Input type="date" value={newProject.end_date} onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })} className="h-8 text-xs mt-1" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Budget (₹)</Label><Input type="number" value={newProject.budget} onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })} placeholder="50000" className="h-8 text-xs mt-1" /></div>
                <div><Label className="text-xs">Status</Label><Select value={newProject.status} onValueChange={(v) => setNewProject({ ...newProject, status: v })}><SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="on_hold">On Hold</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select></div>
              </div>
              <Button onClick={handleSaveProject} className="w-full h-8 text-xs">{editingProject ? 'Update' : 'Create'} Project</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: 'Total', value: stats.total, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Active', value: stats.active, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30' },
          { label: 'Completed', value: stats.completed, color: 'text-green-600 bg-green-50 dark:bg-green-950/30' },
          { label: 'Budget', value: `₹${(stats.totalBudget / 1000).toFixed(0)}K`, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
        ].map((s, i) => (
          <Card key={i}><CardContent className="p-3 flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${s.color}`}><FolderKanban className="w-3.5 h-3.5" /></div>
            <div><p className="text-[10px] text-muted-foreground">{s.label}</p><p className="text-lg font-bold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="Search projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 h-8 text-xs" />
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filteredProjects.length === 0 ? (
        <Card><CardContent className="text-center py-10">
          <FolderKanban className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">No projects yet</p>
          <Button size="sm" className="text-xs h-8 mt-2" onClick={() => setIsDialogOpen(true)}><Plus className="w-3.5 h-3.5 mr-1" />New Project</Button>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProjects.map((project) => {
            const progress = getProgress(project);
            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={`text-[10px] ${getStatusColor(project.status)}`}>{project.status?.replace('_', ' ')}</Badge>
                    {project.budget && <span className="text-xs font-semibold text-green-600">₹{project.budget.toLocaleString()}</span>}
                  </div>
                  <h3 className="font-semibold text-sm text-foreground mb-0.5">{project.name}</h3>
                  {project.client_name && <p className="text-xs text-primary mb-1.5">{project.client_name}</p>}
                  {project.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{project.description}</p>}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground"><span>Progress</span><span>{progress}%</span></div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                  {(project.start_date || project.end_date) && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2">
                      <Calendar className="w-2.5 h-2.5" />
                      {project.start_date && new Date(project.start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      {project.start_date && project.end_date && ' - '}
                      {project.end_date && new Date(project.end_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                  <div className="flex gap-2 mt-3 pt-2 border-t border-border">
                    <Button variant="ghost" size="sm" className="flex-1 h-7 text-[10px]" onClick={() => handleEdit(project)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="flex-1 h-7 text-[10px] text-destructive hover:text-destructive" onClick={() => handleDelete(project.id)}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BusinessProjects;
