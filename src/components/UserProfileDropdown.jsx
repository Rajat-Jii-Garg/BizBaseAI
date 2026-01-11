import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, User, ArrowRightLeft, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const UserProfileDropdown = () => {
  const [open, setOpen] = React.useState(false);
  const [businesses, setBusinesses] = React.useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = React.useState(true);
  const ref = React.useRef(null);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch user's businesses
  const fetchBusinesses = React.useCallback(async () => {
    if (!user) {
      setLoadingBusinesses(false);
      return;
    }

    try {
      setLoadingBusinesses(true);
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, logo_url')
        .eq('owner_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoadingBusinesses(false);
    }
  }, [user]);

  React.useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  // Subscribe to business changes
  React.useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('businesses-dropdown')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'businesses',
          filter: `owner_id=eq.${user.id}`
        },
        () => {
          fetchBusinesses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchBusinesses]);

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  const handleSwitchBusiness = () => {
    if (businesses.length === 1) {
      // Direct redirect to the only business
      navigate(`/business/${businesses[0].id}/dashboard`);
    } else {
      // Go to business selector page
      navigate('/my-businesses');
    }
    setOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const displayPosition = profile?.current_position || 'AI Enhanced';
  const displayEmail = user?.email || '';
  const hasBusinesses = businesses.length > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-2 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="text-right mr-2 hidden md:block">
          <p className="text-sm font-medium text-foreground">{displayName}</p>
          <p className="text-xs text-muted-foreground">{displayPosition}</p>
        </div>
        <Avatar>
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-card border border-border z-50 animate-fade-in">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
            {profile?.username && (
              <p className="text-xs text-primary truncate">@{profile.username}</p>
            )}
          </div>
          
          <div className="py-1">
            <button 
              className="flex w-full px-4 py-2 gap-3 hover:bg-accent items-center text-sm text-foreground" 
              onClick={() => { navigate('/profile-dashboard'); setOpen(false); }}
            >
              <User className="w-4 h-4" /> My Profile
            </button>
            
            {/* Switch Business Mode - Only show if user has businesses */}
            {!loadingBusinesses && hasBusinesses && (
              <button 
                className="flex w-full px-4 py-2 gap-3 hover:bg-accent items-center text-sm text-foreground" 
                onClick={handleSwitchBusiness}
              >
                <ArrowRightLeft className="w-4 h-4" /> 
                Switch to Business
                {businesses.length > 1 && (
                  <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {businesses.length}
                  </span>
                )}
              </button>
            )}
            
            <button 
              className="flex w-full px-4 py-2 gap-3 hover:bg-accent items-center text-sm text-foreground" 
              onClick={() => { navigate('/settings'); setOpen(false); }}
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
          </div>
          
          <div className="border-t border-border">
            <button 
              className="flex w-full px-4 py-2 gap-3 text-destructive hover:bg-destructive/10 items-center text-sm" 
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
