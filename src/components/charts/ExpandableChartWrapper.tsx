import { useState, ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExpandableChartWrapperProps {
  title: string;
  children: (isExpanded: boolean) => ReactNode;
  expandedHeight?: string;
}

export function ExpandableChartWrapper({ 
  title, 
  children,
  expandedHeight = "h-[500px]"
}: ExpandableChartWrapperProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {children(false)}
      
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className={expandedHeight}>
            {children(true)}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ExpandButton({ onClick }: { onClick: () => void }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onClick}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Expandir gráfico</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
