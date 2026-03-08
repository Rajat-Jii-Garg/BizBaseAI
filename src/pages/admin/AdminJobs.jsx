import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, RefreshCw, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AdminJobs = () => {
  const { fetchJobs, deleteJob, toggleJobStatus } = useAdmin();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await fetchJobs();
    setJobs(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete job "${title}" and all applications?`)) return;
    const success = await deleteJob(id);
    if (success) {
      toast.success('Job deleted');
      setJobs(jobs.filter(j => j.id !== id));
    } else {
      toast.error('Failed to delete');
    }
  };

  const handleToggle = async (id) => {
    const result = await toggleJobStatus(id);
    if (result?.success) {
      toast.success(result.is_active ? 'Job activated' : 'Job deactivated');
      setJobs(jobs.map(j => j.id === id ? { ...j, is_active: result.is_active } : j));
    } else {
      toast.error('Failed to toggle');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Jobs</h1>
          <p className="text-muted-foreground">{jobs.length} jobs</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Apps</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium text-foreground">{job.title}</TableCell>
                    <TableCell className="text-muted-foreground">{job.company_name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{job.location}</TableCell>
                    <TableCell><Badge variant="outline">{job.job_type}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={job.is_active ? 'default' : 'secondary'}>
                        {job.is_active ? 'Active' : 'Closed'}
                      </Badge>
                    </TableCell>
                    <TableCell>{job.applications_count}</TableCell>
                    <TableCell>{job.views_count}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(job.created_at), 'dd MMM')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggle(job.id)}
                          title={job.is_active ? 'Deactivate' : 'Activate'}
                          className={job.is_active ? 'text-green-500' : 'text-muted-foreground'}
                        >
                          {job.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(job.id, job.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {jobs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No jobs found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminJobs;
