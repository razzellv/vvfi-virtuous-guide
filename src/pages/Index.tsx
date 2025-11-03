import { useState } from "react";
import { Header } from "@/components/vvfi/Header";
import { DataPanel } from "@/components/vvfi/DataPanel";
import { AnalysisPanel } from "@/components/vvfi/AnalysisPanel";
import { MetricsPanel } from "@/components/vvfi/MetricsPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [selectedTab, setSelectedTab] = useState("performance");
  const [facilityData, setFacilityData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<string>("");

  return (
    <div className="min-h-screen bg-background">
      {/* Animated background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,hsl(220,20%,15%)_1px,transparent_1px),linear-gradient(to_bottom,hsl(220,20%,15%)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      
      {/* Energy flow lines */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-energy-flow opacity-50" />
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent animate-energy-flow opacity-50" style={{ animationDelay: "1s" }} />
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-8 space-y-6">
          {/* Metrics Dashboard */}
          <MetricsPanel data={facilityData} />
          
          {/* Main Content Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
              <TabsTrigger 
                value="performance" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Performance & Efficiency
              </TabsTrigger>
              <TabsTrigger 
                value="compliance"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Compliance & Virtue Scores
              </TabsTrigger>
              <TabsTrigger 
                value="training"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Training & Guidance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-4 animate-fade-in">
              <DataPanel onDataFetched={setFacilityData} />
              <AnalysisPanel 
                data={facilityData} 
                type="performance"
                onAnalysisComplete={setAnalysis}
              />
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4 animate-fade-in">
              <DataPanel onDataFetched={setFacilityData} />
              <AnalysisPanel 
                data={facilityData} 
                type="compliance"
                onAnalysisComplete={setAnalysis}
              />
            </TabsContent>

            <TabsContent value="training" className="space-y-4 animate-fade-in">
              <AnalysisPanel 
                data={facilityData} 
                type="training"
                onAnalysisComplete={setAnalysis}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Index;
