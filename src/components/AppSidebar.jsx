
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { 
  Home, 
  Users, 
  Building2, 
  DollarSign, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Brain,
  Briefcase,
  MessageCircle,
  Bell,
  Search,
  Rss,
  UserCheck
} from 'lucide-react';

interface AppSidebarProps {
  isCollapsed?: boolean;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Feed', href: '/feed', icon: Rss },
  { name: 'Network', href: '/network', icon: Users },
  { name: 'Connections', href: '/connections', icon: UserCheck },
  { name: 'Messages', href: '/messages', icon: MessageCircle },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Insights', href: '/insights', icon: Brain },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const AppSidebar: React.FC<AppSidebarProps> = ({ isCollapsed = false }) => {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
          <span className="font-bold text-lg">BizBase</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.href} 
                      className={({ isActive }) => 
                        `flex items-center space-x-3 ${isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50'}`
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <div className="text-xs text-gray-500">
          © 2024 BizBase
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
