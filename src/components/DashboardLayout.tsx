
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  MessageSquare, 
  Network, 
  Search,
  Menu,
  Settings,
  LogOut,
  User,
  Home,
  Users,
  Briefcase,
  TrendingUp,
  BookOpen
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = [
    { icon: Home, label: 'Home', path: '/dashboard', active: true },
    { icon: Network, label: 'My Network', path: '/dashboard/network' },
    { icon: Briefcase, label: 'Business Ops', path: '/dashboard/business' },
    { icon: MessageSquare, label: 'Messaging', path: '/dashboard/messages' },
    { icon: Bell, label: 'Notifications', path: '/dashboard/notifications' },
    { icon: TrendingUp, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: BookOpen, label: 'Learning Hub', path: '/dashboard/learning' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Network className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    BizBase
                  </span>
                  <div className="text-xs text-gray-500 -mt-1">Professional Network</div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="hidden md:block relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search professionals, companies, opportunities..."
                  className="block w-96 pl-10 pr-3 py-2.5 border border-gray-200 rounded-full bg-gray-50/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="relative hover:bg-blue-50">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">5</span>
              </Button>
              
              <Button variant="ghost" size="icon" className="hover:bg-green-50 relative">
                <MessageSquare className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
              </Button>
              
              <div className="flex items-center space-x-3 ml-4">
                <Avatar className="h-9 w-9 ring-2 ring-blue-200 shadow-md">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold">
                    {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.user_metadata?.full_name || 'Professional User'}
                  </p>
                  <p className="text-xs text-gray-500">Pro Member</p>
                </div>
                <Button variant="ghost" onClick={handleSignOut} className="text-sm hover:bg-red-50 hover:text-red-600 ml-2">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 bg-white/90 backdrop-blur-xl shadow-xl border-r border-gray-100 z-40 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:z-auto`}>
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Business Dashboard</h3>
            <p className="text-sm text-gray-500">Manage your professional network</p>
          </div>
          
          <nav className="p-4 space-y-2">
            {menuItems.map((item, index) => (
              <Button
                key={index}
                variant={item.active ? "default" : "ghost"}
                className={`w-full justify-start text-sm h-11 ${
                  item.active 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-100 mt-4">
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-sm bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100">
                <Users className="w-4 h-4 mr-2" />
                Find Connections
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100">
                <Briefcase className="w-4 h-4 mr-2" />
                Business Tools
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-72">
          <div className="p-6 min-h-screen">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
