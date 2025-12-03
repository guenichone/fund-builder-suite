import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Wallet, ArrowUpCircle, ArrowDownCircle, Loader2, History, DollarSign } from "lucide-react";
import { format } from "date-fns";

const WalletPage = () => {
  const [userId, setUserId] = useState<string>("");
  const { toast } = useToast();

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

  return <WalletContent userId={userId} toast={toast} />;
};

interface WalletContentProps {
  userId: string;
  toast: ReturnType<typeof useToast>["toast"];
}

const WalletContent = ({ userId, toast }: WalletContentProps) => {
  const { balance, transactions, loading, deposit, withdraw } = useWallet(userId);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }

    setProcessing(true);
    const success = await deposit(amount);
    setProcessing(false);

    if (success) {
      toast({ title: "Deposit successful", description: `$${amount.toFixed(2)} added to your wallet` });
      setDepositOpen(false);
      setDepositAmount("");
    } else {
      toast({ title: "Deposit failed", variant: "destructive" });
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }

    if (amount > balance) {
      toast({ title: "Insufficient funds", variant: "destructive" });
      return;
    }

    setProcessing(true);
    const success = await withdraw(amount);
    setProcessing(false);

    if (success) {
      toast({ title: "Withdrawal successful", description: `$${amount.toFixed(2)} withdrawn from your wallet` });
      setWithdrawOpen(false);
      setWithdrawAmount("");
    } else {
      toast({ title: "Withdrawal failed", variant: "destructive" });
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownCircle className="w-4 h-4 text-green-500" />;
      case "withdrawal":
        return <ArrowUpCircle className="w-4 h-4 text-red-500" />;
      case "purchase":
        return <DollarSign className="w-4 h-4 text-orange-500" />;
      case "sale":
        return <DollarSign className="w-4 h-4 text-green-500" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">My Wallet</h2>
        <p className="text-muted-foreground mt-1">Manage your cash balance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Balance Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="w-5 h-5 text-primary" />
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">${balance.toFixed(2)}</p>
            <div className="flex gap-3 mt-6">
              <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1 gap-2">
                    <ArrowDownCircle className="w-4 h-4" />
                    Deposit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Deposit Funds</DialogTitle>
                    <DialogDescription>Add cash to your wallet (demo mode)</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="deposit-amount">Amount ($)</Label>
                      <Input
                        id="deposit-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="1000.00"
                      />
                    </div>
                    <Button onClick={handleDeposit} className="w-full" disabled={processing}>
                      {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Confirm Deposit
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1 gap-2">
                    <ArrowUpCircle className="w-4 h-4" />
                    Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                    <DialogDescription>Withdraw cash from your wallet (demo mode)</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="withdraw-amount">Amount ($)</Label>
                      <Input
                        id="withdraw-amount"
                        type="number"
                        min="0"
                        max={balance}
                        step="0.01"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="500.00"
                      />
                      <p className="text-xs text-muted-foreground">Available: ${balance.toFixed(2)}</p>
                    </div>
                    <Button onClick={handleWithdraw} className="w-full" disabled={processing}>
                      {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Confirm Withdrawal
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Last 5 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getTransactionIcon(txn.type)}
                      <span className="capitalize">{txn.type}</span>
                    </div>
                    <span className={txn.amount >= 0 ? "text-green-600" : "text-red-600"}>
                      {txn.amount >= 0 ? "+" : ""}${txn.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>All your wallet transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No transactions yet. Deposit funds to get started!
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(txn.type)}
                    <div>
                      <p className="font-medium capitalize">{txn.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {txn.description || "—"} • {format(new Date(txn.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  <span className={`font-semibold ${txn.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {txn.amount >= 0 ? "+" : ""}${Math.abs(txn.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletPage;
