import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { LucideIcon, ChevronRight } from "lucide-react";

interface ProgressItem {
  label: string;
  value: number;
  color?: string;
}

interface MetadataItem {
  label: string;
  value: string | number;
  icon?: LucideIcon;
}

interface ActionItem {
  icon: LucideIcon;
  onClick: () => void;
  label?: string;
  variant?: "default" | "ghost" | "destructive";
  disabled?: boolean;
}

interface MobileDataCardProps {
  title: string;
  subtitle?: string;
  status?: {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  progress?: ProgressItem[];
  metadata?: MetadataItem[];
  actions?: ActionItem[];
  onClick?: () => void;
  className?: string;
  icon?: LucideIcon;
  highlight?: boolean;
  badge?: string;
}

export function MobileDataCard({
  title,
  subtitle,
  status,
  progress,
  metadata,
  actions,
  onClick,
  className,
  icon: Icon,
  highlight,
  badge,
}: MobileDataCardProps) {
  return (
    <Card 
      className={cn(
        "transition-all active:scale-[0.98]",
        highlight && "border-primary/50 bg-primary/5",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {Icon && (
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">{title}</h3>
                {badge && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {badge}
                  </Badge>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
          </div>
          {status && (
            <Badge variant={status.variant || "outline"} className="text-xs shrink-0">
              {status.label}
            </Badge>
          )}
          {onClick && !status && (
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </div>

        {/* Progress Bars */}
        {progress && progress.length > 0 && (
          <div className="space-y-2">
            {progress.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value.toFixed(0)}%</span>
                </div>
                <Progress 
                  value={item.value} 
                  className="h-1.5"
                />
              </div>
            ))}
          </div>
        )}

        {/* Metadata */}
        {metadata && metadata.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {metadata.map((item, index) => (
              <div key={index} className="flex items-center gap-1 text-xs">
                {item.icon && <item.icon className="h-3 w-3 text-muted-foreground" />}
                <span className="text-muted-foreground">{item.label}:</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="flex items-center justify-end gap-1 pt-1 border-t">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "ghost"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                disabled={action.disabled}
                className="h-8 px-2"
              >
                <action.icon className="h-4 w-4" />
                {action.label && <span className="ml-1 text-xs">{action.label}</span>}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
