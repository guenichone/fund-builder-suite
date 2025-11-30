import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Loader2 } from "lucide-react";

interface InvestmentDialogProps {
  fundId: string;
  fundName: string;
  sharePrice: number;
  userId: string;
}

const InvestmentDialog = ({ fundId, fundName, sharePrice, userId }: InvestmentDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");

  const shares = amount ? (parseFloat(amount) / sharePrice).toFixed(4) : "0";

  const handleInvest = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid investment amount.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("investments").insert({
        user_id: userId,
        fund_id: fundId,
        shares_quantity: parseFloat(shares),
        purchase_price: sharePrice,
        total_amount: parseFloat(amount),
      });

      if (error) {
        console.error("Investment error:", error);
        throw error;
      }

      toast({
        title: "Investment successful!",
        description: `You've invested $${amount} in ${fundName}.`,
      });

      setOpen(false);
      setAmount("");
    } catch (error: any) {
      console.error("Investment failed:", error);
      toast({
        title: "Investment failed",
        description: error.message || "An error occurred while processing your investment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2">
          <TrendingUp className="w-4 h-4" />
          Invest
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invest in {fundName}</DialogTitle>
          <DialogDescription>Enter the amount you want to invest in this fund.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Investment Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000.00"
            />
          </div>

          <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Share Price:</span>
              <span className="font-medium">${sharePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shares to Purchase:</span>
              <span className="font-bold">{shares}</span>
            </div>
          </div>

          <Button onClick={handleInvest} className="w-full" disabled={loading || !amount}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Investment"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentDialog;
