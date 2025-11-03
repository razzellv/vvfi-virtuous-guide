import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface GaugeChartProps {
  value: number;
  label: string;
  color: string;
}

export const GaugeChart = ({ value, label, color }: GaugeChartProps) => {
  const data = [
    { value: value },
    { value: 100 - value }
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <ResponsiveContainer width="100%" height={150}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
          >
            <Cell fill={color} />
            <Cell fill="hsl(220, 20%, 15%)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center">
        <div className="text-3xl font-bold font-mono" style={{ color }}>
          {value.toFixed(1)}%
        </div>
        <div className="text-sm text-muted-foreground font-mono mt-1">
          {label}
        </div>
      </div>
    </div>
  );
};
