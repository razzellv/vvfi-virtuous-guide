import { GaugeChart } from "./GaugeChart";
import { Card } from "@/components/ui/card";

interface MetricsPanelProps {
  data: any;
}

export const MetricsPanel = ({ data }: MetricsPanelProps) => {
  const efficiency = data?.["Efficiency %"] || 0;
  const virtueScore = data ? Math.max(0, 100 - (data["Severity Score"] || 0) * 10) : 0;
  const complianceScore = data?.["Compliance Status"] === "Pass" ? 95 : 45;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6 bg-card border border-border shadow-elevated">
        <GaugeChart 
          value={efficiency} 
          label="Efficiency %" 
          color="hsl(190, 100%, 50%)"
        />
      </Card>
      <Card className="p-6 bg-card border border-border shadow-elevated">
        <GaugeChart 
          value={virtueScore} 
          label="Virtue Index" 
          color="hsl(15, 100%, 60%)"
        />
      </Card>
      <Card className="p-6 bg-card border border-border shadow-elevated">
        <GaugeChart 
          value={complianceScore} 
          label="Compliance Score" 
          color="hsl(190, 100%, 50%)"
        />
      </Card>
    </div>
  );
};
