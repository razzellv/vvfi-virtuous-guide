import { Shield } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-pulse-glow" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            </div>
            <div>
              <h1 className="text-sm sm:text-xl lg:text-2xl font-bold text-foreground font-mono tracking-tight">
                Virtual Virtuous <span className="text-primary">Facility Officer</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-mono hidden sm:block">
                Where Operations, Ethics, and Leadership Intelligence Converge
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
