import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings,
  LogOut,
  Sparkles,
  Building2,
  Plus,
  Briefcase,
  Calendar,
  MessageSquare,
  Bell,
  TrendingUp,
  Brain,
  Trophy,
  Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Building2, label: 'My Businesses', path: '/my-businesses' },
    { icon: Users, label: 'My Network', path: '/network' },
    { icon: Briefcase, label: 'Jobs', path: '/jobs' },
    { icon: Calendar, label: 'Events', path: '/events' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
    { icon: Brain, label: 'AI Assistant', path: '/ai-assistant' },
    { icon: TrendingUp, label: 'Insights', path: '/insights' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="w-64 bg-card border-r border-border h-screen fixed left-0 top-0 z-40 flex flex-col">
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BizBase
          </span>
        </Link>
      </div>
      
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Menu
        </p>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Setup Action */}
      <div className="p-3 border-t border-border space-y-2">
        <Button 
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
          onClick={() => navigate('/business-setup')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Register Business
        </Button>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
