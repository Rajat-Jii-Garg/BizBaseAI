import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Shield, Database, Bell, Palette, UserPlus, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings = () => {
  const { fetchAdmins, fetchUsers, addAdmin, removeAdmin } = useAdmin();
  const [admins, setAdmins] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [searchingUsers, setSearchingUsers] = useState(false);

  const loadAdmins = async () => {
    setLoadingAdmins(true);
    const data = await fetchAdmins();
    setAdmins(data);
    setLoadingAdmins(false);
  };

  useEffect(() => { loadAdmins(); }, []);

  const handleSearchUsers = async (e) => {
    e.preventDefault();
    if (!userSearch.trim()) return;
    setSearchingUsers(true);
    const users = await fetchUsers(userSearch);
    setAllUsers(users);
    setSearchingUsers(false);
  };

  const handleAddAdmin = async (userId, name) => {
    if (!confirm(`Make "${name}" an admin?`)) return;
    const success = await addAdmin(userId);
    if (success) {
      toast.success(`${name} is now an admin`);
      loadAdmins();
      setAllUsers([]);
      setUserSearch('');
    } else {
      toast.error('Failed to add admin');
    }
  };

  const handleRemoveAdmin = async (userId, name) => {
    if (!confirm(`Remove admin access from "${name}"?`)) return;
    const success = await removeAdmin(userId);
    if (success) {
      toast.success('Admin removed');
      setAdmins(admins.filter(a => a.user_id !== userId));
    } else {
      toast.error('Failed to remove admin. You cannot remove yourself.');
    }
  };

  const adminUserIds = admins.map(a => a.user_id);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Platform configuration & admin management</p>
      </div>

      {/* Admin Role Management */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Admin Management
          </CardTitle>
          <CardDescription>Add or remove platform administrators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Admins */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Current Admins</h3>
            {loadingAdmins ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : admins.length === 0 ? (
              <p className="text-sm text-muted-foreground">No admins found</p>
            ) : (
              <div className="space-y-2">
                {admins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={admin.profiles?.avatar_url} />
                        <AvatarFallback>{admin.profiles?.full_name?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{admin.profiles?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{admin.profiles?.email}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleRemoveAdmin(admin.user_id, admin.profiles?.full_name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Admin */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">Add New Admin</h3>
            <form onSubmit={handleSearchUsers} className="flex gap-2 mb-3">
              <Input placeholder="Search user by name or email..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="flex-1" />
              <Button type="submit" size="sm" disabled={searchingUsers}>
                {searchingUsers ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
              </Button>
            </form>
            {allUsers.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {allUsers.filter(u => !adminUserIds.includes(u.id)).slice(0, 10).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/30">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="text-xs">{user.full_name?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm text-foreground">{user.full_name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleAddAdmin(user.id, user.full_name)}>
                      <UserPlus className="h-3 w-3 mr-1" /> Make Admin
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a href="https://supabase.com/dashboard/project/ahdtenixvhgncwaglxui" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
              Supabase Dashboard <ExternalLink className="h-3 w-3" />
            </a>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Platform notifications are managed via database triggers automatically.</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Theme settings are managed via the app's theme switcher component.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
