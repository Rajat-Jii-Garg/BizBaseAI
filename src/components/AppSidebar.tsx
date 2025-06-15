
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

// Helper: Get icon by string name
import * as LucideIcons from "lucide-react";

const items = [
  {
    title: "Home",
    url: "/",
    icon: "Home",
  },
  {
    title: "Inbox",
    url: "#",
    icon: "Inbox",
  },
  {
    title: "Calendar",
    url: "#",
    icon: "Calendar",
  },
  {
    title: "Search",
    url: "#",
    icon: "Search",
  },
  {
    title: "Settings",
    url: "#",
    icon: "Settings",
  },
];

export default function AppSidebar(props: { isCollapsed?: boolean }) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                // Defensive: only render if Lucide icon is a React component
                const Icon = LucideIcons[item.icon as keyof typeof LucideIcons];
                const isIconValid =
                  typeof Icon === "function" || typeof Icon === "object";
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url}
                        className="flex items-center gap-3 px-2 py-2 rounded-lg font-semibold transition bg-gradient-to-l from-white/0 via-white/20 to-white/0 hover:from-[#d2faff]/50 hover:to-[#aeeeee]/50 hover:bg-opacity-60 hover:shadow-xl group"
                      >
                        {isIconValid ? (
                          <Icon className="w-5 h-5 text-[#47bada] group-hover:text-[#1cbc99] transition" />
                        ) : null}
                        <span className="tracking-wide">{item.title}</span>
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
