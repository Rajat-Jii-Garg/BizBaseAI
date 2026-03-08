import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Trash2, Loader2, RefreshCw, ShieldCheck, ShieldX } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AdminUsers = () => {
  const { fetchUsers, deleteUser, toggleUserVerified } = useAdmin();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUsers = async (searchTerm = '') => {
    setLoading(true);
    const data = await fetchUsers(searchTerm);
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers(search);
  };

  const handleDelete = async (userId, name) => {
    if (!confirm(`Delete user "${name}" permanently? This cannot be undone.`)) return;
    const success = await deleteUser(userId);
    if (success) {
      toast.success('User deleted');
      setUsers(users.filter(u => u.id !== userId));
    } else {
      toast.error('Failed to delete user');
    }
  };

  const handleToggleVerified = async (userId, currentVerified) => {
    const success = await toggleUserVerified(userId, !currentVerified);
    if (success) {
      toast.success(currentVerified ? 'Verification removed' : 'User verified');
      setUsers(users.map(u => u.id === userId ? { ...u, is_verified: !currentVerified } : u));
    } else {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">{users.length} users found</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => loadUsers(search)}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, or username..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>BizCoins</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback>{user.full_name?.[0] || '?'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium text-foreground text-sm">{user.full_name || 'N/A'}</span>
                            {user.current_position && <p className="text-xs text-muted-foreground">{user.current_position}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">@{user.username || '—'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{user.location || '—'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {user.created_at ? format(new Date(user.created_at), 'dd MMM yyyy') : '—'}
                      </TableCell>
                      <TableCell><Badge variant="outline">{Number(user.bizcoins || 0).toFixed(2)}</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleToggleVerified(user.id, user.is_verified)} className={user.is_verified ? 'text-green-500' : 'text-muted-foreground'}>
                          {user.is_verified ? <ShieldCheck className="h-4 w-4" /> : <ShieldX className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(user.id, user.full_name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No users found</TableCell>
                    </TableRow>
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

export default AdminUsers;
