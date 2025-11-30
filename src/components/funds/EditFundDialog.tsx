import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Fund {
  id: string;
  name: string;
  is_active: boolean;
}

interface EditFundDialogProps {
  fund: Fund;
  onUpdate: () => void;
}

const EditFundDialog = ({ fund, onUpdate }: EditFundDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isActive, setIsActive] = useState(fund.is_active);
  const [loading, setLoading] = useState(false);

  const handleToggleActive = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("funds")
        .update({ is_active: !isActive })
        .eq("id", fund.id);

      if (error) throw error;

      setIsActive(!isActive);
      toast({
        title: "Success",
        description: `Fund ${!isActive ? "activated" : "deactivated"} successfully.`,
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("funds").delete().eq("id", fund.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fund deleted successfully.",
      });
      setOpen(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <Settings className="w-4 h-4" />
          Manage
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage {fund.name}</DialogTitle>
          <DialogDescription>Update fund settings or remove it from the system.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Fund Status</Label>
              <p className="text-sm text-muted-foreground">
                {isActive ? "Fund is active and accepting investments" : "Fund is inactive"}
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={handleToggleActive} disabled={loading} />
          </div>

          <div className="pt-4 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full gap-2" disabled={loading}>
                  <Trash2 className="w-4 h-4" />
                  Delete Fund
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the fund and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditFundDialog;
