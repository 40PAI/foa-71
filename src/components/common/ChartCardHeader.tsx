import { ReactNode } from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InfoTooltip, InfoTooltipContent } from "./InfoTooltip";
import { cn } from "@/lib/utils";

interface ChartCardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  info?: InfoTooltipContent;
  actions?: ReactNode;
  className?: string;
}

export function ChartCardHeader({
  title,
  description,
  info,
  actions,
  className,
}: ChartCardHeaderProps) {
  return (
    <CardHeader className={cn("flex flex-row items-start justify-between space-y-0 gap-2", className)}>
      <div className="min-w-0 flex-1">
        <CardTitle className="text-base flex items-center gap-2 min-w-0">
          <span className="truncate">{title}</span>
          {info && <InfoTooltip {...info} title={info.title || (typeof title === "string" ? title : undefined)} />}
        </CardTitle>
        {description && (
          <CardDescription className="mt-1">{description}</CardDescription>
        )}
      </div>
      {actions && <div className="shrink-0 flex items-center gap-1">{actions}</div>}
    </CardHeader>
  );
}
