import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Shield, AlertTriangle, Send, Loader2, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TypingAnimation } from "./TypingAnimation";
import { ActionButtons } from "./ActionButtons";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const VirtuousSupport = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [showTyping, setShowTyping] = useState(false);
  const [isCritical, setIsCritical] = useState(false);
  const { toast } = useToast();

  const getGuidance = async () => {
    if (!input.trim()) {
      toast({
        title: "No Question",
        description: "Please enter your question or concern",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setShowTyping(false);
    setIsCritical(false);

    try {
      const { data: result, error } = await supabase.functions.invoke("vvfi-instructor", {
        body: { 
          mode: "ethical",
          question: input
        }
      });

      if (error) throw error;

      setResponse(result.analysis);
      setShowTyping(true);
      setIsCritical(result.critical === true);

      // Log to virtuous risk webhook if critical
      if (result.critical) {
        await fetch("https://hook.us2.make.com/1vy6fnpog325o1odim6fyr2whl0q9uva", {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Type: "Critical_Ethical_Issue",
            Timestamp: new Date().toISOString(),
            Question: input.substring(0, 200),
            Severity: "CRITICAL"
          })
        });
      }

      // Log to unified data API
      await fetch("https://script.google.com/macros/s/AKfycbyYy6ZMsB1gNMEpAgTokVRv5vLJSr-uSRopkxX4968jjUrVdRfQtRLm6mc85R4apJMHww/exec", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          User: "System",
          Mode: "Ethical",
          Timestamp: new Date().toISOString(),
          Summary: input.substring(0, 100),
          Recommendations: result.analysis,
          Severity: result.critical ? "CRITICAL" : "Moderate",
          Confidence: 0.95
        })
      });

      toast({
        title: "Guidance Provided",
        description: result.critical ? "⚠️ Critical issue flagged" : "Response generated",
      });
    } catch (error) {
      console.error("Virtuous support error:", error);
      toast({
        title: "Request Failed",
        description: "Failed to get guidance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="p-6 bg-card border border-border shadow-elevated">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-secondary" />
          <h2 className="text-xl font-bold text-foreground font-mono">
            Ethical & Virtuous Support
          </h2>
        </div>

        <Alert className="mb-4 border-primary/50 bg-primary/10">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-sm">
            This is a confidential space for workplace ethics, safety concerns, and personal guidance.
            All responses follow EEOC, OSHA, and legal guidelines.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share your concern or question regarding workplace ethics, safety, harassment, discrimination, or any personal issue..."
            className="min-h-[120px] font-mono"
            disabled={loading}
          />

          <Button
            onClick={getGuidance}
            disabled={loading || !input.trim()}
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-neon-orange"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Get Confidential Guidance
              </>
            )}
          </Button>
        </div>
      </Card>

      {response && (
        <>
          {isCritical && (
            <Alert className="border-destructive bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDescription className="text-sm font-semibold">
                CRITICAL ISSUE DETECTED — Immediate action recommended
              </AlertDescription>
            </Alert>
          )}

          <Card className="p-6 bg-card border border-border shadow-elevated">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground font-mono">
                VVFI Guidance Response
              </h3>
              <ActionButtons content={response} type="ethical" />
            </div>

            <div className="bg-muted rounded border border-border p-4">
              {showTyping ? (
                <TypingAnimation text={response} speed={15} />
              ) : (
                <pre className="text-sm text-foreground font-mono whitespace-pre-wrap">
                  {response}
                </pre>
              )}
            </div>

            {isCritical && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded space-y-3">
                <p className="text-sm font-bold text-foreground">Support Resources:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>HR Hotline: 1-800-XXX-XXXX</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>Ethics Email: ethics@company.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Emergency: Call 911 if immediate danger</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
