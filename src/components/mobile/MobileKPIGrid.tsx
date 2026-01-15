import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPIItem {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "default" | "success" | "warning" | "danger" | "info";
}

interface MobileKPIGridProps {
  items: KPIItem[];
  isLoading?: boolean;
  columns?: 2 | 3;
  className?: string;
}

const colorClasses = {
  default: "text-foreground",
  success: "text-green-600 dark:text-green-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  danger: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
};

const iconBgClasses = {
  default: "bg-muted",
  success: "bg-green-100 dark:bg-green-900/30",
  warning: "bg-yellow-100 dark:bg-yellow-900/30",
  danger: "bg-red-100 dark:bg-red-900/30",
  info: "bg-blue-100 dark:bg-blue-900/30",
};

export function MobileKPIGrid({ items, isLoading, columns = 2, className }: MobileKPIGridProps) {
  if (isLoading) {
    return (
      <div className={cn(
        "grid gap-2",
        columns === 2 ? "grid-cols-2" : "grid-cols-3",
        className
      )}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-3">
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-5 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(
      "grid gap-2",
      columns === 2 ? "grid-cols-2" : "grid-cols-3",
      className
    )}>
      {items.map((item, index) => {
        const Icon = item.icon;
        const color = item.color || "default";
        
        return (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide truncate">
                    {item.label}
                  </p>
                  <p className={cn(
                    "text-base font-bold mt-0.5 truncate",
                    colorClasses[color]
                  )}>
                    {item.value}
                  </p>
                  {item.subtitle && (
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  )}
                </div>
                {Icon && (
                  <div className={cn(
                    "h-7 w-7 rounded-lg flex items-center justify-center shrink-0",
                    iconBgClasses[color]
                  )}>
                    <Icon className={cn("h-3.5 w-3.5", colorClasses[color])} />
                  </div>
                )}
              </div>
              {item.trend && item.trendValue && (
                <div className={cn(
                  "text-[10px] mt-1 font-medium",
                  item.trend === "up" ? "text-green-600" : 
                  item.trend === "down" ? "text-red-600" : 
                  "text-muted-foreground"
                )}>
                  {item.trend === "up" ? "↑" : item.trend === "down" ? "↓" : "→"} {item.trendValue}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
