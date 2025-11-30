import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from "recharts";

interface Investment {
  shares_quantity: number;
  fund: {
    name: string;
    share_price: number;
  };
}

interface ExposureChartProps {
  investments: Investment[];
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const ExposureChart = ({ investments }: ExposureChartProps) => {
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

  const total = Object.values(fundValues).reduce((sum, val) => sum + val, 0);

  const chartData = Object.entries(fundValues).map(([name, value]) => ({
    name: name.length > 25 ? name.substring(0, 25) + "..." : name,
    value: Number(value.toFixed(2)),
    percentage: ((value / total) * 100).toFixed(1),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ percentage }) => `${percentage}%`}
          outerRadius={80}
          fill="hsl(var(--primary))"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          formatter={(value: number) => `$${value.toFixed(2)}`}
        />
        <Legend
          wrapperStyle={{
            fontSize: "12px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ExposureChart;
