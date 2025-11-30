import { User } from "@supabase/supabase-js";
import DashboardLayout from "./DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FundsList from "@/components/funds/FundsList";
import Portfolio from "@/components/portfolio/Portfolio";

interface UserDashboardProps {
  user: User;
}

const UserDashboard = ({ user }: UserDashboardProps) => {
  const userName = user.user_metadata?.full_name || user.email?.split("@")[0];

  return (
    <DashboardLayout userName={userName} role="user">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Investment Dashboard</h2>
          <p className="text-muted-foreground mt-1">Manage your portfolio and discover funds</p>
        </div>

        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList>
            <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
            <TabsTrigger value="funds">Available Funds</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="mt-6">
            <Portfolio userId={user.id} />
          </TabsContent>

          <TabsContent value="funds" className="mt-6">
            <FundsList filter="active" isAdmin={false} userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
