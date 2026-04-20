import { useState } from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface InfoTooltipContent {
  title?: string;
  description: string;
  formula?: string;
}

interface InfoTooltipProps extends InfoTooltipContent {
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
  iconClassName?: string;
}

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

function TooltipBody({ title, description, formula }: InfoTooltipContent) {
  return (
    <div className="space-y-2 max-w-xs">
      {title && <p className="font-semibold text-sm">{title}</p>}
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      {formula && (
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
            Fórmula
          </p>
          <code className="block text-[11px] font-mono bg-muted/50 rounded px-2 py-1 leading-relaxed break-words whitespace-pre-wrap">
            {formula}
          </code>
        </div>
      )}
    </div>
  );
}

export function InfoTooltip({
  title,
  description,
  formula,
  side = "left",
  align = "start",
  className,
  iconClassName,
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const touch = isTouchDevice();

  const trigger = (
    <button
      type="button"
      aria-label="Mais informações"
      onClick={(e) => {
        e.stopPropagation();
        if (touch) setOpen((v) => !v);
      }}
      className={cn(
        "inline-flex items-center justify-center h-5 w-5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors shrink-0",
        className
      )}
    >
      <Info className={cn("h-3.5 w-3.5", iconClassName)} />
    </button>
  );

  if (touch) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent side={side} align={align} className="w-72 p-3">
          <TooltipBody title={title} description={description} formula={formula} />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent side={side} align={align} className="p-3 max-w-xs">
          <TooltipBody title={title} description={description} formula={formula} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
