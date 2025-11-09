import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload, Brain, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TypingAnimation } from "./TypingAnimation";
import { ActionButtons } from "./ActionButtons";

export const PhotoAnalyzer = () => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [showTyping, setShowTyping] = useState(false);
  const { toast } = useToast();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalPhotos = photos.length + files.length;

    if (totalPhotos > 4) {
      toast({
        title: "Maximum 4 Photos",
        description: "You can upload up to 4 photos per session",
        variant: "destructive",
      });
      return;
    }

    const validFiles = files.filter(file => 
      file.type === "image/jpeg" || file.type === "image/png"
    );

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid Format",
        description: "Only JPG and PNG images are supported",
        variant: "destructive",
      });
    }

    setPhotos(prev => [...prev, ...validFiles]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const analyzePhotos = async () => {
    if (photos.length === 0) {
      toast({
        title: "No Photos",
        description: "Please upload at least one photo to analyze",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setShowTyping(false);
    
    try {
      // Convert photos to base64
      const base64Photos = await Promise.all(
        photos.map(photo => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(photo);
          });
        })
      );

      const { data: result, error } = await supabase.functions.invoke("vvfi-instructor", {
        body: { 
          mode: "photo",
          photos: base64Photos,
          photoCount: photos.length
        }
      });

      if (error) throw error;

      setAnalysis(result.analysis);
      setShowTyping(true);

      // Log to unified data API
      await fetch("https://script.google.com/macros/s/AKfycbyYy6ZMsB1gNMEpAgTokVRv5vLJSr-uSRopkxX4968jjUrVdRfQtRLm6mc85R4apJMHww/exec", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          User: "System",
          Mode: "Photo",
          Timestamp: new Date().toISOString(),
          Summary: "Photo analysis completed",
          Recommendations: result.analysis,
          Severity: result.severity || "Moderate",
          Confidence: result.confidence || 0.85
        })
      });

      toast({
        title: "Analysis Complete",
        description: `Analyzed ${photos.length} photo(s) successfully`,
      });
    } catch (error) {
      console.error("Photo analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <Card className="p-4 sm:p-6 bg-card border border-border shadow-elevated">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <h2 className="text-base sm:text-xl font-bold text-foreground font-mono">
            Photo & Media Analyzer
          </h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img 
                  src={preview} 
                  alt={`Upload ${index + 1}`}
                  className="w-full h-32 object-cover rounded border border-border"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removePhoto(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {photos.length < 4 && (
              <label className="h-32 border-2 border-dashed border-border rounded flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">
                  Upload Photo
                </span>
                <span className="text-xs text-muted-foreground">
                  ({photos.length}/4)
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            )}
          </div>

          <Button 
            onClick={analyzePhotos}
            disabled={loading || photos.length === 0}
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-neon-orange text-sm sm:text-base"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="hidden sm:inline">Analyzing Photos...</span>
                <span className="sm:hidden">Analyzing...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Analyze Photos</span>
                <span className="sm:hidden">Analyze</span>
              </>
            )}
          </Button>
        </div>
      </Card>

      {analysis && (
        <Card className="p-4 sm:p-6 bg-card border border-border shadow-elevated">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-base sm:text-lg font-bold text-foreground font-mono">
              VVFI Analysis
            </h3>
            <ActionButtons content={analysis} type="photo" size="sm" />
          </div>
          
          <div className="bg-muted rounded border border-border p-3 sm:p-4">
            {showTyping ? (
              <TypingAnimation text={analysis} />
            ) : (
              <pre className="text-sm text-foreground font-mono whitespace-pre-wrap">
                {analysis}
              </pre>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
