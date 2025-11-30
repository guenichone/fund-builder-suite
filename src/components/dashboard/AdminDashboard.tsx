import { useState } from "react";
import { User } from "@supabase/supabase-js";
import DashboardLayout from "./DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FundsList from "@/components/funds/FundsList";
import CreateFundForm from "@/components/funds/CreateFundForm";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AdminDashboardProps {
  user: User;
}

const AdminDashboard = ({ user }: AdminDashboardProps) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const userName = user.user_metadata?.full_name || user.email?.split("@")[0];

  return (
    <DashboardLayout userName={userName} role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Fund Management</h2>
            <p className="text-muted-foreground mt-1">Create and manage investment funds</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Fund
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Fund</DialogTitle>
              </DialogHeader>
              <CreateFundForm onSuccess={() => setIsCreateOpen(false)} userId={user.id} />
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Funds</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <FundsList filter="all" isAdmin={true} />
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <FundsList filter="active" isAdmin={true} />
          </TabsContent>

          <TabsContent value="inactive" className="mt-6">
            <FundsList filter="inactive" isAdmin={true} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
