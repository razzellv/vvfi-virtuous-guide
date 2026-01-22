import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TypingAnimation } from "./TypingAnimation";
import { ActionButtons } from "./ActionButtons";
import { Progress } from "@/components/ui/progress";

interface IntelligenceResult {
  Asset_Health_Score: number;
  Vendor_Performance_Score: number;
  Risk_to_Operations_Index: number;
  Contract_Status: string;
  SLA_Compliance: string;
  Escalation_Path: string[];
  Cost_Impact_Analysis: string;
  Recommendations: string[];
  Documentation_Notes: string;
}

const ScoreGauge = ({ label, score, trend }: { label: string; score: number; trend?: "up" | "down" | "stable" }) => {
  const getColor = (s: number) => {
    if (s >= 80) return "bg-green-500";
    if (s >= 60) return "bg-yellow-500";
    if (s >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-muted-foreground";

  return (
    <div className="bg-muted rounded border border-border p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs sm:text-sm font-mono text-muted-foreground">{label}</span>
        {trend && <TrendIcon className={`w-4 h-4 ${trendColor}`} />}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl sm:text-3xl font-bold text-foreground font-mono">{score}</span>
        <span className="text-sm text-muted-foreground mb-1">/100</span>
      </div>
      <Progress value={score} className={`h-2 mt-2 ${getColor(score)}`} />
    </div>
  );
};

export const AssetVendorIntelligence = () => {
  const [formData, setFormData] = useState({
    assetId: "",
    assetType: "",
    vendorName: "",
    contractType: "",
    slaTerms: "",
    performanceNotes: "",
    costData: "",
    issueHistory: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IntelligenceResult | null>(null);
  const [rawResponse, setRawResponse] = useState("");
  const [showTyping, setShowTyping] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const analyzeAssetVendor = async () => {
    const hasData = Object.values(formData).some(v => v.trim());
    if (!hasData) {
      toast({
        title: "No Data Provided",
        description: "Please enter asset or vendor information for analysis.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setShowTyping(false);

    try {
      const { data, error } = await supabase.functions.invoke("vvfo-officer", {
        body: {
          mode: "asset-vendor",
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
          Mode: "Asset-Vendor",
          Timestamp: new Date().toISOString(),
          Summary: `Asset: ${formData.assetId || 'N/A'}, Vendor: ${formData.vendorName || 'N/A'}`,
          Recommendations: data.structured?.Recommendations?.join(", ") || "",
          Severity: data.structured?.Risk_to_Operations_Index > 70 ? "High" : "Moderate",
          Confidence: 0.88
        })
      });

      toast({
        title: "Intelligence Generated",
        description: "Asset & Vendor analysis complete.",
      });
    } catch (error) {
      console.error("Asset/Vendor analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not complete analysis. Please try again.",
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
          <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <h2 className="text-base sm:text-xl font-bold text-foreground font-mono">
            Asset & Vendor Intelligence
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="assetId" className="text-sm font-mono">Asset ID</Label>
            <Input
              id="assetId"
              value={formData.assetId}
              onChange={(e) => handleInputChange("assetId", e.target.value)}
              placeholder="e.g., ASSET-2024-001"
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assetType" className="text-sm font-mono">Asset Type</Label>
            <Select onValueChange={(value) => handleInputChange("assetType", value)}>
              <SelectTrigger className="font-mono text-sm">
                <SelectValue placeholder="Select asset type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                <SelectItem value="vehicle">Vehicle/Fleet</SelectItem>
                <SelectItem value="technology">Technology/IT</SelectItem>
                <SelectItem value="furniture">Furniture/Fixtures</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendorName" className="text-sm font-mono">Vendor/Contractor</Label>
            <Input
              id="vendorName"
              value={formData.vendorName}
              onChange={(e) => handleInputChange("vendorName", e.target.value)}
              placeholder="Vendor or contractor name"
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contractType" className="text-sm font-mono">Contract Type</Label>
            <Select onValueChange={(value) => handleInputChange("contractType", value)}>
              <SelectTrigger className="font-mono text-sm">
                <SelectValue placeholder="Select contract type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-service">Full Service</SelectItem>
                <SelectItem value="preventive">Preventive Only</SelectItem>
                <SelectItem value="on-call">On-Call/Time & Material</SelectItem>
                <SelectItem value="warranty">Warranty Coverage</SelectItem>
                <SelectItem value="lease">Lease Agreement</SelectItem>
                <SelectItem value="none">No Contract</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="slaTerms" className="text-sm font-mono">SLA Terms / Response Requirements</Label>
            <Input
              id="slaTerms"
              value={formData.slaTerms}
              onChange={(e) => handleInputChange("slaTerms", e.target.value)}
              placeholder="e.g., 4-hour response, 24-hour resolution, 99% uptime"
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="performanceNotes" className="text-sm font-mono">Performance Notes</Label>
            <Textarea
              id="performanceNotes"
              value={formData.performanceNotes}
              onChange={(e) => handleInputChange("performanceNotes", e.target.value)}
              placeholder="Recent performance observations, response times, quality of work..."
              className="font-mono text-sm min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="costData" className="text-sm font-mono">Cost Data</Label>
            <Input
              id="costData"
              value={formData.costData}
              onChange={(e) => handleInputChange("costData", e.target.value)}
              placeholder="Monthly/annual cost, recent invoices..."
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issueHistory" className="text-sm font-mono">Issue History</Label>
            <Input
              id="issueHistory"
              value={formData.issueHistory}
              onChange={(e) => handleInputChange("issueHistory", e.target.value)}
              placeholder="Recent issues, complaints, escalations..."
              className="font-mono text-sm"
            />
          </div>
        </div>

        <Button
          onClick={analyzeAssetVendor}
          disabled={loading}
          className="w-full mt-6 bg-secondary text-secondary-foreground hover:bg-secondary/90"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Intelligence...
            </>
          ) : (
            <>
              <Building2 className="w-4 h-4 mr-2" />
              Generate Asset & Vendor Intelligence
            </>
          )}
        </Button>
      </Card>

      {result && (
        <Card className="p-4 sm:p-6 bg-card border border-border shadow-elevated">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-base sm:text-lg font-bold text-foreground font-mono">
              Intelligence Report
            </h3>
            <ActionButtons content={rawResponse} type="asset-vendor" size="sm" />
          </div>

          {/* Score Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <ScoreGauge label="Asset Health Score" score={result.Asset_Health_Score} trend="stable" />
            <ScoreGauge label="Vendor Performance" score={result.Vendor_Performance_Score} trend="up" />
            <ScoreGauge label="Risk to Operations" score={result.Risk_to_Operations_Index} trend="down" />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-muted rounded border border-border p-3 sm:p-4">
                <h4 className="text-sm font-bold text-primary font-mono mb-2">Contract Status</h4>
                <p className="text-sm text-foreground">{result.Contract_Status}</p>
              </div>
              <div className="bg-muted rounded border border-border p-3 sm:p-4">
                <h4 className="text-sm font-bold text-primary font-mono mb-2">SLA Compliance</h4>
                <p className="text-sm text-foreground">{result.SLA_Compliance}</p>
              </div>
            </div>

            <div className="bg-muted rounded border border-border p-3 sm:p-4">
              <h4 className="text-sm font-bold text-primary font-mono mb-2">Escalation Path</h4>
              <ol className="list-decimal list-inside text-sm text-foreground space-y-1">
                {result.Escalation_Path?.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="bg-muted rounded border border-border p-3 sm:p-4">
              <h4 className="text-sm font-bold text-primary font-mono mb-2">Cost Impact Analysis</h4>
              <p className="text-sm text-foreground">{result.Cost_Impact_Analysis}</p>
            </div>

            <div className="bg-muted rounded border border-border p-3 sm:p-4">
              <h4 className="text-sm font-bold text-primary font-mono mb-2">Recommendations</h4>
              <ul className="list-disc list-inside text-sm text-foreground space-y-1">
                {result.Recommendations?.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="bg-primary/10 border border-primary/30 rounded p-3 sm:p-4">
              <h4 className="text-sm font-bold text-primary font-mono mb-2">Documentation Notes</h4>
              <p className="text-sm text-foreground">{result.Documentation_Notes}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
