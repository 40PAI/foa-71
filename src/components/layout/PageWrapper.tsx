import React from "react";
import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children: React.ReactNode;
  maxWidth?: "5xl" | "6xl" | "7xl" | "full";
  className?: string;
}

const maxWidthClasses = {
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  "full": "max-w-full",
};

export function PageWrapper({ 
  children, 
  maxWidth = "7xl",
  className 
}: PageWrapperProps) {
  return (
    <div className={cn(
      "w-full mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6",
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  );
}
