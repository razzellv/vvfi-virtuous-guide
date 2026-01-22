import { useState } from "react";
import { Header } from "@/components/vvfo/Header";
import { OperationalAnalysis } from "@/components/vvfo/OperationalAnalysis";
import { AssetVendorIntelligence } from "@/components/vvfo/AssetVendorIntelligence";
import { PhotoMediaAnalysis } from "@/components/vvfo/PhotoMediaAnalysis";
import { ComplianceEthics } from "@/components/vvfo/ComplianceEthics";
import { SOPProcessLibrary } from "@/components/vvfo/SOPProcessLibrary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Building2, Camera, Shield, BookOpen } from "lucide-react";

const Index = () => {
  const [selectedTab, setSelectedTab] = useState("operational");

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary))_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>
      
      {/* Subtle gradient orbs */}
      <div className="fixed top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-20 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-card border border-border h-auto p-1">
              <TabsTrigger 
                value="operational" 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 px-1 sm:px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-mono text-xs sm:text-sm"
              >
                <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Operational</span>
                <span className="sm:hidden text-[10px]">Ops</span>
              </TabsTrigger>
              <TabsTrigger 
                value="asset-vendor" 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 px-1 sm:px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-mono text-xs sm:text-sm"
              >
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Asset & Vendor</span>
                <span className="sm:hidden text-[10px]">Assets</span>
              </TabsTrigger>
              <TabsTrigger 
                value="photo" 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 px-1 sm:px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-mono text-xs sm:text-sm"
              >
                <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Photo Analysis</span>
                <span className="sm:hidden text-[10px]">Photo</span>
              </TabsTrigger>
              <TabsTrigger 
                value="compliance" 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 px-1 sm:px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-mono text-xs sm:text-sm"
              >
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Compliance</span>
                <span className="sm:hidden text-[10px]">Ethics</span>
              </TabsTrigger>
              <TabsTrigger 
                value="sop" 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 px-1 sm:px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-mono text-xs sm:text-sm"
              >
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">SOP Library</span>
                <span className="sm:hidden text-[10px]">SOPs</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="operational" className="mt-4 sm:mt-6">
              <OperationalAnalysis />
            </TabsContent>
            
            <TabsContent value="asset-vendor" className="mt-4 sm:mt-6">
              <AssetVendorIntelligence />
            </TabsContent>
            
            <TabsContent value="photo" className="mt-4 sm:mt-6">
              <PhotoMediaAnalysis />
            </TabsContent>
            
            <TabsContent value="compliance" className="mt-4 sm:mt-6">
              <ComplianceEthics />
            </TabsContent>
            
            <TabsContent value="sop" className="mt-4 sm:mt-6">
              <SOPProcessLibrary />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Index;
