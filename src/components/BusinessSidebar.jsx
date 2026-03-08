import React from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Briefcase, FolderKanban, Users, UserPlus, 
  DollarSign, Settings, ArrowLeft, Building2, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useIsMobile } from '@/hooks/use-mobile';

const BusinessSidebar = ({ onClose }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentBusiness, exitBusinessMode } = useBusinessContext();
  const isMobile = useIsMobile();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: `/business/${slug}/dashboard` },
    { icon: Briefcase, label: 'Services', path: `/business/${slug}/services` },
    { icon: FolderKanban, label: 'Projects', path: `/business/${slug}/projects` },
    { icon: Users, label: 'Team', path: `/business/${slug}/team` },
    { icon: UserPlus, label: 'CRM / Leads', path: `/business/${slug}/crm` },
    { icon: DollarSign, label: 'Finance', path: `/business/${slug}/finance` },
  ];

  const handleBackToPersonal = () => { exitBusinessMode(); navigate('/dashboard'); };
  const handleNavClick = () => { if (isMobile && onClose) onClose(); };

  return (
    <div className="w-56 bg-card border-r border-border h-full flex flex-col">
      {/* Business Info */}
      <div className="p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 ring-2 ring-primary/20 flex-shrink-0">
            <AvatarImage src={currentBusiness?.logo_url} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
              {currentBusiness?.name?.charAt(0) || 'B'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate text-xs">
              {currentBusiness?.name || 'Business'}
            </p>
            {currentBusiness?.username && (
              <p className="text-[10px] text-primary">@{currentBusiness.username}</p>
            )}
          </div>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        <p className="px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
          Management
        </p>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}

        <div className="pt-3">
          <p className="px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Settings
          </p>
          <NavLink
            to={`/business/${slug}/settings`}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <Settings className="w-4 h-4" />
            <span className="text-xs">Settings</span>
          </NavLink>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border space-y-1.5">
        <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8" onClick={handleBackToPersonal}>
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Personal
        </Button>
        <div className="text-[10px] text-center text-muted-foreground py-0.5">
          <span className="inline-flex items-center gap-1">
            <Building2 className="w-2.5 h-2.5" />
            Business Mode
          </span>
        </div>
      </div>
    </div>
  );
};

export default BusinessSidebar;
