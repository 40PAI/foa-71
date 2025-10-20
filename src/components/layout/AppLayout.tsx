import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
        isCollapsed ? "md:ml-14" : "md:ml-64"
      )}>
        <Header />
        <main className="flex-1 min-w-0 w-full px-2 py-1">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <LayoutContent>
        {children}
      </LayoutContent>
    </SidebarProvider>
  );
}