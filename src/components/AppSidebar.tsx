
import React from 'react';
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
  Briefcase
} from 'lucide-react';

interface AppSidebarProps {
  isCollapsed?: boolean;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'CRM', href: '/crm', icon: Users },
  { name: 'Projects', href: '/projects', icon: Briefcase },
  { name: 'Finance', href: '/finance', icon: DollarSign },
  { name: 'HR Management', href: '/hr', icon: Building2 },
  { name: 'AI Assistant', href: '/ai-assistant', icon: Brain },
  { name: 'Analytics', href: '#', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/faq', icon: HelpCircle },
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
                    <a href={item.href} className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </a>
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
