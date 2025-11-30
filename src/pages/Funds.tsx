import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import FundsList from "@/components/funds/FundsList";

const FundsPage = () => {
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
      <div>
        <h2 className="text-3xl font-bold text-foreground">Available Funds</h2>
        <p className="text-muted-foreground mt-1">Discover and invest in funds</p>
      </div>
      <FundsList filter="active" isAdmin={false} userId={userId} />
    </div>
  );
};

export default FundsPage;
