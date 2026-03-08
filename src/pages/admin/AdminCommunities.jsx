import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, RefreshCw, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AdminCommunities = () => {
  const { fetchCommunities, deleteCommunity } = useAdmin();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await fetchCommunities();
    setCommunities(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete community "${name}" and remove all members?`)) return;
    const success = await deleteCommunity(id);
    if (success) {
      toast.success('Community deleted');
      setCommunities(communities.filter(c => c.id !== id));
    } else {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Communities</h1>
          <p className="text-muted-foreground">{communities.length} communities</p>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Privacy</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {communities.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{c.category}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-3 w-3" /> {c.members_count || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.is_private ? 'secondary' : 'default'}>
                        {c.is_private ? 'Private' : 'Public'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground capitalize">{c.activity_level || 'moderate'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.created_at ? format(new Date(c.created_at), 'dd MMM yyyy') : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(c.id, c.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {communities.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No communities found</TableCell>
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

export default AdminCommunities;
