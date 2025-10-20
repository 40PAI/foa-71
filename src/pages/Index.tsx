<<<<<<< HEAD

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
=======
const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Hygdrasil Obras
        </h1>
        <p className="text-muted-foreground">
          Sistema de Gestão de Obras
        </p>
>>>>>>> 385105deeaeec01a51b29ec67774ee6d4c608afa
      </div>
    </div>
  );
};

<<<<<<< HEAD
const Index = () => {
  return (
    <SidebarProvider defaultOpen={false}>
      <ResponsiveLayout />
    </SidebarProvider>
  );
};

=======
>>>>>>> 385105deeaeec01a51b29ec67774ee6d4c608afa
export default Index;
