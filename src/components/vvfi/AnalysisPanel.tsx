import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Download, Send, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisPanelProps {
  data: any;
  type: "performance" | "compliance" | "training";
  onAnalysisComplete: (analysis: string) => void;
}

export const AnalysisPanel = ({ data, type, onAnalysisComplete }: AnalysisPanelProps) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const { toast } = useToast();

  const analyzeData = async () => {
    if (!data) {
      toast({
        title: "No Data Available",
        description: "Please fetch equipment data first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("analyze-facility", {
        body: { facilityData: data, analysisType: type }
      });

      if (error) throw error;

      setAnalysis(result.analysis);
      onAnalysisComplete(result.analysis);
      
      toast({
        title: "Analysis Complete",
        description: "VVFI has generated insights and recommendations",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to generate facility analysis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!analysis) return;
    
    const blob = new Blob([analysis], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vvfi-${type}-report-${new Date().toISOString()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Exported",
      description: "Analysis downloaded as Markdown file",
    });
  };

  return (
    <Card className="p-6 bg-card border border-border shadow-elevated">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-secondary" />
          <h2 className="text-xl font-bold text-foreground font-mono">
            VVFI Analysis: {type.charAt(0).toUpperCase() + type.slice(1)}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={analyzeData} 
            disabled={loading || !data}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-neon-orange"
          >
            <Brain className={`w-4 h-4 mr-2 ${loading ? "animate-pulse" : ""}`} />
            Generate Analysis
          </Button>
          {analysis && (
            <>
              <Button 
                onClick={exportReport}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button 
                variant="outline"
                className="border-secondary text-secondary hover:bg-secondary/10"
              >
                <Send className="w-4 h-4 mr-2" />
                Send to Portal
              </Button>
              <Button 
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Flag Supervisor
              </Button>
            </>
          )}
        </div>
      </div>

      {analysis && (
        <div className="mt-4 p-4 bg-muted rounded border border-border overflow-auto max-h-96">
          <pre className="text-sm text-foreground font-mono whitespace-pre-wrap">
            {analysis}
          </pre>
        </div>
      )}
    </Card>
  );
};
