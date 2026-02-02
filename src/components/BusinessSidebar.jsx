import React from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  FolderKanban, 
  Users, 
  UserPlus, 
  DollarSign, 
  BarChart3, 
  Settings,
  ArrowLeft,
  Building2,
  Sparkles,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { Link } from 'react-router-dom';

const BusinessSidebar = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentBusiness, exitBusinessMode } = useBusinessContext();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: `/business/${slug}/dashboard` },
    { icon: Briefcase, label: 'Services', path: `/business/${slug}/services` },
    { icon: FolderKanban, label: 'Projects', path: `/business/${slug}/projects` },
    { icon: Users, label: 'Team', path: `/business/${slug}/team` },
    { icon: UserPlus, label: 'CRM / Leads', path: `/business/${slug}/crm` },
    { icon: DollarSign, label: 'Finance', path: `/business/${slug}/finance` },
  ];

  const handleBackToPersonal = () => {
    exitBusinessMode();
    navigate('/dashboard');
  };

  return (
    <div className="w-64 bg-card border-r border-border h-screen fixed left-0 top-0 z-40 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BizBase
          </span>
        </Link>
      </div>

      {/* Business Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage src={currentBusiness?.logo_url} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {currentBusiness?.name?.charAt(0) || 'B'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate text-sm">
              {currentBusiness?.name || 'Business'}
            </p>
            {currentBusiness?.username && (
              <p className="text-xs text-primary">@{currentBusiness.username}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Business Management
        </p>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}

        <div className="pt-4">
          <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Settings
          </p>
          <NavLink
            to={`/business/${businessId}/settings`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm">Settings</span>
          </NavLink>
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-border space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={handleBackToPersonal}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Personal
        </Button>
        <div className="text-xs text-center text-muted-foreground py-1">
          <span className="inline-flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            Business Mode
          </span>
        </div>
      </div>
    </div>
  );
};

export default BusinessSidebar;
