import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WalletTransaction {
  id: string;
  type: "deposit" | "withdrawal" | "purchase" | "sale";
  amount: number;
  description: string | null;
  created_at: string;
}

export function useWallet(userId: string) {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWallet = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // Get or create wallet
      const { data: wallet, error: walletError } = await supabase
        .from("user_wallets")
        .select("balance")
        .eq("user_id", userId)
        .maybeSingle();

      if (walletError) throw walletError;

      if (wallet) {
        setBalance(Number(wallet.balance));
      } else {
        // Create wallet if it doesn't exist (for existing users)
        const { error: createError } = await supabase
          .from("user_wallets")
          .insert({ user_id: userId, balance: 0 });

        if (createError && !createError.message.includes("duplicate")) {
          throw createError;
        }
        setBalance(0);
      }

      // Load transactions
      const { data: txns, error: txnError } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (txnError) throw txnError;
      setTransactions(txns as WalletTransaction[]);
    } catch (error) {
      console.error("Failed to load wallet:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const deposit = async (amount: number): Promise<boolean> => {
    try {
      const newBalance = balance + amount;

      const { error: updateError } = await supabase
        .from("user_wallets")
        .update({ balance: newBalance })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      const { error: txnError } = await supabase
        .from("wallet_transactions")
        .insert({
          user_id: userId,
          type: "deposit",
          amount: amount,
          description: "Cash deposit",
        });

      if (txnError) throw txnError;

      await loadWallet();
      return true;
    } catch (error) {
      console.error("Deposit failed:", error);
      return false;
    }
  };

  const withdraw = async (amount: number): Promise<boolean> => {
    if (amount > balance) return false;

    try {
      const newBalance = balance - amount;

      const { error: updateError } = await supabase
        .from("user_wallets")
        .update({ balance: newBalance })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      const { error: txnError } = await supabase
        .from("wallet_transactions")
        .insert({
          user_id: userId,
          type: "withdrawal",
          amount: -amount,
          description: "Cash withdrawal",
        });

      if (txnError) throw txnError;

      await loadWallet();
      return true;
    } catch (error) {
      console.error("Withdrawal failed:", error);
      return false;
    }
  };

  const deductForPurchase = async (amount: number, fundName: string, investmentId?: string): Promise<boolean> => {
    if (amount > balance) return false;

    try {
      const newBalance = balance - amount;

      const { error: updateError } = await supabase
        .from("user_wallets")
        .update({ balance: newBalance })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      const { error: txnError } = await supabase
        .from("wallet_transactions")
        .insert({
          user_id: userId,
          type: "purchase",
          amount: -amount,
          description: `Purchase: ${fundName}`,
          reference_id: investmentId,
        });

      if (txnError) throw txnError;

      await loadWallet();
      return true;
    } catch (error) {
      console.error("Purchase deduction failed:", error);
      return false;
    }
  };

  const creditForSale = async (amount: number, fundName: string, investmentId?: string): Promise<boolean> => {
    try {
      const newBalance = balance + amount;

      const { error: updateError } = await supabase
        .from("user_wallets")
        .update({ balance: newBalance })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      const { error: txnError } = await supabase
        .from("wallet_transactions")
        .insert({
          user_id: userId,
          type: "sale",
          amount: amount,
          description: `Sale: ${fundName}`,
          reference_id: investmentId,
        });

      if (txnError) throw txnError;

      await loadWallet();
      return true;
    } catch (error) {
      console.error("Sale credit failed:", error);
      return false;
    }
  };

  return {
    balance,
    transactions,
    loading,
    deposit,
    withdraw,
    deductForPurchase,
    creditForSale,
    refresh: loadWallet,
  };
}
