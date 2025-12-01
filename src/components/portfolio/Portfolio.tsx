import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, PieChart, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PortfolioChart from "./PortfolioChart";
import ExposureChart from "./ExposureChart";

interface Investment {
  id: string;
  shares_quantity: number;
  total_amount: number;
  purchase_date: string;
  fund: {
    id: string;
    name: string;
    share_price: number;
    redemption_price: number | null;
  };
}

interface PortfolioProps {
  userId: string;
}

const Portfolio = ({ userId }: PortfolioProps) => {
  const { toast } = useToast();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);

  const loadPortfolio = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("investments")
        .select(
          `
          id,
          shares_quantity,
          total_amount,
          purchase_date,
          fund:funds (
            id,
            name,
            share_price,
            redemption_price
          )
        `
        )
        .eq("user_id", userId)
        .order("purchase_date", { ascending: false });

      if (error) throw error;

      const typedData = data as unknown as Investment[];
      setInvestments(typedData);

      const invested = typedData.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
      const current = typedData.reduce(
        (sum, inv) => sum + Number(inv.shares_quantity) * Number(inv.fund.share_price),
        0
      );

      setTotalInvested(invested);
      setTotalValue(current);
    } catch (error) {
      toast({
        title: "Error loading portfolio",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (investments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">No investments yet</p>
          <p className="text-muted-foreground">Start investing in funds to build your portfolio</p>
        </CardContent>
      </Card>
    );
  }

  const gainLoss = totalValue - totalInvested;
  const gainLossPercent = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Invested</CardDescription>
            <CardTitle className="text-3xl">${totalInvested.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Current Value</CardDescription>
            <CardTitle className="text-3xl">${totalValue.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Gain/Loss</CardDescription>
            <CardTitle className={`text-3xl ${gainLoss >= 0 ? "text-success" : "text-destructive"}`}>
              {gainLoss >= 0 ? "+" : ""}${gainLoss.toFixed(2)}
              <span className="text-base ml-2">({gainLossPercent >= 0 ? "+" : ""}
              {gainLossPercent.toFixed(2)}%)</span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <CardTitle>Portfolio Distribution</CardTitle>
            </div>
            <CardDescription>Value by fund</CardDescription>
          </CardHeader>
          <CardContent>
            <PortfolioChart investments={investments} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-accent" />
              <CardTitle>Fund Exposure</CardTitle>
            </div>
            <CardDescription>Percentage allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <ExposureChart investments={investments} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Investment History</CardTitle>
          <CardDescription>Your recent transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {investments.map((investment) => {
              const currentValue = Number(investment.shares_quantity) * Number(investment.fund.share_price);
              const invested = Number(investment.total_amount);
              const profit = currentValue - invested;

              return (
                <div
                  key={investment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{investment.fund.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {Number(investment.shares_quantity).toFixed(4)} shares • Purchased{" "}
                      {new Date(investment.purchase_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${currentValue.toFixed(2)}</p>
                    <p className={`text-sm ${profit >= 0 ? "text-success" : "text-destructive"}`}>
                      {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Portfolio;
