import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3 lg:gap-4",
      className
    )}>
      <div className="min-w-0 flex-1">
        <h1 className="text-responsive-3xl font-bold leading-tight break-words">
          {title}
        </h1>
        {description && (
          <p className="text-responsive-base text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="shrink-0 w-full sm:w-auto">
          {action}
        </div>
      )}
    </div>
  );
}