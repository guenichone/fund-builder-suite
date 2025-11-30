import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FundsList from "@/components/funds/FundsList";
import CreateFundForm from "@/components/funds/CreateFundForm";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const AdminPage = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    getUser();
  }, []);

  if (!userId) return null;

  return (
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
            <CreateFundForm onSuccess={() => setIsCreateOpen(false)} userId={userId} />
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
  );
};

export default AdminPage;
