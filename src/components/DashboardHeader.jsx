import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Menu, Search } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import GlobalSearchModal from "./GlobalSearchModal";
import ThemeSwitcher from "./ThemeSwitcher";
import UserProfileDropdown from "./UserProfileDropdown";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const breadcrumbsMap = {
  "/dashboard": "Dashboard",
  "/dashboard/crm": "CRM",
  "/dashboard/projects": "Projects",
  "/dashboard/hr": "HR",
  "/dashboard/finance": "Finance",
  "/dashboard/ai-assistant": "AI Assistant",
  "/dashboard/settings": "Settings",
  "/dashboard/business-setup": "Business Setup",
  "/jobs": "Jobs",
  "/notifications": "Notifications",
  "/connections": "Connections",
  "/events": "Events",
  "/insights": "Insights",
  "/ai-assistant": "AI Assistant",
  "/business-setup": "Business Setup",
  "/settings": "Settings",
  "/faq": "FAQ & Support",
};

const DashboardHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const segments = location.pathname.split("/").filter(Boolean);
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [hasBusinesses, setHasBusinesses] = useState(false);
  const [loadingBusinessCheck, setLoadingBusinessCheck] = useState(true);

  // Check if user has any businesses
  const checkBusinesses = React.useCallback(async () => {
    if (!user) {
      setLoadingBusinessCheck(false);
      return;
    }

    try {
      const { count, error } = await supabase
        .from('businesses')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .eq('status', 'active');

      if (error) throw error;
      setHasBusinesses((count || 0) > 0);
    } catch (error) {
      console.error('Error checking businesses:', error);
    } finally {
      setLoadingBusinessCheck(false);
    }
  }, [user]);

  useEffect(() => {
    checkBusinesses();
  }, [checkBusinesses]);

  // Subscribe to business changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('businesses-header')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'businesses',
          filter: `owner_id=eq.${user.id}`
        },
        () => {
          checkBusinesses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, checkBusinesses]);

  useEffect(() => {
    const handleCombo = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleCombo);
    return () => window.removeEventListener("keydown", handleCombo);
  }, []);

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search people, communities, events, jobs... (Ctrl+K)"
              className={`pl-10 bg-background border-border focus:ring-2 focus:ring-primary/20 focus:border-primary ${hasBusinesses ? 'w-96' : 'w-80'}`}
              onFocus={() => setSearchOpen(true)}
              readOnly
            />
          </div>
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="ml-4">
            <ol className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <li>
                <Link to="/dashboard" className="hover:underline font-bold text-primary">Home</Link>
              </li>
              {segments.slice(1).map((seg, i) => {
                let path = "/dashboard" + (i > 0 ? "/" + segments.slice(1, i + 2).join("/") : seg ? "/" + seg : "");
                return (
                  <li key={seg} className="flex items-center">
                    <span className="mx-2">/</span>
                    <Link to={path} className="hover:underline">{breadcrumbsMap[path]}</Link>
                  </li>
                );
              })}
              {location.pathname.startsWith("/faq") && (
                <>
                  <span className="mx-2">/</span>
                  <Link to="/faq" className="hover:underline">{breadcrumbsMap["/faq"]}</Link>
                </>
              )}
            </ol>
          </nav>
        </div>
        <div className="flex items-center space-x-3">
          <ThemeSwitcher />
          <Button
            variant="default"
            size="default"
            onClick={() => navigate('/jobs')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 px-6 py-2.5 font-semibold rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
          >
            💼 Jobs
          </Button>
          {/* Only show Register button if user has no businesses */}
          {!loadingBusinessCheck && !hasBusinesses && (
            <Button
              variant="outline"
              size="default"
              onClick={() => navigate('/business-setup')}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-4 py-2.5 font-semibold rounded-lg transition-all duration-200"
            >
              🏢 Register Business
            </Button>
          )}
          <UserProfileDropdown />
        </div>
      </div>
      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};

export default DashboardHeader;
