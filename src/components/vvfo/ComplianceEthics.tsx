import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Shield, AlertTriangle, Send, Loader2, Phone, Mail, FileWarning } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TypingAnimation } from "./TypingAnimation";
import { ActionButtons } from "./ActionButtons";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const ComplianceEthics = () => {
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [showTyping, setShowTyping] = useState(false);
  const [isCritical, setIsCritical] = useState(false);
  const [requiresEscalation, setRequiresEscalation] = useState(false);
  const { toast } = useToast();

  const getGuidance = async () => {
    if (!input.trim()) {
      toast({
        title: "No Input",
        description: "Please describe your concern or question.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setShowTyping(false);
    setIsCritical(false);
    setRequiresEscalation(false);

    try {
      const { data: result, error } = await supabase.functions.invoke("vvfo-officer", {
        body: { 
          mode: "compliance",
          question: input,
          category: category
        }
      });

      if (error) throw error;

      setResponse(result.analysis);
      setShowTyping(true);
      setIsCritical(result.critical === true);
      setRequiresEscalation(result.requiresEscalation === true);

      // Log critical issues to virtuous risk webhook
      if (result.critical || result.requiresEscalation) {
        await fetch("https://hook.us2.make.com/1vy6fnpog325o1odim6fyr2whl0q9uva", {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Type: "Compliance_Ethics_Issue",
            Category: category || "General",
            Timestamp: new Date().toISOString(),
            Summary: input.substring(0, 200),
            Severity: result.critical ? "CRITICAL" : "ESCALATION_REQUIRED"
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
          Mode: "Compliance",
          Timestamp: new Date().toISOString(),
          Summary: input.substring(0, 100),
          Recommendations: result.analysis,
          Severity: result.critical ? "CRITICAL" : result.requiresEscalation ? "High" : "Moderate",
          Confidence: 0.92
        })
      });

      toast({
        title: "Guidance Provided",
        description: result.critical ? "⚠️ Critical issue identified" : "Response generated",
      });
    } catch (error) {
      console.error("Compliance guidance error:", error);
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
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <Card className="p-4 sm:p-6 bg-card border border-border shadow-elevated">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
          <h2 className="text-base sm:text-xl font-bold text-foreground font-mono">
            Compliance & Ethics Guidance
          </h2>
        </div>

        <Alert className="mb-4 border-primary/50 bg-primary/10">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-xs sm:text-sm">
            Confidential guidance for workplace ethics, safety compliance, and regulatory matters.
            Responses follow OSHA, ASME, EPA, EEOC, and legal guidelines.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-mono">Issue Category</Label>
            <Select onValueChange={setCategory}>
              <SelectTrigger className="font-mono text-sm">
                <SelectValue placeholder="Select category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="safety">Safety Violation / OSHA</SelectItem>
                <SelectItem value="environmental">Environmental / EPA</SelectItem>
                <SelectItem value="harassment">Harassment / Discrimination</SelectItem>
                <SelectItem value="retaliation">Retaliation / Whistleblower</SelectItem>
                <SelectItem value="documentation">Documentation Gap</SelectItem>
                <SelectItem value="ethics">General Ethics</SelectItem>
                <SelectItem value="leadership">Leadership Conduct</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="concern" className="text-sm font-mono">Describe Your Concern</Label>
            <Textarea
              id="concern"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the situation, concern, or question in detail..."
              className="min-h-[120px] sm:min-h-[150px] font-mono text-sm"
              disabled={loading}
            />
          </div>

          <Button
            onClick={getGuidance}
            disabled={loading || !input.trim()}
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
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
                CRITICAL ISSUE — This matter may require formal reporting or immediate escalation.
              </AlertDescription>
            </Alert>
          )}

          {requiresEscalation && !isCritical && (
            <Alert className="border-secondary bg-secondary/10">
              <FileWarning className="h-5 w-5 text-secondary" />
              <AlertDescription className="text-sm font-semibold">
                This issue may require formal reporting or escalation to appropriate authorities.
              </AlertDescription>
            </Alert>
          )}

          <Card className="p-4 sm:p-6 bg-card border border-border shadow-elevated">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-base sm:text-lg font-bold text-foreground font-mono">
                VVFO Compliance Guidance
              </h3>
              <ActionButtons content={response} type="compliance" size="sm" />
            </div>

            <div className="bg-muted rounded border border-border p-3 sm:p-4">
              {showTyping ? (
                <TypingAnimation text={response} speed={15} />
              ) : (
                <pre className="text-sm text-foreground font-mono whitespace-pre-wrap">
                  {response}
                </pre>
              )}
            </div>

            {(isCritical || requiresEscalation) && (
              <div className="mt-4 p-3 sm:p-4 bg-destructive/10 border border-destructive/50 rounded space-y-3">
                <p className="text-sm font-bold text-foreground font-mono">Support & Escalation Resources:</p>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 shrink-0 text-destructive" />
                    <span>HR Hotline: 1-800-XXX-XXXX (Configurable)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 shrink-0 text-destructive" />
                    <span>Ethics Email: ethics@company.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-destructive" />
                    <span>Emergency: Call 911 if immediate danger</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 shrink-0 text-destructive" />
                    <span>OSHA Hotline: 1-800-321-OSHA (6742)</span>
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
