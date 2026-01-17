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
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBusinessContext } from '@/contexts/BusinessContext';

const BusinessSidebar = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { currentBusiness, exitBusinessMode } = useBusinessContext();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: `/business/${businessId}/dashboard` },
    { icon: Briefcase, label: 'Services', path: `/business/${businessId}/services` },
    { icon: FolderKanban, label: 'Projects', path: `/business/${businessId}/projects` },
    { icon: Users, label: 'Team', path: `/business/${businessId}/team` },
    { icon: UserPlus, label: 'CRM / Leads', path: `/business/${businessId}/crm` },
    { icon: DollarSign, label: 'Finance', path: `/business/${businessId}/finance` },
    { icon: BarChart3, label: 'Analytics', path: `/business/${businessId}/analytics` },
    { icon: Settings, label: 'Settings', path: `/business/${businessId}/settings` },
  ];

  const handleBackToPersonal = () => {
    exitBusinessMode();
    navigate('/dashboard');
  };

  return (
    <div className="w-64 bg-card border-r border-border h-screen fixed left-0 top-0 z-40 flex flex-col">
      {/* Business Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentBusiness?.logo_url} />
            <AvatarFallback className="bg-primary/10 text-primary">
              <Building2 className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {currentBusiness?.name || 'Business'}
            </p>
            {currentBusiness?.username && (
              <p className="text-xs text-primary">@{currentBusiness.username}</p>
            )}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleBackToPersonal}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Personal
        </Button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="text-xs text-center text-muted-foreground">
          Business Mode
        </div>
      </div>
    </div>
  );
};

export default BusinessSidebar;
