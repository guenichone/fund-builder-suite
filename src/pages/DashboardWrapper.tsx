import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const DashboardWrapper = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"admin" | "user">("user");
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) {
      setRole(data.role as "admin" | "user");
    } else {
      setRole("user");
    }
  };

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
        await fetchUserRole(session.user.id);
        
        // Redirect based on role
        if (window.location.pathname === "/") {
          const { data } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .maybeSingle();
          
          if (data?.role === "admin") {
            navigate("/dashboard");
          } else {
            navigate("/portfolio");
          }
        }
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
      setTimeout(() => {
        fetchUserRole(session.user.id);
      }, 0);
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

  if (!user) {
    return null;
  }

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0];
  
  const getPageTitle = () => {
    const path = window.location.pathname;
    if (path.includes('/portfolio')) return 'My Portfolio';
    if (path.includes('/funds')) return 'Available Funds';
    if (path.includes('/dashboard')) return 'Fund Management';
    return 'Dashboard';
  };

  return (
    <DashboardLayout userName={userName} role={role} userId={user.id} pageTitle={getPageTitle()}>
      <Outlet />
    </DashboardLayout>
  );
};

export default DashboardWrapper;
