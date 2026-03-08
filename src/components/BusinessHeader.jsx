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
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
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
    <header className="bg-card border-b border-border px-3 md:px-5 py-2 sticky top-0 z-30 w-full">
      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="h-8 w-8">
              <Menu className="w-4 h-4" />
            </Button>
          )}
          <Link to="/" className="flex items-center gap-1.5">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
              BizBase
            </span>
          </Link>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-md border border-primary/20">
            <Building2 className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-medium text-primary hidden sm:inline">Business Mode</span>
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden md:block flex-1 max-w-md mx-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input placeholder="Search... (Ctrl+K)" className="pl-8 h-8 text-xs bg-background border-border" onFocus={() => setSearchOpen(true)} readOnly />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          {isMobile && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchOpen(true)}>
              <Search className="w-4 h-4" />
            </Button>
          )}
          <ThemeSwitcher />
          <Button variant="ghost" size="icon" className="relative h-8 w-8">
            <Bell className="w-4 h-4" />
          </Button>

          {/* Business Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs max-w-[160px]">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={currentBusiness?.logo_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-[9px]">{getInitials(currentBusiness?.name)}</AvatarFallback>
                </Avatar>
                <span className="truncate hidden sm:block">{currentBusiness?.name || 'Business'}</span>
                <ChevronDown className="w-3 h-3 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2 border-b">
                <p className="text-[10px] text-muted-foreground">Current Business</p>
                <p className="font-semibold text-xs truncate">{currentBusiness?.name}</p>
                {currentBusiness?.username && <p className="text-[10px] text-primary">@{currentBusiness.username}</p>}
              </div>
              {businesses.length > 1 && (
                <>
                  <div className="py-1">
                    <p className="px-3 py-1 text-[10px] text-muted-foreground">Switch Business</p>
                    {businesses.filter(b => b.id !== currentBusiness?.id).map((business) => (
                      <DropdownMenuItem key={business.id} onClick={() => handleSwitchBusiness(business)} className="cursor-pointer text-xs">
                        <Avatar className="w-5 h-5 mr-2">
                          <AvatarImage src={business.logo_url} />
                          <AvatarFallback className="bg-primary/10 text-primary text-[9px]">{getInitials(business.name)}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{business.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleSwitchToPersonal} className="text-xs"><Home className="w-3.5 h-3.5 mr-2" />Switch to Personal</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/my-businesses')} className="text-xs"><Building2 className="w-3.5 h-3.5 mr-2" />Manage All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/business-setup')} className="text-xs"><Building2 className="w-3.5 h-3.5 mr-2" />Register New</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[10px]">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2 border-b">
                <p className="font-medium text-xs">{profile?.full_name || 'User'}</p>
                <p className="text-[10px] text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuItem onClick={() => navigate('/profile-dashboard')} className="text-xs"><User className="w-3.5 h-3.5 mr-2" />My Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="text-xs"><Settings className="w-3.5 h-3.5 mr-2" />Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive text-xs"><LogOut className="w-3.5 h-3.5 mr-2" />Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};

export default BusinessHeader;
