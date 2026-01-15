import { useState } from "react";
import { MobileHeader } from "./MobileHeader";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileMoreMenu } from "./MobileMoreMenu";
import { MobileMainContent } from "./MobileMainContent";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export function MobileLayout() {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MobileHeader />
      
      <div className="flex-1 overflow-y-auto pb-20">
        <ErrorBoundary>
          <MobileMainContent />
        </ErrorBoundary>
      </div>
      
      <MobileBottomNav onMoreClick={() => setMoreMenuOpen(true)} />
      <MobileMoreMenu open={moreMenuOpen} onOpenChange={setMoreMenuOpen} />
    </div>
  );
}
