import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">FundManager</h1>
                <p className="text-xs text-muted-foreground">
                  {role === "admin" ? "Fund Manager" : "Investor"} Portal
                </p>
              </div>
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
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
};

export default DashboardLayout;
