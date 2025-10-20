
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MainContent } from "@/components/MainContent";
import { Header } from "@/components/Header";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const ResponsiveLayout = () => {
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
  return (
    <SidebarProvider defaultOpen={false}>
      <ResponsiveLayout />
    </SidebarProvider>
  );
};

export default Index;
