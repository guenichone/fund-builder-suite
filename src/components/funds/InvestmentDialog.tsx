import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Loader2, Wallet } from "lucide-react";

interface InvestmentDialogProps {
  fundId: string;
  fundName: string;
  sharePrice: number;
  userId: string;
  onInvestmentChange?: () => void;
}

const InvestmentDialog = ({ fundId, fundName, sharePrice, userId, onInvestmentChange }: InvestmentDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const shares = amount ? (parseFloat(amount) / sharePrice).toFixed(4) : "0";
  const investAmount = parseFloat(amount) || 0;
  const insufficientFunds = investAmount > walletBalance;

  useEffect(() => {
    if (open) {
      loadWalletBalance();
    }
  }, [open, userId]);

  const loadWalletBalance = async () => {
    setLoadingBalance(true);
    try {
      const { data, error } = await supabase
        .from("user_wallets")
        .select("balance")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      setWalletBalance(data ? Number(data.balance) : 0);
    } catch (error) {
      console.error("Failed to load balance:", error);
      setWalletBalance(0);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleInvest = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid investment amount.",
        variant: "destructive",
      });
      return;
    }

    if (insufficientFunds) {
      toast({
        title: "Insufficient funds",
        description: "Please deposit more cash to your wallet.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Deduct from wallet first
      const newBalance = walletBalance - investAmount;
      const { error: walletError } = await supabase
        .from("user_wallets")
        .update({ balance: newBalance })
        .eq("user_id", userId);

      if (walletError) throw walletError;

      // Create investment
      const { data: investment, error: investError } = await supabase
        .from("investments")
        .insert({
          user_id: userId,
          fund_id: fundId,
          shares_quantity: parseFloat(shares),
          purchase_price: sharePrice,
          total_amount: investAmount,
        })
        .select()
        .single();

      if (investError) {
        // Rollback wallet deduction
        await supabase
          .from("user_wallets")
          .update({ balance: walletBalance })
          .eq("user_id", userId);
        throw investError;
      }

      // Record transaction
      await supabase.from("wallet_transactions").insert({
        user_id: userId,
        type: "purchase",
        amount: -investAmount,
        description: `Purchase: ${fundName}`,
        reference_id: investment.id,
      });

      toast({
        title: "Investment successful!",
        description: `You've invested $${amount} in ${fundName}.`,
      });

      setOpen(false);
      setAmount("");
      onInvestmentChange?.();
    } catch (error) {
      toast({
        title: "Investment failed",
        description: error instanceof Error ? error.message : "An error occurred while processing your investment.",
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
          {/* Wallet Balance */}
          <div className="p-3 bg-primary/10 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Available Cash</span>
            </div>
            {loadingBalance ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span className="font-bold text-primary">${walletBalance.toFixed(2)}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Investment Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={walletBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000.00"
            />
            {insufficientFunds && amount && (
              <p className="text-xs text-destructive">Insufficient funds. Please deposit more cash.</p>
            )}
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
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-muted-foreground">Remaining Balance:</span>
              <span className={`font-medium ${insufficientFunds ? "text-destructive" : ""}`}>
                ${Math.max(0, walletBalance - investAmount).toFixed(2)}
              </span>
            </div>
          </div>

          <Button 
            onClick={handleInvest} 
            className="w-full" 
            disabled={loading || !amount || insufficientFunds}
          >
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
