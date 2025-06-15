import React from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Home, Inbox, Calendar, Settings, User, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar = ({ isCollapsed }: SidebarProps) => {
  return (
    <aside
      className={cn(
        "bg-sidebar border-r border-sidebar-border w-64 flex-shrink-0 transition-all duration-300",
        isCollapsed ? "w-16 overflow-hidden" : "w-64"
      )}
    >
      <div className="h-full px-3 py-4 overflow-y-auto bg-sidebar">
        <ul className="space-y-2 font-medium">
          <li>
            <Link
              to="/dashboard"
              className="flex items-center p-2 text-sidebar-foreground rounded-lg hover:bg-sidebar-accent group"
            >
              <LayoutDashboard className="w-5 h-5 mr-2" />
              {!isCollapsed && <span>Dashboard</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/projects"
              className="flex items-center p-2 text-sidebar-foreground rounded-lg hover:bg-sidebar-accent group"
            >
              <Inbox className="w-5 h-5 mr-2" />
              {!isCollapsed && <span>Projects</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/crm"
              className="flex items-center p-2 text-sidebar-foreground rounded-lg hover:bg-sidebar-accent group"
            >
              <Calendar className="w-5 h-5 mr-2" />
              {!isCollapsed && <span>CRM</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/hr"
              className="flex items-center p-2 text-sidebar-foreground rounded-lg hover:bg-sidebar-accent group"
            >
              <User className="w-5 h-5 mr-2" />
              {!isCollapsed && <span>HR</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/finance"
              className="flex items-center p-2 text-sidebar-foreground rounded-lg hover:bg-sidebar-accent group"
            >
              <Settings className="w-5 h-5 mr-2" />
              {!isCollapsed && <span>Finance</span>}
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;

interface SidebarMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarMenu = React.forwardRef<HTMLDivElement, SidebarMenuProps>(
  ({ className, ...props }, ref) => (
    <div className={cn("relative", className)} {...props} ref={ref} />
  )
);
SidebarMenu.displayName = "SidebarMenu";

interface SidebarMenuListProps extends React.HTMLAttributes<HTMLUListElement> {}

const SidebarMenuList = React.forwardRef<HTMLUListElement, SidebarMenuListProps>(
  ({ className, ...props }, ref) => (
    <ul className={cn("m-0 list-none p-0", className)} {...props} ref={ref} />
  )
);
SidebarMenuList.displayName = "SidebarMenuList";

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLLIElement> {}

const SidebarMenuItem = React.forwardRef<HTMLLIElement, SidebarMenuItemProps>(
  ({ className, ...props }, ref) => (
    <li className={cn("relative", className)} {...props} ref={ref} />
  )
);
SidebarMenuItem.displayName = "SidebarMenuItem";

interface SidebarMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const SidebarMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuTriggerProps
>(({ className, children, ...props }, ref) => (
  <NavigationMenuTrigger
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
    ref={ref}
  >
    {children}
  </NavigationMenuTrigger>
));
SidebarMenuTrigger.displayName = NavigationMenuTrigger.displayName;

interface SidebarMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarMenuContent = React.forwardRef<
  HTMLDivElement,
  SidebarMenuContentProps
>(({ className, ...props }, ref) => (
  <NavigationMenuContent
    className={cn(
      "left-0 top-0 w-full sm:w-[360px]",
      "p-4 md:p-6",
      "outline-none focus:outline-none",
      className
    )}
    {...props}
    ref={ref}
  />
));
SidebarMenuContent.displayName = NavigationMenuContent.displayName;

interface SidebarMenuLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

const SidebarMenuLink = React.forwardRef<HTMLAnchorElement, SidebarMenuLinkProps>(
  ({ className, ...props }, ref) => (
    <NavigationMenuLink className={cn("block select-none space-y-1.5 p-3 leading-none rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent data-[active]:text-accent-foreground", className)} {...props} ref={ref} />
  )
)
SidebarMenuLink.displayName = NavigationMenuLink.displayName

interface SidebarMenuButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

const SidebarMenuButton = React.forwardRef<HTMLAnchorElement, SidebarMenuButtonProps>(
  ({ className, ...props }, ref) => (
    <NavigationMenuLink className={cn("group flex items-center gap-3 rounded-md border-2 border-transparent px-4 py-2 text-sm font-medium hover:border-primary hover:bg-secondary/5 hover:text-primary [&:has([data-active])]:border-primary [&:has([data-active])]:bg-secondary/5 [&:has([data-active])]:text-primary", className)} {...props} ref={ref} />
  )
)
SidebarMenuButton.displayName = NavigationMenuLink.displayName

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Projects",
    url: "/dashboard/projects",
    icon: Inbox,
  },
  {
    title: "CRM",
    url: "/dashboard/crm",
    icon: Calendar,
  },
  {
    title: "HR",
    url: "/dashboard/hr",
    icon: User,
  },
  {
    title: "Finance",
    url: "/dashboard/finance",
    icon: Settings,
  },
];

export { SidebarMenu, SidebarMenuList, SidebarMenuItem, SidebarMenuContent, SidebarMenuTrigger, SidebarMenuLink, SidebarMenuButton };
