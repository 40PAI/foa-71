import React from "react";
import { KPICard } from "@/components/KPICard";
import { cn } from "@/lib/utils";

interface KPIItem {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  alert?: string;
}

interface KPIGridProps {
  items: KPIItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function KPIGrid({ items, columns = 4, className }: KPIGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4"
  };

  return (
    <div className={cn(
      "grid gap-1 sm:gap-2 lg:gap-3 w-full",
      gridCols[columns],
      className
    )}>
      {items.map((item, index) => (
        <KPICard
          key={index}
          title={item.title}
          value={item.value}
          subtitle={item.subtitle}
          icon={item.icon}
          alert={item.alert as any || "green"}
        />
      ))}
    </div>
  );
}