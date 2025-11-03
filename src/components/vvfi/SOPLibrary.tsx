import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Download, FileText, Wrench, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SOP {
  id: string;
  title: string;
  category: "Mechanical" | "Electrical" | "Safety" | "Compliance" | "PM";
  reference: string;
  description: string;
  lastUpdated: string;
}

const mockSOPs: SOP[] = [
  {
    id: "SOP-22",
    title: "Sanitary Fixture Maintenance",
    category: "Mechanical",
    reference: "SOP-22",
    description: "Procedures for maintaining flushometers, faucets, and sanitary fixtures",
    lastUpdated: "2025-10-15"
  },
  {
    id: "SOP-05",
    title: "Mechanical Alignment Procedures",
    category: "Mechanical",
    reference: "SOP-Mechanical-Alignment-05",
    description: "Step-by-step guide for shaft alignment and coupling installation",
    lastUpdated: "2025-09-22"
  },
  {
    id: "PM-03",
    title: "Motor Lubrication Schedule",
    category: "PM",
    reference: "PM-Motor-Lubrication-03",
    description: "Preventive maintenance schedule for motor bearing lubrication",
    lastUpdated: "2025-10-01"
  },
  {
    id: "SOP-OSHA-01",
    title: "OSHA Lockout/Tagout",
    category: "Safety",
    reference: "SOP-OSHA-LOTO-01",
    description: "Lockout/Tagout procedures per OSHA 1910.147 standard",
    lastUpdated: "2025-08-10"
  },
  {
    id: "SOP-EPA-04",
    title: "Refrigerant Handling Compliance",
    category: "Compliance",
    reference: "SOP-EPA-Refrigerant-04",
    description: "EPA Section 608 compliant refrigerant recovery and handling",
    lastUpdated: "2025-09-05"
  },
  {
    id: "SOP-ASME-02",
    title: "Boiler Pressure Vessel Inspection",
    category: "Compliance",
    reference: "SOP-ASME-BPV-02",
    description: "ASME pressure vessel inspection and documentation procedures",
    lastUpdated: "2025-07-18"
  }
];

export const SOPLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredSOPs = mockSOPs.filter(sop => {
    const matchesSearch = 
      sop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sop.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sop.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || sop.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ["Mechanical", "Electrical", "Safety", "Compliance", "PM"];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Mechanical": return <Wrench className="w-4 h-4" />;
      case "Safety": return <Shield className="w-4 h-4" />;
      case "PM": return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Mechanical": return "bg-primary/20 text-primary border-primary";
      case "Electrical": return "bg-secondary/20 text-secondary border-secondary";
      case "Safety": return "bg-destructive/20 text-destructive border-destructive";
      case "Compliance": return "bg-accent/20 text-accent-foreground border-accent";
      case "PM": return "bg-muted text-muted-foreground border-muted-foreground";
      default: return "bg-muted text-muted-foreground border-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="p-6 bg-card border border-border shadow-elevated">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground font-mono">
            SOP & PM Library
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SOPs, procedures, references..."
                className="pl-9 font-mono"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSOPs.map(sop => (
          <Card key={sop.id} className="p-5 bg-card border border-border hover:border-primary transition-colors">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground font-mono mb-1">
                    {sop.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    Reference: {sop.reference}
                  </p>
                </div>
                <Badge className={getCategoryColor(sop.category)}>
                  <span className="flex items-center gap-1">
                    {getCategoryIcon(sop.category)}
                    {sop.category}
                  </span>
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                {sop.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Updated: {sop.lastUpdated}
                </span>
                <Button size="sm" variant="outline" className="gap-2">
                  <Download className="w-3 h-3" />
                  View SOP
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredSOPs.length === 0 && (
        <Card className="p-12 bg-card border border-border">
          <div className="text-center text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-mono">No SOPs found matching your criteria</p>
          </div>
        </Card>
      )}
    </div>
  );
};
