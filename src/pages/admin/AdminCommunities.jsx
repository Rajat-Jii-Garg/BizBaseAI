import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, RefreshCw, Search, Trash2, Users, Lock, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AdminCommunities = () => {
  const { fetchCommunities, deleteCommunity } = useAdmin();
  const [communities, setCommunities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (s = '') => {
    setLoading(true);
    const data = await fetchCommunities(s);
    setCommunities(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  const handleSearch = (e) => { e.preventDefault(); load(search); };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete community "${name}" and all its members?`)) return;
    const success = await deleteCommunity(id);
    if (success) {
      toast.success('Community deleted');
      setCommunities(communities.filter(c => c.id !== id));
    } else {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Communities</h1>
          <p className="text-muted-foreground">{communities.length} communities</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => load(search)}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search communities..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <Card className="border-border/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Privacy</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communities.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {c.image_url ? (
                            <img src={c.image_url} alt="" className="h-8 w-8 rounded-lg object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <span className="font-medium text-foreground text-sm">{c.name}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{c.category}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.profiles?.full_name || '—'}</TableCell>
                      <TableCell className="text-sm">{c.members_count || 0}</TableCell>
                      <TableCell>
                        {c.is_private ? (
                          <Badge variant="secondary"><Lock className="h-3 w-3 mr-1" />Private</Badge>
                        ) : (
                          <Badge variant="outline"><Globe className="h-3 w-3 mr-1" />Public</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.created_at ? format(new Date(c.created_at), 'dd MMM yyyy') : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(c.id, c.name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {communities.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No communities found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCommunities;
