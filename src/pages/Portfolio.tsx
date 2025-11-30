import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Portfolio from "@/components/portfolio/Portfolio";
import { Loader2 } from "lucide-react";

const PortfolioPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          navigate("/auth");
          return;
        }

        setUser(session.user);
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        setUser(null);
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    initAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0];

  return (
    <DashboardLayout userName={userName} role="user" userId={user!.id}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">My Portfolio</h2>
          <p className="text-muted-foreground mt-1">Track your investments and performance</p>
        </div>
        <Portfolio userId={user!.id} />
      </div>
    </DashboardLayout>
  );
};

export default PortfolioPage;
