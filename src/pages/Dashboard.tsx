import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import UserDashboard from "@/components/dashboard/UserDashboard";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refreshRole = async (userId: string) => {
      try {
        // Check if user has any role
        const { data: existingRoles, error: roleCheckError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);

        // If no role exists, create default user role
        if (!roleCheckError && (!existingRoles || existingRoles.length === 0)) {
          await supabase
            .from("user_roles")
            .insert({ user_id: userId, role: "user" });
        }

        // Check if user is admin
        const { data: adminRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();

        setIsAdmin(!!adminRole);
      } catch (error) {
        console.error("Error checking roles:", error);
      }
    };

    const initAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          navigate("/auth");
          return;
        }

        setUser(session.user);
        await refreshRole(session.user.id);
      } catch (error) {
        console.error("Error initializing dashboard auth:", error);
      } finally {
        setLoading(false);
      }
    };

    // Listen for auth changes with a synchronous callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        setUser(null);
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Defer role checks outside of the auth callback to avoid deadlocks
      setTimeout(() => {
        refreshRole(session.user!.id);
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

  return isAdmin ? <AdminDashboard user={user!} /> : <UserDashboard user={user!} />;
};

export default Dashboard;
