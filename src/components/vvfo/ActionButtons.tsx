import { Button } from "@/components/ui/button";
import { FileText, Send, BookOpen, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ActionButtonsProps {
  content: string;
  type: "operational" | "asset-vendor" | "photo" | "compliance";
  size?: "default" | "sm";
}

export const ActionButtons = ({ content, type, size = "default" }: ActionButtonsProps) => {
  const { toast } = useToast();

  const generateReport = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vvfo-${type}-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Report Generated",
      description: "Your report has been downloaded as markdown.",
    });
  };

  const exportPDF = () => {
    // For now, export as markdown (PDF would require additional library)
    generateReport();
    toast({
      title: "Export Complete",
      description: "Report exported successfully.",
    });
  };

  const saveAsCase = () => {
    const caseData = {
      type,
      content,
      timestamp: new Date().toISOString(),
      title: `Case: ${type.charAt(0).toUpperCase() + type.slice(1)} Analysis`
    };
    localStorage.setItem(`vvfo-case-${Date.now()}`, JSON.stringify(caseData));
    toast({
      title: "Case Saved",
      description: "Analysis saved to your case files.",
    });
  };

  const flagForReview = async () => {
    try {
      await fetch("https://hook.us2.make.com/gpa1hpqkfpaobwykun7pc5sn91v1pbn5", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Type: `VVFO_${type.toUpperCase()}_REVIEW`,
          Content: content.substring(0, 500),
          Timestamp: new Date().toISOString(),
          Priority: "Leadership Review Required"
        })
      });
      toast({
        title: "Flagged for Review",
        description: "This analysis has been flagged for leadership review.",
      });
    } catch (error) {
      toast({
        title: "Flag Failed",
        description: "Could not flag for review. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size={size}
        onClick={generateReport}
        className="border-border hover:bg-muted text-xs sm:text-sm"
      >
        <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">Generate Report</span>
        <span className="sm:hidden">Report</span>
      </Button>
      <Button
        variant="outline"
        size={size}
        onClick={exportPDF}
        className="border-border hover:bg-muted text-xs sm:text-sm"
      >
        <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">Export PDF</span>
        <span className="sm:hidden">Export</span>
      </Button>
      <Button
        variant="outline"
        size={size}
        onClick={saveAsCase}
        className="border-border hover:bg-muted text-xs sm:text-sm"
      >
        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">Save as Case</span>
        <span className="sm:hidden">Save</span>
      </Button>
      <Button
        variant="outline"
        size={size}
        onClick={flagForReview}
        className="border-secondary text-secondary hover:bg-secondary/10 text-xs sm:text-sm"
      >
        <Flag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">Flag for Review</span>
        <span className="sm:hidden">Flag</span>
      </Button>
    </div>
  );
};
