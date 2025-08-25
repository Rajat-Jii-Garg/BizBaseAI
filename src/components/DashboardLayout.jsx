
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

const DashboardLayout = ({ children }) => {
const DashboardLayout = ({ children }) => {
  const { user, signOut } = useAuth();
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
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Calendar, label: 'Events', path: '/events' },
    { icon: TrendingUp, label: 'Insights', path: '/insights' },
    { icon: Brain, label: 'AI Assistant', path: '/ai-assistant' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <nav className="bg-white shadow-lg border-b-2 border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Network className="w-7 h-7 text-white" />
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
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search professionals, companies, jobs, insights..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-12 pr-20 py-3 border-2 border-gray-200 rounded-2xl bg-gray-50/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base hover:border-blue-300"
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  className="absolute right-2 top-1.5 bottom-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl px-6 shadow-md"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Action Buttons */}
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

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-gray-100 rounded-xl"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                </span>
              </Button>

              {/* Messages */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-gray-100 rounded-xl"
              >
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full text-xs flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                </span>
              </Button>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 hover:bg-gray-50 px-3 py-2 rounded-xl border-2 border-transparent hover:border-gray-200">
                    <Avatar className="h-10 w-10 ring-2 ring-blue-200 shadow-lg">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-bold">
                        {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.user_metadata?.full_name || 'Professional User'}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI Enhanced
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white shadow-2xl border-2 border-gray-100 rounded-xl">
                  <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-bold">
                          {user?.user_metadata?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold leading-none text-gray-900">
                          {user?.user_metadata?.full_name || 'Professional User'}
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
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer p-3">
                    <User className="mr-3 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer p-3">
                    <Edit className="mr-3 h-4 w-4" />
                    <span>Edit Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer p-3">
                    <Briefcase className="mr-3 h-4 w-4" />
                    <span>Professional Tools</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer p-3">
                    <Target className="mr-3 h-4 w-4" />
                    <span>Goals & Analytics</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer p-3">
                    <Brain className="mr-3 h-4 w-4" />
                    <span>AI Assistant</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer p-3">
                    <Star className="mr-3 h-4 w-4" />
                    <span>Premium Features</span>
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
                    <CreditCard className="mr-3 h-4 w-4" />
                    <span>Billing & Plans</span>
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

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-xl"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white shadow-xl">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                />
              </form>

              {/* Mobile Navigation */}
              {menuItems.map((item, index) => (
                <Button
                  key={index}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className={`w-full justify-start py-3 px-4 rounded-xl ${
                    isActive(item.path) 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Button>
              ))}

              {/* Mobile Register Business */}
              <div className="pt-4 border-t border-gray-100">
                <Button 
                  onClick={handleRegisterBusiness}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl py-3"
                >
                  <Building2 className="w-5 h-5 mr-2" />
                  Register My Business
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Enhanced Sub Navigation */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-3 overflow-x-auto">
            <div className="flex items-center space-x-1">
              {menuItems.map((item, index) => (
                <Button
                  key={index}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className={`${
                    isActive(item.path) 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                      : 'hover:bg-gray-100 text-gray-600'
                  } transition-all duration-200 whitespace-nowrap px-4 py-2 rounded-xl font-medium`}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout};
