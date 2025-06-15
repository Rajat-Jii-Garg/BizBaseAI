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
  { title: 'FAQ & Support', url: '/faq', icon: FileText },
];

const AppSidebar = ({ className = '' }: { className?: string }) => {
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
      <div className={`w-64 hidden md:block h-screen fixed left-0 top-0 z-40 bg-white border-r border-gray-200 ${className}`}>
        {/* Static sidebar for desktop */}
        <div className="p-6 border-b border-gray-200">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              {/* Icon */}
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white"><circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.15"/><circle cx="12" cy="12" r="5" fill="white" fillOpacity="0.6"/></svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">BizBase</span>
          </Link>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-l-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <button
            className="w-full flex justify-start text-red-600 hover:text-red-700 hover:bg-red-50 items-center px-4 py-2 rounded-lg"
            onClick={() => (window.location.href = '/')}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 16l4-4m0 0l-4-4m4 4H7" /><path d="M3 12a9 9 0 0 1 9-9h4a9 9 0 0 1 9 9 9 9 0 0 1-9 9h-4a9 9 0 0 1-9-9Z"/></svg>
            Logout
          </button>
        </div>
      </div>
      {/* Sidebar for mobile */}
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
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="6" width="16" height="2" fill="currentColor"/>
          <rect x="4" y="11" width="16" height="2" fill="currentColor"/>
          <rect x="4" y="16" width="16" height="2" fill="currentColor"/>
        </svg>
      </button>
    </>
  );
};

export default AppSidebar;
