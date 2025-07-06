
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import UserProfileDropdown from "./UserProfileDropdown";
import { Link, useLocation } from "react-router-dom";
import NotificationsCenter from "./NotificationsCenter";
import ThemeSwitcher from "./ThemeSwitcher";
import GlobalSearchModal from "./GlobalSearchModal";

const breadcrumbsMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/crm": "CRM",
  "/dashboard/projects": "Projects",
  "/dashboard/hr": "HR",
  "/dashboard/finance": "Finance",
  "/dashboard/ai-assistant": "AI Assistant",
  "/dashboard/settings": "Settings",
  "/faq": "FAQ & Support",
};

const DashboardHeader = () => {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  // Global search modal
  const [searchOpen, setSearchOpen] = React.useState(false);
  React.useEffect(() => {
    const handleCombo = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleCombo);
    return () => window.removeEventListener("keydown", handleCombo);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="relative hidden md:block">
            <button
              className="absolute left-3 top-2 h-8 rounded hover:bg-gray-100 px-1 transition"
              title="Search (Ctrl+K)"
              onClick={() => setSearchOpen(true)}
              type="button"
            >
              <Search className="h-4 w-4 text-gray-400" />
            </button>
            <Input
              placeholder="Search anything... (Ctrl+K)"
              className="pl-10 w-64 bg-gray-50 border-gray-200"
              onFocus={() => setSearchOpen(true)}
              readOnly
            />
          </div>
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="ml-4">
            <ol className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
              <li>
                <Link to="/dashboard" className="hover:underline font-bold text-blue-500">Home</Link>
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
        <div className="flex items-center space-x-2">
          <ThemeSwitcher />
          <NotificationsCenter />
          <UserProfileDropdown />
        </div>
      </div>
      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};

export default DashboardHeader;
