import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Loader2, AlertTriangle, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TypingAnimation } from "./TypingAnimation";
import { ActionButtons } from "./ActionButtons";
import { Badge } from "@/components/ui/badge";

interface AnalysisResult {
  Issue: string;
  Risk_Level: string;
  Operational_Impact: string;
  Root_Cause_Signals: string[];
  Recommended_Actions: string[];
  Compliance_Notes: string;
  Decision_Defensibility: string;
  ATI_Path: string;
  Confidence_Score: number;
}

const RiskBadge = ({ level }: { level: string }) => {
  const config = {
    Low: { color: "bg-green-500/20 text-green-400 border-green-500/50", icon: CheckCircle },
    Moderate: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50", icon: AlertCircle },
    High: { color: "bg-orange-500/20 text-orange-400 border-orange-500/50", icon: AlertTriangle },
    Critical: { color: "bg-red-500/20 text-red-400 border-red-500/50", icon: XCircle },
  }[level] || { color: "bg-muted text-muted-foreground", icon: AlertCircle };

  const Icon = config.icon;

  return (
    <Badge className={`${config.color} border font-mono`}>
      <Icon className="w-3 h-3 mr-1" />
      {level}
    </Badge>
  );
};

export const OperationalAnalysis = () => {
  const [formData, setFormData] = useState({
    equipmentId: "",
    systemType: "",
    performanceMetrics: "",
    assetStatus: "",
    operatorNotes: "",
    maintenanceLogs: "",
    complianceStatus: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [rawResponse, setRawResponse] = useState("");
  const [showTyping, setShowTyping] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const analyzeOperations = async () => {
    const hasData = Object.values(formData).some(v => v.trim());
    if (!hasData) {
      toast({
        title: "No Data Provided",
        description: "Please enter at least one field for analysis.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setShowTyping(false);

    try {
      const { data, error } = await supabase.functions.invoke("vvfo-officer", {
        body: {
          mode: "operational",
          data: formData
        }
      });

      if (error) throw error;

      setResult(data.structured);
      setRawResponse(data.analysis);
      setShowTyping(true);

      // Log to unified API
      await fetch("https://script.google.com/macros/s/AKfycbyYy6ZMsB1gNMEpAgTokVRv5vLJSr-uSRopkxX4968jjUrVdRfQtRLm6mc85R4apJMHww/exec", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          User: "System",
          Mode: "Operational",
          Timestamp: new Date().toISOString(),
          Summary: data.structured?.Issue || "Operational Analysis",
          Recommendations: data.structured?.Recommended_Actions?.join(", ") || "",
          Severity: data.structured?.Risk_Level || "Moderate",
          Confidence: data.structured?.Confidence_Score || 0.85
        })
      });

      toast({
        title: "Analysis Complete",
        description: `Risk Level: ${data.structured?.Risk_Level || "Assessed"}`,
      });
    } catch (error) {
      console.error("Operational analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not complete operational analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <Card className="p-4 sm:p-6 bg-card border border-border shadow-elevated">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <h2 className="text-base sm:text-xl font-bold text-foreground font-mono">
            Operational Intelligence Analysis
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="equipmentId" className="text-sm font-mono">Equipment ID</Label>
            <Input
              id="equipmentId"
              value={formData.equipmentId}
              onChange={(e) => handleInputChange("equipmentId", e.target.value)}
              placeholder="e.g., AHU-01, CHW-003"
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemType" className="text-sm font-mono">System Type</Label>
            <Select onValueChange={(value) => handleInputChange("systemType", value)}>
              <SelectTrigger className="font-mono text-sm">
                <SelectValue placeholder="Select system type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hvac">HVAC</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="mechanical">Mechanical</SelectItem>
                <SelectItem value="fire-safety">Fire & Safety</SelectItem>
                <SelectItem value="elevator">Elevator/Lift</SelectItem>
                <SelectItem value="bms">BMS/Controls</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="performanceMetrics" className="text-sm font-mono">Performance Metrics</Label>
            <Input
              id="performanceMetrics"
              value={formData.performanceMetrics}
              onChange={(e) => handleInputChange("performanceMetrics", e.target.value)}
              placeholder="ΔT, Efficiency %, Downtime hrs, Energy Loss %"
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assetStatus" className="text-sm font-mono">Asset Status</Label>
            <Select onValueChange={(value) => handleInputChange("assetStatus", value)}>
              <SelectTrigger className="font-mono text-sm">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="degraded">Degraded Performance</SelectItem>
                <SelectItem value="maintenance">Under Maintenance</SelectItem>
                <SelectItem value="failed">Failed/Down</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="operatorNotes" className="text-sm font-mono">Operator Notes</Label>
            <Textarea
              id="operatorNotes"
              value={formData.operatorNotes}
              onChange={(e) => handleInputChange("operatorNotes", e.target.value)}
              placeholder="Describe observed symptoms, unusual sounds, behaviors, or concerns..."
              className="font-mono text-sm min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenanceLogs" className="text-sm font-mono">Recent Maintenance</Label>
            <Input
              id="maintenanceLogs"
              value={formData.maintenanceLogs}
              onChange={(e) => handleInputChange("maintenanceLogs", e.target.value)}
              placeholder="Last PM date, repairs, parts replaced..."
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="complianceStatus" className="text-sm font-mono">Compliance Status</Label>
            <Select onValueChange={(value) => handleInputChange("complianceStatus", value)}>
              <SelectTrigger className="font-mono text-sm">
                <SelectValue placeholder="Select compliance status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compliant">Compliant</SelectItem>
                <SelectItem value="due">Inspection Due</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="violation">Violation Noted</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={analyzeOperations}
          disabled={loading}
          className="w-full mt-6 bg-secondary text-secondary-foreground hover:bg-secondary/90"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Operations...
            </>
          ) : (
            <>
              <Activity className="w-4 h-4 mr-2" />
              Generate Operational Intelligence
            </>
          )}
        </Button>
      </Card>

      {result && (
        <Card className="p-4 sm:p-6 bg-card border border-border shadow-elevated">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-base sm:text-lg font-bold text-foreground font-mono">
                VVFO Analysis Report
              </h3>
              <RiskBadge level={result.Risk_Level} />
            </div>
            <ActionButtons content={rawResponse} type="operational" size="sm" />
          </div>

          <div className="space-y-4">
            {/* Structured Output */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-muted rounded border border-border p-3 sm:p-4">
                <h4 className="text-sm font-bold text-primary font-mono mb-2">Issue</h4>
                <p className="text-sm text-foreground">{result.Issue}</p>
              </div>
              <div className="bg-muted rounded border border-border p-3 sm:p-4">
                <h4 className="text-sm font-bold text-primary font-mono mb-2">Operational Impact</h4>
                <p className="text-sm text-foreground">{result.Operational_Impact}</p>
              </div>
            </div>

            <div className="bg-muted rounded border border-border p-3 sm:p-4">
              <h4 className="text-sm font-bold text-primary font-mono mb-2">Root Cause Signals</h4>
              <ul className="list-disc list-inside text-sm text-foreground space-y-1">
                {result.Root_Cause_Signals?.map((signal, i) => (
                  <li key={i}>{signal}</li>
                ))}
              </ul>
            </div>

            <div className="bg-muted rounded border border-border p-3 sm:p-4">
              <h4 className="text-sm font-bold text-primary font-mono mb-2">Recommended Actions</h4>
              <ol className="list-decimal list-inside text-sm text-foreground space-y-1">
                {result.Recommended_Actions?.map((action, i) => (
                  <li key={i}>{action}</li>
                ))}
              </ol>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-muted rounded border border-border p-3 sm:p-4">
                <h4 className="text-sm font-bold text-primary font-mono mb-2">Compliance Notes</h4>
                <p className="text-sm text-foreground">{result.Compliance_Notes}</p>
              </div>
              <div className="bg-muted rounded border border-border p-3 sm:p-4">
                <h4 className="text-sm font-bold text-primary font-mono mb-2">Decision Defensibility</h4>
                <p className="text-sm text-foreground">{result.Decision_Defensibility}</p>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/30 rounded p-3 sm:p-4">
              <h4 className="text-sm font-bold text-primary font-mono mb-2">ATI — Analyze to Improve Path</h4>
              <p className="text-sm text-foreground">{result.ATI_Path}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>Confidence Score: {(result.Confidence_Score * 100).toFixed(0)}%</span>
              <span>Generated: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
