import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, Bell, Settings, Building2, ChevronDown, User, LogOut, 
  Sparkles, Home, Menu
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessContext } from '@/contexts/BusinessContext';
import ThemeSwitcher from './ThemeSwitcher';
import GlobalSearchModal from './GlobalSearchModal';
import { useIsMobile } from '@/hooks/use-mobile';

const BusinessHeader = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { currentBusiness, businesses, exitBusinessMode, switchBusiness } = useBusinessContext();
  const [searchOpen, setSearchOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleCombo = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleCombo);
    return () => window.removeEventListener('keydown', handleCombo);
  }, []);

  const handleSignOut = async () => { await signOut(); navigate('/'); };
  const handleSwitchToPersonal = () => { exitBusinessMode(); navigate('/dashboard'); };
  const handleSwitchBusiness = async (business) => {
    await switchBusiness(business.username);
    navigate(`/business/${business.username}`);
  };
  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'B';

  return (
    <header className="bg-card border-b border-border px-4 md:px-6 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
              <Menu className="w-5 h-5" />
            </Button>
          )}
          
          {isMobile ? (
            <div className="flex items-center gap-2 px-2 py-1 bg-primary/10 rounded-lg border border-primary/20">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary truncate max-w-[100px]">
                {currentBusiness?.name || 'Business'}
              </span>
            </div>
          ) : (
            <>
              <Link to="/" className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden md:block">
                  BizBase
                </span>
              </Link>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Business Mode</span>
              </div>
            </>
          )}
        </div>

        {/* Center: Search (desktop) */}
        <div className="hidden md:block flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input placeholder="Search... (Ctrl+K)" className="pl-10 bg-background border-border" onFocus={() => setSearchOpen(true)} readOnly />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 md:gap-3">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
              <Search className="w-5 h-5" />
            </Button>
          )}
          
          <ThemeSwitcher />
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
          </Button>

          {/* Business Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size={isMobile ? "icon" : "default"} className={isMobile ? "" : "gap-2 max-w-[200px]"}>
                <Avatar className="w-6 h-6">
                  <AvatarImage src={currentBusiness?.logo_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(currentBusiness?.name)}</AvatarFallback>
                </Avatar>
                {!isMobile && <>
                  <span className="truncate hidden sm:block">{currentBusiness?.name || 'Business'}</span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                </>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-3 py-2 border-b">
                <p className="text-xs text-muted-foreground">Current Business</p>
                <p className="font-semibold truncate">{currentBusiness?.name}</p>
                {currentBusiness?.username && <p className="text-xs text-primary">@{currentBusiness.username}</p>}
              </div>
              {businesses.length > 1 && (
                <>
                  <div className="py-1">
                    <p className="px-3 py-1 text-xs text-muted-foreground">Switch Business</p>
                    {businesses.filter(b => b.id !== currentBusiness?.id).map((business) => (
                      <DropdownMenuItem key={business.id} onClick={() => handleSwitchBusiness(business)} className="cursor-pointer">
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarImage src={business.logo_url} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(business.name)}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{business.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleSwitchToPersonal}><Home className="w-4 h-4 mr-2" />Switch to Personal</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/my-businesses')}><Building2 className="w-4 h-4 mr-2" />Manage All Businesses</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/business-setup')}><Building2 className="w-4 h-4 mr-2" />Register New Business</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2 border-b">
                <p className="font-medium">{profile?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuItem onClick={() => navigate('/profile-dashboard')}><User className="w-4 h-4 mr-2" />My Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}><Settings className="w-4 h-4 mr-2" />Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive"><LogOut className="w-4 h-4 mr-2" />Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};

export default BusinessHeader;
