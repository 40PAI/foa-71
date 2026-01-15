import { useState } from "react";
import { MobileHeader } from "./MobileHeader";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileMoreMenu } from "./MobileMoreMenu";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MobileHeader />
      
      <main className="flex-1 overflow-y-auto pb-20">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      
      <MobileBottomNav onMoreClick={() => setMoreMenuOpen(true)} />
      <MobileMoreMenu open={moreMenuOpen} onOpenChange={setMoreMenuOpen} />
    </div>
  );
}
