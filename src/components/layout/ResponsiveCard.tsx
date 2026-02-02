import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { responsiveUtils } from "@/components/ui/responsive-utils";

interface ResponsiveCardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  variant?: "default" | "compact" | "large";
  padding?: "none" | "sm" | "md" | "lg";
}

/**
 * Responsive card component with consistent spacing and typography
 */
export function ResponsiveCard({
  children,
  title,
  subtitle,
  headerAction,
  className = "",
  headerClassName = "",
  contentClassName = "",
  variant = "default",
  padding = "md"
}: ResponsiveCardProps) {
  const paddingClasses = {
    none: "",
    sm: responsiveUtils.containers.cardCompact,
    md: responsiveUtils.containers.card,
    lg: "p-3 sm:p-4 lg:p-6 xl:p-8"
  };

  const headerPaddingClasses = {
    none: "",
    sm: "p-2 pb-1",
    md: "p-2 sm:p-3 lg:p-4 pb-1 sm:pb-2",
    lg: "p-3 sm:p-4 lg:p-6 pb-2 sm:pb-3"
  };

  const contentPaddingClasses = {
    none: "",
    sm: "p-2 pt-0",
    md: "p-2 sm:p-3 lg:p-4 pt-0",
    lg: "p-3 sm:p-4 lg:p-6 pt-0"
  };

  return (
    <Card className={cn("min-w-0 h-fit", className)}>
      {(title || subtitle || headerAction) && (
        <CardHeader className={cn(
          headerPaddingClasses[padding],
          "flex flex-row items-start justify-between space-y-0",
          headerClassName
        )}>
          <div className="min-w-0 flex-1 space-y-1">
            {title && (
              <CardTitle className={cn(
                responsiveUtils.text.cardTitle,
                "pr-2"
              )}>
                {title}
              </CardTitle>
            )}
            {subtitle && (
              <p className={cn(
                responsiveUtils.text.subtitle,
                "line-clamp-2"
              )}>
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && (
            <div className="shrink-0 ml-2">
              {headerAction}
            </div>
          )}
        </CardHeader>
      )}
      {children && (
        <CardContent className={cn(
          contentPaddingClasses[padding],
          contentClassName
        )}>
          {children}
        </CardContent>
      )}
    </Card>
  );
}

interface ResponsiveKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  status?: "success" | "warning" | "danger" | "info";
  className?: string;
}

/**
 * Responsive KPI card optimized for mobile and desktop viewing
 */
export function ResponsiveKPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  status,
  className = ""
}: ResponsiveKPICardProps) {
  return (
    <Card className={cn("min-w-0 h-fit", className)}>
      <CardHeader className="p-2 sm:p-3 lg:p-4 pb-1 sm:pb-2">
        <div className="flex items-start justify-between min-w-0 gap-1 sm:gap-2">
          <CardTitle className={cn(
            "text-xs sm:text-sm font-medium leading-tight truncate flex-1",
            "min-w-0"
          )} title={title}>
            {title}
          </CardTitle>
          {icon && (
            <div className="shrink-0 text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-3 lg:p-4 pt-0 space-y-1">
        <div className="flex items-start justify-between min-w-0 gap-1">
          <div className={cn(
            "text-base sm:text-lg lg:text-xl xl:text-2xl font-bold break-all leading-tight flex-1",
            "min-w-0"
          )} title={String(value)}>
            {value}
          </div>
          {(trend || status) && (
            <div className="shrink-0 flex items-center">
              {/* Trend and status indicators can be added here */}
            </div>
          )}
        </div>
        {subtitle && (
          <p className={cn(
            "text-xs text-muted-foreground line-clamp-2 leading-tight"
          )} title={subtitle}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}