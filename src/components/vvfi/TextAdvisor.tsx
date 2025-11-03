import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TypingAnimation } from "./TypingAnimation";
import { ActionButtons } from "./ActionButtons";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const TextAdvisor = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTyping, setCurrentTyping] = useState<string | null>(null);
  const { toast } = useToast();

  const sendQuestion = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setCurrentTyping(null);

    try {
      const { data: result, error } = await supabase.functions.invoke("vvfi-instructor", {
        body: { 
          mode: "text",
          question: input,
          conversationHistory: messages.slice(-5) // Last 5 messages for context
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: result.analysis,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCurrentTyping(result.analysis);

      // Log to unified data API
      await fetch("https://script.google.com/macros/s/AKfycbyYy6ZMsB1gNMEpAgTokVRv5vLJSr-uSRopkxX4968jjUrVdRfQtRLm6mc85R4apJMHww/exec", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          User: "System",
          Mode: "Text",
          Timestamp: new Date().toISOString(),
          Summary: input.substring(0, 100),
          Recommendations: result.analysis,
          Severity: result.severity || "Low",
          Confidence: result.confidence || 0.90
        })
      });
    } catch (error) {
      console.error("Text advisor error:", error);
      toast({
        title: "Request Failed",
        description: "Failed to get advisor response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="p-6 bg-card border border-border shadow-elevated">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground font-mono">
            Text-Based Technical Advisor
          </h2>
        </div>

        <div className="space-y-4">
          <div className="bg-muted rounded border border-border p-4 min-h-[400px] max-h-[400px] overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-mono">Ask a technical question to get started</p>
                <p className="text-sm mt-2">Examples:</p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• "Why is my flushometer leaking?"</li>
                  <li>• "How do I calibrate a pressuretrol?"</li>
                  <li>• "What causes a chiller to short cycle?"</li>
                </ul>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border border-border"
                    }`}
                  >
                    {message.role === "assistant" && currentTyping === message.content ? (
                      <TypingAnimation text={message.content} speed={20} />
                    ) : (
                      <pre className="text-sm font-mono whitespace-pre-wrap">
                        {message.content}
                      </pre>
                    )}
                    {message.role === "assistant" && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <ActionButtons content={message.content} type="text" size="sm" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-background border border-border rounded-lg p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your technical question here... (Shift+Enter for new line)"
              className="min-h-[60px] font-mono"
              disabled={loading}
            />
            <Button
              onClick={sendQuestion}
              disabled={loading || !input.trim()}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-neon-orange"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
