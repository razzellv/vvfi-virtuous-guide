import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload, X, Loader2, AlertTriangle, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TypingAnimation } from "./TypingAnimation";
import { ActionButtons } from "./ActionButtons";
import { Badge } from "@/components/ui/badge";

interface AnalysisResult {
  Observed_Condition: string;
  Potential_Risks: string[];
  Operational_Impact: string;
  Safety_Compliance_Considerations: string;
  Recommended_Actions: string[];
  Preventive_Controls_ATI: string;
  Risk_Level: string;
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

export const PhotoMediaAnalysis = () => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [rawResponse, setRawResponse] = useState("");
  const [showTyping, setShowTyping] = useState(false);
  const { toast } = useToast();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 4) {
      toast({
        title: "Maximum Photos Reached",
        description: "You can upload up to 4 photos per session.",
        variant: "destructive",
      });
      return;
    }

    const validFiles = files.filter(file => 
      file.type === "image/jpeg" || file.type === "image/png"
    );

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid File Type",
        description: "Only JPG and PNG images are accepted.",
        variant: "destructive",
      });
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setPhotos(prev => [...prev, ...validFiles]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const analyzePhotos = async () => {
    if (photos.length === 0) {
      toast({
        title: "No Photos",
        description: "Please upload at least one photo for analysis.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setShowTyping(false);

    try {
      const photoData = await Promise.all(
        photos.map(photo => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(photo);
          });
        })
      );

      const { data, error } = await supabase.functions.invoke("vvfo-officer", {
        body: {
          mode: "photo",
          photos: photoData,
          photoCount: photos.length
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
          Mode: "Photo",
          Timestamp: new Date().toISOString(),
          Summary: data.structured?.Observed_Condition?.substring(0, 100) || "Photo Analysis",
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
      console.error("Photo analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not complete photo analysis. Please try again.",
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
          <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <h2 className="text-base sm:text-xl font-bold text-foreground font-mono">
            Photo & Media Analysis
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square rounded-lg border border-border overflow-hidden bg-muted">
              <img src={preview} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 w-6 h-6"
                onClick={() => removePhoto(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
          
          {photos.length < 4 && (
            <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center bg-muted/50 transition-colors">
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground mb-2" />
              <span className="text-xs text-muted-foreground text-center px-2">
                Upload Photo
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handlePhotoUpload}
                className="hidden"
                multiple
              />
            </label>
          )}
        </div>

        <p className="text-xs text-muted-foreground mb-4 font-mono">
          Upload up to 4 photos (JPG/PNG) for mechanical, electrical, or safety analysis.
        </p>

        <Button
          onClick={analyzePhotos}
          disabled={loading || photos.length === 0}
          className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Media...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Analyze Photos
            </>
          )}
        </Button>
      </Card>

      {result && (
        <Card className="p-4 sm:p-6 bg-card border border-border shadow-elevated">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-base sm:text-lg font-bold text-foreground font-mono">
                Visual Analysis Report
              </h3>
              <RiskBadge level={result.Risk_Level} />
            </div>
            <ActionButtons content={rawResponse} type="photo" size="sm" />
          </div>

          <div className="space-y-4">
            <div className="bg-muted rounded border border-border p-3 sm:p-4">
              <h4 className="text-sm font-bold text-primary font-mono mb-2">Observed Condition</h4>
              {showTyping ? (
                <TypingAnimation text={result.Observed_Condition} speed={15} />
              ) : (
                <p className="text-sm text-foreground">{result.Observed_Condition}</p>
              )}
            </div>

            <div className="bg-muted rounded border border-border p-3 sm:p-4">
              <h4 className="text-sm font-bold text-primary font-mono mb-2">Potential Risks</h4>
              <ul className="list-disc list-inside text-sm text-foreground space-y-1">
                {result.Potential_Risks?.map((risk, i) => (
                  <li key={i}>{risk}</li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-muted rounded border border-border p-3 sm:p-4">
                <h4 className="text-sm font-bold text-primary font-mono mb-2">Operational Impact</h4>
                <p className="text-sm text-foreground">{result.Operational_Impact}</p>
              </div>
              <div className="bg-muted rounded border border-border p-3 sm:p-4">
                <h4 className="text-sm font-bold text-primary font-mono mb-2">Safety & Compliance</h4>
                <p className="text-sm text-foreground">{result.Safety_Compliance_Considerations}</p>
              </div>
            </div>

            <div className="bg-muted rounded border border-border p-3 sm:p-4">
              <h4 className="text-sm font-bold text-primary font-mono mb-2">Recommended Actions</h4>
              <ol className="list-decimal list-inside text-sm text-foreground space-y-1">
                {result.Recommended_Actions?.map((action, i) => (
                  <li key={i}>{action}</li>
                ))}
              </ol>
            </div>

            <div className="bg-primary/10 border border-primary/30 rounded p-3 sm:p-4">
              <h4 className="text-sm font-bold text-primary font-mono mb-2">Preventive Controls (ATI)</h4>
              <p className="text-sm text-foreground">{result.Preventive_Controls_ATI}</p>
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
