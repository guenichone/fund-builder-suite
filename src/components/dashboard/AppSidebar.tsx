import { Briefcase, PieChart, TrendingUp, Bug, AlertCircle } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useToast } from "@/hooks/use-toast";
import { executeDebugAction } from "@/lib/debug-actions";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  role: "admin" | "user";
}

export function AppSidebar({ role }: AppSidebarProps) {
  const { open } = useSidebar();
  const { toast } = useToast();

  const adminItems = [
    { title: "Manage Funds", url: "/dashboard", icon: Briefcase },
  ];

  const userItems = [
    { title: "My Portfolio", url: "/portfolio", icon: PieChart },
    { title: "Available Funds", url: "/funds", icon: TrendingUp },
  ];

  const items = role === "admin" ? adminItems : userItems;

  const notifyDebugDisabled = (label: string) =>
    toast({
      title: "Debug action disabled",
      description: `${label} is only available while running the app locally.`,
      variant: "destructive",
    });

  const handleDebugError = () =>
    executeDebugAction(
      () => {
        throw new Error("🐛 Debug Error: This is a simulated console error for testing purposes");
      },
      { onDisabled: () => notifyDebugDisabled("Console Error") },
    );

  const handleSimulateHttpError = () =>
    executeDebugAction(() => {
      const error = new Error("HTTP 500: Internal Server Error") as Error & {
        status: number;
        statusText: string;
      };
      error.name = "HTTPError";
      error.status = 500;
      error.statusText = "Internal Server Error";
      throw error;
    }, { onDisabled: () => notifyDebugDisabled("HTTP Error") });

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-sidebar">
        <div className="flex items-center gap-3 px-4 py-6 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          {open && (
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">FundManager</h2>
              <p className="text-xs text-sidebar-foreground/70">
                {role === "admin" ? "Admin Portal" : "Investor Portal"}
              </p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {open ? "Navigation" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-sidebar-accent">
                    <NavLink
                      to={item.url}
                      end
                      activeClassName="bg-sidebar-accent text-sidebar-primary"
                    >
                      <item.icon className="h-5 w-5" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {open ? "Debug" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleDebugError} className="hover:bg-sidebar-accent">
                  <Bug className="h-5 w-5" />
                  {open && <span>Console Error</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSimulateHttpError} className="hover:bg-sidebar-accent">
                  <AlertCircle className="h-5 w-5" />
                  {open && <span>HTTP Error</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
