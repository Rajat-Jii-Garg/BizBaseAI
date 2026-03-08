import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, RefreshCw, Search, ShieldCheck, ShieldX, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AdminBusinesses = () => {
  const { fetchBusinesses, toggleBusinessVerified, toggleBusinessStatus } = useAdmin();
  const [businesses, setBusinesses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (s = '') => {
    setLoading(true);
    const data = await fetchBusinesses(s);
    setBusinesses(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  const handleSearch = (e) => { e.preventDefault(); load(search); };

  const handleToggleVerified = async (id, current) => {
    const success = await toggleBusinessVerified(id, !current);
    if (success) {
      toast.success(current ? 'Verification removed' : 'Business verified');
      setBusinesses(businesses.map(b => b.id === id ? { ...b, is_verified: !current } : b));
    }
  };

  const handleToggleStatus = async (id, current) => {
    const newStatus = current === 'active' ? 'suspended' : 'active';
    const success = await toggleBusinessStatus(id, newStatus);
    if (success) {
      toast.success(`Business ${newStatus}`);
      setBusinesses(businesses.map(b => b.id === id ? { ...b, status: newStatus } : b));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Businesses</h1>
          <p className="text-muted-foreground">{businesses.length} businesses</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => load(search)}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
                    <TableHead>Business</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Followers</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businesses.map((biz) => (
                    <TableRow key={biz.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={biz.logo_url} />
                            <AvatarFallback>{biz.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground text-sm">{biz.name}</p>
                            <p className="text-xs text-muted-foreground">{biz.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{biz.profiles?.full_name || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{biz.industry}</TableCell>
                      <TableCell>
                        <Badge variant={biz.status === 'active' ? 'default' : 'destructive'}>{biz.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(biz.created_at), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="text-sm">{biz.followers_count || 0}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleToggleVerified(biz.id, biz.is_verified)} className={biz.is_verified ? 'text-green-500' : 'text-muted-foreground'}>
                          {biz.is_verified ? <ShieldCheck className="h-4 w-4" /> : <ShieldX className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(biz.id, biz.status)} className={biz.status === 'active' ? 'text-destructive' : 'text-green-500'}>
                          {biz.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {businesses.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No businesses found</TableCell></TableRow>
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

export default AdminBusinesses;
