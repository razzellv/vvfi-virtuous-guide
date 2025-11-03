import { useState } from "react";
import { Header } from "@/components/vvfi/Header";
import { PhotoAnalyzer } from "@/components/vvfi/PhotoAnalyzer";
import { TextAdvisor } from "@/components/vvfi/TextAdvisor";
import { VirtuousSupport } from "@/components/vvfi/VirtuousSupport";
import { SOPLibrary } from "@/components/vvfi/SOPLibrary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [selectedTab, setSelectedTab] = useState("photo");

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
          {/* Main Content Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-card border border-border h-auto p-2">
              <TabsTrigger 
                value="photo" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
              >
                📸 Photo Analyzer
              </TabsTrigger>
              <TabsTrigger 
                value="text"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
              >
                💬 Text Advisor
              </TabsTrigger>
              <TabsTrigger 
                value="virtuous"
                className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground py-3"
              >
                🛡️ Virtuous Support
              </TabsTrigger>
              <TabsTrigger 
                value="sop"
                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground py-3"
              >
                📚 SOP Library
              </TabsTrigger>
            </TabsList>

            <TabsContent value="photo">
              <PhotoAnalyzer />
            </TabsContent>

            <TabsContent value="text">
              <TextAdvisor />
            </TabsContent>

            <TabsContent value="virtuous">
              <VirtuousSupport />
            </TabsContent>

            <TabsContent value="sop">
              <SOPLibrary />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Index;
