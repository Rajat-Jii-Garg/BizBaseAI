
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Calendar,
  X,
  ChevronDown,
  Edit,
  Shield,
  CreditCard,
  HelpCircle,
  Building2,
  TrendingUp,
  Briefcase,
  Target,
  Star,
  Zap,
  Brain,
  Sparkles
} from 'lucide-react';
import NotificationButton from './NotificationButton';
import MessagesButton from './MessagesButton';
import SearchBar from './SearchBar';

const DashboardLayout = ({ children }) => {
  const { user, profile, signOut } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const handleRegisterBusiness = () => {
    navigate('/business-setup');
  };

  const menuItems = [
    { icon: Home, label: 'Home', path: '/dashboard', isActive: true },
    { icon: Users, label: 'My Network', path: '/connections' },
    { icon: Users, label: 'Communities', path: '/communities' },
  { icon: Briefcase, label: 'Jobs', path: '/jobs' },
    { icon: Calendar, label: 'Events', path: '/events' },
    { icon: TrendingUp, label: 'Insights', path: '/insights' },
    { icon: Brain, label: 'AI Assistant', path: '/ai-assistant' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden" style={{ overflowX: 'clip' }}>
      {/* Enhanced Header */}
      <nav className="bg-white shadow-lg border-b-2 border-blue-100 fixed top-0 left-0 right-0 z-50">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 ml-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Network className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 text-white" />
                </div>
                <div className="hidden md:block">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    BizBase
                  </span>
                  <div className="text-xs text-gray-500 -mt-1 flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    AI Professional Network
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-6">
              <SearchBar />
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 mr-1 sm:mr-2">
              {/* Search - Mobile */}
              <div className="lg:hidden flex-[1.4] min-w-0 mx-2">
                <SearchBar />
              </div>

              {/* Action Buttons - Desktop only */}
              <div className="hidden lg:flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                  onClick={handleRegisterBusiness}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Register Business
                </Button>
              </div>

              {/* Icons Container - Compact on mobile */}
              <div className="flex items-center space-x-0.5 sm:space-x-1 md:space-x-2">
                {/* Notifications */}
                <NotificationButton />

                {/* Messages */}
                <MessagesButton />

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-1 sm:space-x-2 hover:bg-gray-50 px-1 sm:px-2 md:px-3 py-1.5 sm:py-2 rounded-xl border-2 border-transparent hover:border-gray-200">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 ring-2 ring-blue-200 shadow-lg">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-bold text-xs sm:text-sm">
                          {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-semibold text-gray-900">
                        {profile?.full_name || 'Professional User'}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI Enhanced
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 hidden lg:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white shadow-2xl border-2 border-gray-100 rounded-xl z-50">
                  <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-bold">
                          {profile?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold leading-none text-gray-900">
                          {profile?.full_name || 'Professional User'}
                        </p>
                        <p className="text-xs leading-none text-gray-500 mt-1 truncate">
                          {user?.email}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600">Online</span>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(`/${profile.username}`)} className="cursor-pointer p-3">
                    <User className="mr-3 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/ai-assistant')} className="cursor-pointer p-3">
                    <Brain className="mr-3 h-4 w-4" />
                    <span>AI Assistant</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/business')} className="cursor-pointer p-3">
                    <Building2 className="mr-3 h-4 w-4 text-indigo-600" />
                    <span>Go to Business Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard/settings')} className="cursor-pointer p-3">
                    <Settings className="mr-3 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer p-3">
                    <Shield className="mr-3 h-4 w-4" />
                    <span>Privacy & Security</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer p-3">
                    <HelpCircle className="mr-3 h-4 w-4" />
                    <span>Help & Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600 p-3">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Navigation Bar - All screens with horizontal scroll */}
      <div className="bg-white border-b border-gray-100 shadow-sm fixed top-[65.2px]  sm:top-16 left-0 right-0 z-40 px-2 sm:px-0">
        <div className="w-full max-w-7xl mx-auto px-0 sm:px-4 lg:px-8">
          <div className="flex items-center justify-start lg:justify-center h-11 sm:h-12 overflow-x-auto scroll-smooth scrollbar-hide [scrollbar-width:none]">
            <div className="flex items-center space-x-2 sm:space-x-1 px-2 sm:px-1  lg:px-1 min-w-max">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  className={`${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200/60'
                      : 'hover:bg-gray-50 hover:text-black text-gray-600'
                  } transition-all duration-200 whitespace-nowrap px-2 sm:px-3 lg:px-4 h-7 sm:h-8 rounded-lg font-medium text-[11px] sm:text-xs lg:text-sm flex-shrink-0 inline-flex items-center`}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 mr-1 sm:mr-1.5 lg:mr-2" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-[125px] sm:pt-[128px] lg:pt-[128px] w-full
overflow-x-hidden" style={{ overflowX: 'clip' }}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
