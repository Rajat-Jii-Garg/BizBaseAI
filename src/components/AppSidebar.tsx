
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  BarChart,
  Brain,
  Settings as Gear,
  LogOut,
} from 'lucide-react';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'CRM', url: '/dashboard/crm', icon: Users },
  { title: 'Projects', url: '/dashboard/projects', icon: Briefcase },
  { title: 'HR', url: '/dashboard/hr', icon: FileText },
  { title: 'Finance', url: '/dashboard/finance', icon: BarChart },
  { title: 'AI Assistant', url: '/dashboard/ai-assistant', icon: Brain },
  { title: 'Settings', url: '/dashboard/settings', icon: Gear },
];

const AppSidebar = () => {
  const location = useLocation();

  // For mobile
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false); // Auto close on route change (ideal in real app)
  }, [location.pathname]);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 md:hidden transition-all duration-300 ${open ? "" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
      ></div>
      <Sidebar className={`fixed md:static z-50 top-0 left-0 h-screen ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"} transition-transform duration-300`}>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between">
              BizBase
              <button className="md:hidden rounded p-1 ml-4" onClick={() => setOpen(false)}>
                <span className="text-2xl">&times;</span>
              </button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        data-active={isActive}
                        className={`group ${isActive ? "bg-blue-50 text-blue-700 font-semibold shadow border-l-4 border-blue-600 z-10" : "hover:bg-gray-100 hover:shadow-sm"} transition-all`}
                      >
                        <Link to={item.url} className="flex items-center gap-2 px-2 py-2 animate-fade-in">
                          <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"}`} />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex flex-col items-center pb-4">
            <button
              className="text-gray-400 hover:text-red-600 flex items-center gap-1 text-sm transition-colors"
              onClick={() => {
                window.location.href = "/login";
                // Ideally toast shown here.
              }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>
      {/* Toggle button for mobile */}
      <button
        className="fixed z-50 bottom-4 left-4 md:hidden p-3 rounded-full bg-blue-600 text-white shadow-lg"
        style={{ display: open ? "none" : undefined }}
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
      >
        <Gear />
      </button>
    </>
  );
};

export default AppSidebar;
