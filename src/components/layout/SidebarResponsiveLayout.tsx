import { ReactNode } from "react";
import { useSidebar } from "@/components/ui/sidebar";

interface SidebarResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Layout component that adapts content spacing based on sidebar state
 * Provides full-width layouts when sidebar is collapsed or on mobile
 */
export function SidebarResponsiveLayout({ children, className = "" }: SidebarResponsiveLayoutProps) {
  const { open: sidebarOpen } = useSidebar();
  
  return (
    <div className={`
      w-full layout-full-width
      ${sidebarOpen ? 'sidebar-responsive-padding sidebar-open' : 'sidebar-responsive-padding'}
      ${className}
    `}>
      {children}
    </div>
  );
}

/**
 * Grid component that adapts to full width without sidebar constraints
 */
export function ResponsiveGrid({ 
  children, 
  className = "",
  cols = "auto-fit"
}: { 
  children: ReactNode; 
  className?: string;
  cols?: "auto-fit" | "auto-fill" | number;
}) {
  const gridCols = typeof cols === 'number' 
    ? `repeat(${cols}, minmax(0, 1fr))`
    : `repeat(${cols}, minmax(280px, 1fr))`;
    
  return (
    <div 
      className={`w-full layout-content-spacing ${className}`}
      style={{ 
        display: 'grid', 
        gridTemplateColumns: gridCols,
      }}
    >
      {children}
    </div>
  );
}