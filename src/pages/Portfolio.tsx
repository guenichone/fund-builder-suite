import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Portfolio from "@/components/portfolio/Portfolio";

const PortfolioPage = () => {
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
        <h2 className="text-3xl font-bold text-foreground">My Portfolio</h2>
        <p className="text-muted-foreground mt-1">Track your investments and performance</p>
      </div>
      <Portfolio userId={userId} />
    </div>
  );
};

export default PortfolioPage;
