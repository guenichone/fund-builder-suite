import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface UserPreferencesProps {
  userId: string;
  currentRole: "admin" | "user";
  onRoleChange: (isAdmin: boolean) => void;
}

const UserPreferences = ({ userId, currentRole, onRoleChange }: UserPreferencesProps) => {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(currentRole === "admin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsAdmin(currentRole === "admin");
  }, [currentRole]);

  const handleRoleToggle = async (checked: boolean) => {
    setLoading(true);
    try {
      // Delete existing role
      await supabase.from("user_roles").delete().eq("user_id", userId);

      // Insert new role
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: checked ? "admin" : "user" });

      if (error) throw error;

      setIsAdmin(checked);
      onRoleChange(checked);

      toast({
        title: "Role updated",
        description: `You are now ${checked ? "a Fund Manager (Admin)" : "an Investor (User)"}`,
      });

      // Reload page to update dashboard
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Role</CardTitle>
        <CardDescription>Manage your account permissions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Warning:</strong> Self-assigning admin roles should not be enabled in production environments. This feature is for development/testing only.
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor="admin-mode">Fund Manager (Admin)</Label>
            <p className="text-sm text-muted-foreground">
              Enable admin access to create and manage funds
            </p>
          </div>
          <Switch
            id="admin-mode"
            checked={isAdmin}
            onCheckedChange={handleRoleToggle}
            disabled={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPreferences;
