import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, FileText, Wrench, Shield, Zap, Droplets, Building2 } from "lucide-react";

interface SOP {
  id: string;
  title: string;
  category: string;
  reference: string;
  description: string;
  lastUpdated: string;
  type: "sop" | "process" | "policy";
}

const mockSOPs: SOP[] = [
  {
    id: "1",
    title: "HVAC Preventive Maintenance Protocol",
    category: "HVAC",
    reference: "SOP-HVAC-PM-001",
    description: "Comprehensive quarterly PM checklist for air handling units, chillers, and cooling towers.",
    lastUpdated: "2024-01-15",
    type: "sop"
  },
  {
    id: "2",
    title: "Electrical Safety Lockout/Tagout",
    category: "Electrical",
    reference: "SOP-ELEC-LOTO-002",
    description: "OSHA-compliant lockout/tagout procedures for electrical maintenance activities.",
    lastUpdated: "2024-02-01",
    type: "sop"
  },
  {
    id: "3",
    title: "Plumbing Fixture Maintenance",
    category: "Plumbing",
    reference: "SOP-PLB-FIX-003",
    description: "Standard procedures for flushometer, faucet, and drain maintenance.",
    lastUpdated: "2024-01-20",
    type: "sop"
  },
  {
    id: "4",
    title: "Fire Safety Inspection Process",
    category: "Fire & Safety",
    reference: "PROC-FIRE-INSP-001",
    description: "Monthly and annual fire safety inspection workflow and documentation requirements.",
    lastUpdated: "2024-02-10",
    type: "process"
  },
  {
    id: "5",
    title: "Vendor Management Policy",
    category: "Procurement",
    reference: "POL-VEND-MGT-001",
    description: "Guidelines for vendor selection, performance monitoring, and contract management.",
    lastUpdated: "2024-01-25",
    type: "policy"
  },
  {
    id: "6",
    title: "Emergency Response Procedures",
    category: "Emergency",
    reference: "SOP-EMRG-RESP-001",
    description: "Building emergency response protocols including evacuation, shelter-in-place, and incident reporting.",
    lastUpdated: "2024-02-05",
    type: "sop"
  },
  {
    id: "7",
    title: "Asset Lifecycle Management Process",
    category: "Asset Management",
    reference: "PROC-ASSET-LCM-001",
    description: "End-to-end asset tracking from acquisition through disposal.",
    lastUpdated: "2024-01-30",
    type: "process"
  },
  {
    id: "8",
    title: "Workplace Safety Policy",
    category: "Compliance",
    reference: "POL-SAFE-WRK-001",
    description: "OSHA-compliant workplace safety policies and employee responsibilities.",
    lastUpdated: "2024-02-08",
    type: "policy"
  }
];

const categoryIcons: Record<string, typeof Wrench> = {
  "HVAC": Zap,
  "Electrical": Zap,
  "Plumbing": Droplets,
  "Fire & Safety": Shield,
  "Procurement": Building2,
  "Emergency": Shield,
  "Asset Management": Building2,
  "Compliance": Shield
};

const typeColors: Record<string, string> = {
  "sop": "bg-primary/20 text-primary border-primary/50",
  "process": "bg-secondary/20 text-secondary border-secondary/50",
  "policy": "bg-purple-500/20 text-purple-400 border-purple-500/50"
};

export const SOPProcessLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const categories = [...new Set(mockSOPs.map(sop => sop.category))];
  const types = ["sop", "process", "policy"];

  const filteredSOPs = mockSOPs.filter(sop => {
    const matchesSearch = 
      sop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sop.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sop.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || sop.category === selectedCategory;
    const matchesType = !selectedType || sop.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <Card className="p-4 sm:p-6 bg-card border border-border shadow-elevated">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <h2 className="text-base sm:text-xl font-bold text-foreground font-mono">
            SOP & Process Library
          </h2>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search SOPs, processes, policies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 font-mono text-sm"
          />
        </div>

        {/* Type Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={selectedType === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(null)}
            className="text-xs font-mono"
          >
            All Types
          </Button>
          {types.map(type => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(selectedType === type ? null : type)}
              className="text-xs font-mono capitalize"
            >
              {type === "sop" ? "SOPs" : type === "process" ? "Processes" : "Policies"}
            </Button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="text-xs font-mono"
          >
            All Categories
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              className="text-xs font-mono"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* SOP Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSOPs.map(sop => {
            const IconComponent = categoryIcons[sop.category] || FileText;
            return (
              <Card key={sop.id} className="p-4 bg-muted border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4 text-primary shrink-0" />
                    <h3 className="text-sm font-bold text-foreground font-mono line-clamp-1">
                      {sop.title}
                    </h3>
                  </div>
                  <Badge className={`${typeColors[sop.type]} border text-xs font-mono capitalize shrink-0`}>
                    {sop.type}
                  </Badge>
                </div>
                
                <p className="text-xs text-primary font-mono mb-2">{sop.reference}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">
                  {sop.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-mono">
                    {sop.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    Updated: {sop.lastUpdated}
                  </span>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3 text-xs font-mono border-primary/50 hover:bg-primary/10"
                >
                  <FileText className="w-3 h-3 mr-2" />
                  View Document
                </Button>
              </Card>
            );
          })}
        </div>

        {filteredSOPs.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-mono text-sm">No documents found matching your criteria.</p>
          </div>
        )}
      </Card>
    </div>
  );
};
