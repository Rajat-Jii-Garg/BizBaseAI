import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { Loader2, LayoutDashboard, Users, FileText, Building2, Briefcase, Shield, LogOut, BarChart3, Settings, Globe, Calendar, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/admin-panel/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin-panel/users', label: 'Users', icon: Users },
  { path: '/admin-panel/posts', label: 'Posts', icon: FileText },
  { path: '/admin-panel/businesses', label: 'Businesses', icon: Building2 },
  { path: '/admin-panel/jobs', label: 'Jobs', icon: Briefcase },
  { path: '/admin-panel/communities', label: 'Communities', icon: Globe },
  { path: '/admin-panel/events', label: 'Events', icon: Calendar },
  { path: '/admin-panel/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin-panel/settings', label: 'Settings', icon: Settings },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, adminLoading } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user || !isAdmin) {
        navigate('/admin-login', { replace: true });
      }
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-bold text-foreground text-lg">BizBase Admin</h1>
            <p className="text-xs text-muted-foreground">Control Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              location.pathname === path
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={() => navigate('/dashboard')}
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Back to App
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate('/admin-login');
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border flex items-center px-4">
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 ml-3">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-bold text-foreground">Admin Panel</span>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setMobileOpen(false)} />
          <aside className="md:hidden fixed inset-y-0 left-0 w-72 bg-card border-r border-border z-50 flex flex-col">
            <div className="absolute top-3 right-3">
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64 mt-14 md:mt-0 overflow-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
