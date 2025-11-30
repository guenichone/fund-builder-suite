import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface Investment {
  shares_quantity: number;
  fund: {
    name: string;
    share_price: number;
  };
}

interface PortfolioChartProps {
  investments: Investment[];
}

const PortfolioChart = ({ investments }: PortfolioChartProps) => {
  const fundValues = investments.reduce((acc, inv) => {
    const fundName = inv.fund.name;
    const value = Number(inv.shares_quantity) * Number(inv.fund.share_price);
    
    if (acc[fundName]) {
      acc[fundName] += value;
    } else {
      acc[fundName] = value;
    }
    
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(fundValues).map(([name, value]) => ({
    name: name.length > 20 ? name.substring(0, 20) + "..." : name,
    value: Number(value.toFixed(2)),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="name" 
          className="text-xs fill-muted-foreground"
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis className="text-xs fill-muted-foreground" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          labelStyle={{ color: "hsl(var(--popover-foreground))" }}
        />
        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PortfolioChart;
