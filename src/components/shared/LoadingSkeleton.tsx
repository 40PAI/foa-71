import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BaseComponentProps } from "@/types";

interface LoadingSkeletonProps extends BaseComponentProps {
  count?: number;
  variant?: "card" | "list" | "grid";
}

export function LoadingSkeleton({ 
  count = 4, 
  variant = "card", 
  className 
}: LoadingSkeletonProps) {
  const renderSkeleton = () => (
    <Card>
      <CardContent className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-2 bg-gray-200 rounded"></div>
        </div>
      </CardContent>
    </Card>
  );

  const gridClasses = {
    card: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
    list: "space-y-4",
    grid: "grid grid-cols-1 md:grid-cols-2 gap-4"
  };

  return (
    <div className={cn(gridClasses[variant], className)}>
      {[...Array(count)].map((_, i) => (
        <div key={i}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}