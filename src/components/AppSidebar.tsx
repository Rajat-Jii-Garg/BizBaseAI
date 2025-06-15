import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Home",
    url: "/",
    icon: "Home"
  },
  {
    title: "Inbox",
    url: "#",
    icon: "Inbox"
  },
  {
    title: "Calendar",
    url: "#",
    icon: "Calendar"
  },
  {
    title: "Search",
    url: "#",
    icon: "Search"
  },
  {
    title: "Settings",
    url: "#",
    icon: "Settings"
  }
];

// Helper: Get icon by string name
import * as LucideIcons from "lucide-react";

export default function AppSidebar(props: { isCollapsed?: boolean }) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = LucideIcons[item.icon as keyof typeof LucideIcons];
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
