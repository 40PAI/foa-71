import React from "react";
import { cn } from "@/lib/utils";
import { responsiveUtils } from "@/components/ui/responsive-utils";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: "page" | "section" | "card";
  padding?: boolean;
}

/**
 * Responsive container component that provides consistent spacing and layout
 */
export function ResponsiveContainer({ 
  children, 
  className = "", 
  variant = "page",
  padding = true 
}: ResponsiveContainerProps) {
  const baseClasses = "w-full min-w-0";
  const variantClasses = responsiveUtils.containers[variant];
  const paddingClasses = padding ? "p-2 sm:p-4 lg:p-6" : "";

  return (
    <div className={cn(
      baseClasses,
      variant === "page" ? paddingClasses : "",
      variantClasses,
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  variant?: "kpi" | "cards" | "charts" | "materials" | "responsive";
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    large?: number;
  };
}

/**
 * Responsive grid component with predefined breakpoints and spacing
 */
export function ResponsiveGrid({ 
  children, 
  className = "", 
  variant = "cards",
  columns 
}: ResponsiveGridProps) {
  let gridClasses = responsiveUtils.grids[variant];
  
  if (columns) {
    const { mobile = 1, tablet = 2, desktop = 3, large = 4 } = columns;
    gridClasses = `grid grid-cols-${mobile} sm:grid-cols-${tablet} lg:grid-cols-${desktop} xl:grid-cols-${large} gap-2 sm:gap-3 lg:gap-4`;
  }

  return (
    <div className={cn(gridClasses, className)}>
      {children}
    </div>
  );
}

interface ResponsiveFlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: "row" | "col" | "responsive";
  align?: "start" | "center" | "end" | "between";
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
}

/**
 * Responsive flex container with consistent spacing and alignment
 */
export function ResponsiveFlex({ 
  children, 
  className = "", 
  direction = "row",
  align = "start",
  gap = "md"
}: ResponsiveFlexProps) {
  const directionClasses = {
    row: "flex flex-row",
    col: "flex flex-col",
    responsive: "flex flex-col sm:flex-row"
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    between: "items-center justify-between"
  };

  const gapClasses = responsiveUtils.spacing[gap];

  return (
    <div className={cn(
      directionClasses[direction],
      alignClasses[align],
      gapClasses,
      className
    )}>
      {children}
    </div>
  );
}