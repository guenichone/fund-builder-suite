import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  userName?: string;
  role: "admin" | "user";
}

const DashboardLayout = ({ children, userName, role }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
    navigate("/auth");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar role={role} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className="border-b border-border bg-card sticky top-0 z-10">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-foreground">
                  <Menu className="h-5 w-5" />
                </SidebarTrigger>
                <h1 className="text-xl font-bold text-foreground hidden sm:block">Dashboard</h1>
              </div>
              <div className="flex items-center gap-4">
                {userName && (
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-foreground">{userName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{role}</p>
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
