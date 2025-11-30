import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import FundsList from "@/components/funds/FundsList";

interface UserInvestment {
  fund_id: string;
  total_shares: number;
  investment_id: string;
}

const FundsPage = () => {
  const [userId, setUserId] = useState<string>("");
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        loadUserInvestments(session.user.id);
      }
    };
    getUser();
  }, []);

  const loadUserInvestments = async (uid: string) => {
    const { data, error } = await supabase
      .from("investments")
      .select("id, fund_id, shares_quantity")
      .eq("user_id", uid);

    if (!error && data) {
      // Group by fund_id and sum shares
      const grouped = data.reduce((acc: UserInvestment[], inv) => {
        const existing = acc.find(i => i.fund_id === inv.fund_id);
        if (existing) {
          existing.total_shares += Number(inv.shares_quantity);
        } else {
          acc.push({
            fund_id: inv.fund_id,
            total_shares: Number(inv.shares_quantity),
            investment_id: inv.id
          });
        }
        return acc;
      }, []);
      setUserInvestments(grouped);
    }
  };

  if (!userId) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Available Funds</h2>
        <p className="text-muted-foreground mt-1">Discover and invest in funds</p>
      </div>
      <FundsList 
        filter="active" 
        isAdmin={false} 
        userId={userId}
        userInvestments={userInvestments}
        onInvestmentChange={() => loadUserInvestments(userId)}
      />
    </div>
  );
};

export default FundsPage;
