import { Button } from "@/components/ui/button";
import { Download, Send, Save, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ActionButtonsProps {
  content: string;
  type: "photo" | "text" | "ethical";
  size?: "default" | "sm";
}

export const ActionButtons = ({ content, type, size = "default" }: ActionButtonsProps) => {
  const { toast } = useToast();

  const generatePDF = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vvfi-${type}-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Generated",
      description: "PDF instruction sheet downloaded",
    });
  };

  const sendToPortal = async () => {
    // Send to compliance log webhook
    try {
      await fetch("https://hook.us2.make.com/gpa1hpqkfpaobwykun7pc5sn91v1pbn5", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Type: type,
          Content: content.substring(0, 500),
          Timestamp: new Date().toISOString()
        })
      });

      toast({
        title: "Sent to Portal",
        description: "Report forwarded to compliance portal",
      });
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Could not send to portal",
        variant: "destructive",
      });
    }
  };

  const saveAsLesson = () => {
    const lessonData = {
      type,
      content,
      timestamp: new Date().toISOString(),
      title: `VVFI ${type} lesson - ${new Date().toLocaleDateString()}`
    };

    localStorage.setItem(
      `vvfi-lesson-${Date.now()}`,
      JSON.stringify(lessonData)
    );

    toast({
      title: "Saved as Lesson",
      description: "Added to your training library",
    });
  };

  return (
    <div className="flex gap-1.5 sm:gap-2 flex-wrap">
      <Button 
        onClick={generatePDF}
        variant="outline"
        size={size}
        className="border-primary text-primary hover:bg-primary/10 text-xs sm:text-sm"
      >
        <Download className="w-3 h-3 mr-0.5 sm:mr-1" />
        <span className="hidden sm:inline">PDF</span>
        <span className="sm:hidden">PDF</span>
      </Button>
      <Button 
        onClick={sendToPortal}
        variant="outline"
        size={size}
        className="border-secondary text-secondary hover:bg-secondary/10 text-xs sm:text-sm"
      >
        <Send className="w-3 h-3 mr-0.5 sm:mr-1" />
        <span className="hidden sm:inline">Portal</span>
        <span className="sm:hidden">Send</span>
      </Button>
      <Button 
        onClick={saveAsLesson}
        variant="outline"
        size={size}
        className="border-accent text-accent-foreground hover:bg-accent/10 text-xs sm:text-sm"
      >
        <Save className="w-3 h-3 mr-0.5 sm:mr-1" />
        <span className="hidden sm:inline">Lesson</span>
        <span className="sm:hidden">Save</span>
      </Button>
    </div>
  );
};
