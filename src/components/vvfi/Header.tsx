import { Activity } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-pulse-glow" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            </div>
            <div>
              <h1 className="text-sm sm:text-xl lg:text-2xl font-bold text-foreground font-mono tracking-tight">
                Nexum Suum <span className="text-primary">Intelligence Suite</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-mono hidden sm:block">
                Virtual Virtuous Facility Instructor (VVFI)
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
