
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
    { icon: Briefcase, label: 'Jobs', path: '/dashboard/jobs' },
    { icon: MessageSquare, label: 'Messaging', path: '/dashboard/messages' },
    { icon: Bell, label: 'Notifications', path: '/dashboard/notifications' },
    { icon: TrendingUp, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: BookOpen, label: 'Learning', path: '/dashboard/learning' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-100 sticky top-0 z-50">
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
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Network className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ProConnect
                  </span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="hidden md:block relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search professionals, companies, jobs..."
                  className="block w-80 pl-10 pr-3 py-2 border border-gray-200 rounded-full bg-gray-50/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
                </Button>
              </div>
              
              <Button variant="ghost" size="icon">
                <MessageSquare className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-9 w-9 ring-2 ring-blue-200">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold">
                    {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button variant="ghost" onClick={handleSignOut} className="text-sm hover:bg-red-50 hover:text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 h-full w-64 bg-white/80 backdrop-blur-lg shadow-xl border-r border-gray-100 z-40 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:h-auto`}>
        <nav className="p-4 space-y-2">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant={item.active ? "default" : "ghost"}
              className={`w-full justify-start ${
                item.active 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-64'
      }`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
