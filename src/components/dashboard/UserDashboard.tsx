import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import DashboardLayout from "./DashboardLayout";

interface UserDashboardProps {
  user: User;
}

const UserDashboard = ({ user }: UserDashboardProps) => {
  const navigate = useNavigate();
  const userName = user.user_metadata?.full_name || user.email?.split("@")[0];

  useEffect(() => {
    // Redirect to portfolio by default
    navigate("/portfolio");
  }, [navigate]);

  return (
    <DashboardLayout userName={userName} role="user" userId={user.id}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Investment Dashboard</h2>
          <p className="text-muted-foreground mt-1">Use the sidebar to navigate</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
