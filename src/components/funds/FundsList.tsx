import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Shield, Target, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import InvestmentDialog from "./InvestmentDialog";
import EditFundDialog from "./EditFundDialog";

interface Fund {
  id: string;
  name: string;
  investment_strategy: string;
  risk_level: string;
  target_market: string;
  share_price: number;
  is_active: boolean;
  created_at: string;
}

interface FundsListProps {
  filter: "all" | "active" | "inactive";
  isAdmin: boolean;
  userId?: string;
}

const FundsList = ({ filter, isAdmin, userId }: FundsListProps) => {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadFunds = async () => {
    setLoading(true);
    try {
      let query = supabase.from("funds").select("*").order("created_at", { ascending: false });

      if (filter === "active") {
        query = query.eq("is_active", true);
      } else if (filter === "inactive") {
        query = query.eq("is_active", false);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFunds(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading funds",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFunds();
  }, [filter]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-success/10 text-success border-success/20";
      case "moderate":
        return "bg-accent/10 text-accent border-accent/20";
      case "high":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "very_high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (funds.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No funds found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {funds.map((fund) => (
        <Card key={fund.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{fund.name}</CardTitle>
                <CardDescription className="line-clamp-2">{fund.investment_strategy}</CardDescription>
              </div>
              {!fund.is_active && (
                <Badge variant="secondary" className="ml-2">
                  Inactive
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Risk Level:</span>
                <Badge variant="outline" className={getRiskColor(fund.risk_level)}>
                  {fund.risk_level.replace("_", " ")}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Market:</span>
                <span className="font-medium">{fund.target_market}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Share Price:</span>
                <span className="font-bold text-lg text-foreground">
                  ${Number(fund.share_price).toFixed(2)}
                </span>
              </div>
            </div>

            {!isAdmin && userId && fund.is_active && (
              <InvestmentDialog fundId={fund.id} fundName={fund.name} sharePrice={fund.share_price} userId={userId} />
            )}

            {isAdmin && <EditFundDialog fund={fund} onUpdate={loadFunds} />}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FundsList;
