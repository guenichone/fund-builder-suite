import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, TrendingUp, Shield, Target, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import InvestmentDialog from "./InvestmentDialog";
import EditFundDialog from "./EditFundDialog";
import SellSharesDialog from "../portfolio/SellSharesDialog";

interface Fund {
  id: string;
  name: string;
  investment_strategy: string;
  risk_level: string;
  target_market: string;
  share_price: number;
  redemption_price: number | null;
  is_active: boolean;
  created_at: string;
}

interface UserInvestment {
  fund_id: string;
  total_shares: number;
  investment_id: string;
}

interface FundsListProps {
  filter: "all" | "active" | "inactive";
  isAdmin: boolean;
  userId?: string;
  userInvestments?: UserInvestment[];
  onInvestmentChange?: () => void;
}

const FundsList = ({ filter, isAdmin, userId, userInvestments = [], onInvestmentChange }: FundsListProps) => {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingFund, setTogglingFund] = useState<string | null>(null);
  const { toast } = useToast();

  const loadFunds = useCallback(async () => {
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
    } catch (error) {
      toast({
        title: "Error loading funds",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => {
    loadFunds();
  }, [loadFunds]);

  const handleToggleActive = async (fundId: string, currentStatus: boolean) => {
    setTogglingFund(fundId);
    try {
      const { error } = await supabase
        .from("funds")
        .update({ is_active: !currentStatus })
        .eq("id", fundId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Fund ${!currentStatus ? "activated" : "deactivated"} successfully.`,
      });

      loadFunds();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setTogglingFund(null);
    }
  };

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
        <Card key={fund.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl mb-2">{fund.name}</CardTitle>
                <CardDescription className="line-clamp-2">{fund.investment_strategy}</CardDescription>
              </div>
              {!fund.is_active && (
                <Badge variant="secondary" className="shrink-0">
                  Inactive
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="flex flex-col flex-grow">
            {/* Info Section */}
            <div className="space-y-4 flex flex-col flex-grow">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
                  <Badge variant="outline" className={getRiskColor(fund.risk_level)}>
                    {fund.risk_level.replace("_", " ")}
                  </Badge>
                </div>
              </div>
              
              {/* Flexible section that adjusts card height */}
              <div className="flex items-start gap-3 flex-grow">
                <Target className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Target Market</p>
                  <p className="text-sm font-medium leading-snug">{fund.target_market}</p>
                </div>
              </div>
              
              {/* Fixed position - always at bottom of info section */}
              <div className="flex items-start gap-3 mt-auto pt-2">
                <DollarSign className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Share Price</p>
                  <p className="text-xl font-bold text-primary">
                    ${Number(fund.share_price).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Section - Sticky to bottom */}
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              {isAdmin && (
                <div className="flex items-center justify-between gap-2 pb-2">
                  <Label htmlFor={`active-${fund.id}`} className="text-sm font-medium cursor-pointer">
                    {fund.is_active ? "Active" : "Inactive"}
                  </Label>
                  <Switch
                    id={`active-${fund.id}`}
                    checked={fund.is_active}
                    onCheckedChange={() => handleToggleActive(fund.id, fund.is_active)}
                    disabled={togglingFund === fund.id}
                  />
                </div>
              )}
              
              {!isAdmin && userId && fund.is_active && (() => {
                const userInvestment = userInvestments.find(inv => inv.fund_id === fund.id);
                const hasShares = userInvestment && userInvestment.total_shares > 0;
                
                return (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <InvestmentDialog fundId={fund.id} fundName={fund.name} sharePrice={fund.share_price} userId={userId} />
                    </div>
                    {hasShares && fund.redemption_price && (
                      <div className="flex-1">
                        <SellSharesDialog
                          investmentId={userInvestment.investment_id}
                          fundName={fund.name}
                          sharesOwned={userInvestment.total_shares}
                          redemptionPrice={fund.redemption_price}
                          onSuccess={() => {
                            if (onInvestmentChange) onInvestmentChange();
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })()}

              {isAdmin && <EditFundDialog fund={fund} onUpdate={loadFunds} />}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FundsList;
