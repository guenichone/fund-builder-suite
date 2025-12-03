import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { ArrowDownCircle, Loader2, Wallet } from "lucide-react";

interface SellSharesDialogProps {
  investmentId: string;
  fundName: string;
  sharesOwned: number;
  redemptionPrice: number;
  userId: string;
  onSuccess: () => void;
}

const SellSharesDialog = ({ investmentId, fundName, sharesOwned, redemptionPrice, userId, onSuccess }: SellSharesDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sharesToSell, setSharesToSell] = useState(sharesOwned);

  const handleSell = async () => {
    if (sharesToSell <= 0 || sharesToSell > sharesOwned) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid number of shares to sell.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const saleAmount = sharesToSell * redemptionPrice;

    try {
      const { data: investment, error: fetchError } = await supabase
        .from("investments")
        .select("shares_quantity")
        .eq("id", investmentId)
        .single();

      if (fetchError) throw fetchError;

      const remainingShares = Number(investment.shares_quantity) - sharesToSell;

      if (remainingShares < 0) {
        throw new Error("Cannot sell more shares than you own");
      }

      // Update or delete investment
      if (remainingShares === 0) {
        const { error: deleteError } = await supabase
          .from("investments")
          .delete()
          .eq("id", investmentId);

        if (deleteError) throw deleteError;
      } else {
        const { error: updateError } = await supabase
          .from("investments")
          .update({ shares_quantity: remainingShares })
          .eq("id", investmentId);

        if (updateError) throw updateError;
      }

      // Credit wallet
      const { data: wallet, error: walletFetchError } = await supabase
        .from("user_wallets")
        .select("balance")
        .eq("user_id", userId)
        .maybeSingle();

      if (walletFetchError) throw walletFetchError;

      const currentBalance = wallet ? Number(wallet.balance) : 0;
      const newBalance = currentBalance + saleAmount;

      if (wallet) {
        const { error: walletUpdateError } = await supabase
          .from("user_wallets")
          .update({ balance: newBalance })
          .eq("user_id", userId);

        if (walletUpdateError) throw walletUpdateError;
      } else {
        // Create wallet if it doesn't exist
        const { error: walletCreateError } = await supabase
          .from("user_wallets")
          .insert({ user_id: userId, balance: saleAmount });

        if (walletCreateError) throw walletCreateError;
      }

      // Record transaction
      await supabase.from("wallet_transactions").insert({
        user_id: userId,
        type: "sale",
        amount: saleAmount,
        description: `Sale: ${fundName}`,
        reference_id: investmentId,
      });

      toast({
        title: "Success!",
        description: `Sold ${sharesToSell.toFixed(4)} shares for $${saleAmount.toFixed(2)}. Funds added to wallet.`,
      });

      setOpen(false);
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalValue = sharesToSell * redemptionPrice;
  const percentage = (sharesToSell / sharesOwned) * 100;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <ArrowDownCircle className="w-4 h-4" />
          Sell
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sell Shares - {fundName}</DialogTitle>
          <DialogDescription>Choose how many shares you want to sell</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Shares to Sell</Label>
              <span className="text-sm text-muted-foreground">
                {sharesToSell.toFixed(4)} / {sharesOwned.toFixed(4)} ({percentage.toFixed(1)}%)
              </span>
            </div>
            <Slider
              value={[sharesToSell]}
              onValueChange={(values) => setSharesToSell(values[0])}
              min={0}
              max={sharesOwned}
              step={0.0001}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shares-input">Exact Amount</Label>
            <Input
              id="shares-input"
              type="number"
              step="0.0001"
              min="0"
              max={sharesOwned}
              value={sharesToSell}
              onChange={(e) => setSharesToSell(Math.min(parseFloat(e.target.value) || 0, sharesOwned))}
            />
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Redemption Price</span>
              <span className="font-medium">${redemptionPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shares to Sell</span>
              <span className="font-medium">{sharesToSell.toFixed(4)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-semibold">Total Value</span>
              <span className="text-xl font-bold text-primary">${totalValue.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
              <Wallet className="w-4 h-4" />
              <span>Funds will be credited to your wallet</span>
            </div>
          </div>

          <Button onClick={handleSell} disabled={loading || sharesToSell <= 0} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Sell ${sharesToSell.toFixed(4)} Shares`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SellSharesDialog;
