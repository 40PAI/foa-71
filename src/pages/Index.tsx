
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MainContent } from "@/components/MainContent";
import { Header } from "@/components/Header";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileLayout } from "@/components/layout/MobileLayout";

const DesktopLayout = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out overflow-x-hidden",
        isCollapsed 
          ? "md:ml-14" 
          : "md:ml-64"
      )}>
        <Header />
        <MainContent />
      </div>
    </div>
  );
};

const Index = () => {
  const isMobile = useIsMobile();

  // Mobile: Use dedicated mobile layout with bottom navigation
  if (isMobile) {
    return (
      <MobileLayout>
        <MainContent />
      </MobileLayout>
    );
  }

  // Desktop/Tablet: Use sidebar layout
  return (
    <SidebarProvider defaultOpen={false}>
      <DesktopLayout />
    </SidebarProvider>
  );
};

export default Index;
