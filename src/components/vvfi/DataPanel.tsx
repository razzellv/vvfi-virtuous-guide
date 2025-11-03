import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataPanelProps {
  onDataFetched: (data: any) => void;
}

export const DataPanel = ({ onDataFetched }: DataPanelProps) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbwUj0ZX4EJDu0gqZ0DHvMK3ZcF9vLhd_uS5p7tsYA4UOq2LO_DMYTLMWwsLGzcYlm3UVw/exec"
      );
      const result = await response.json();
      setData(result);
      onDataFetched(result);
      toast({
        title: "Data Fetched Successfully",
        description: "Facility data retrieved from Google Sheets",
      });
    } catch (error) {
      toast({
        title: "Error Fetching Data",
        description: "Failed to retrieve facility data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-card border border-border shadow-elevated">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground font-mono">
            Equipment Data Stream
          </h2>
        </div>
        <Button 
          onClick={fetchData} 
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon-blue"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Fetch Data
        </Button>
      </div>

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <DataField label="Equipment ID" value={data["Equipment ID"]} />
          <DataField label="System Type" value={data["System Type"]} />
          <DataField label="ΔT" value={data["ΔT"]} />
          <DataField label="Efficiency %" value={`${data["Efficiency %"]}%`} />
          <DataField label="Energy Loss %" value={`${data["Energy Loss %"]}%`} />
          <DataField label="Severity Score" value={data["Severity Score"]} />
          <DataField label="Compliance Status" value={data["Compliance Status"]} />
          <DataField label="Operator Notes" value={data["Operator Notes"]} span={true} />
        </div>
      )}
    </Card>
  );
};

const DataField = ({ label, value, span = false }: { label: string; value: string; span?: boolean }) => (
  <div className={`p-3 bg-muted rounded border border-border ${span ? "col-span-2 md:col-span-4" : ""}`}>
    <div className="text-xs text-muted-foreground font-mono mb-1">{label}</div>
    <div className="text-sm font-bold text-foreground font-mono">{value}</div>
  </div>
);
