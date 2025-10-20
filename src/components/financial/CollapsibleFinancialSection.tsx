import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface CollapsibleFinancialSectionProps {
  value: string;
  title: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  children: ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleFinancialSection({
  value,
  title,
  icon: Icon,
  badge,
  children,
}: CollapsibleFinancialSectionProps) {
  return (
    <AccordionItem value={value} className="border rounded-lg">
      <Card className="border-0 shadow-sm">
        <AccordionTrigger className="px-6 py-4 hover:no-underline">
          <div className="flex items-center gap-3 flex-1">
            <Icon className="h-5 w-5 text-primary shrink-0" />
            <span className="text-base font-semibold">{title}</span>
            {badge && (
              <Badge variant={badge.variant || "secondary"} className="ml-auto mr-2">
                {badge.text}
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 pt-2">
          {children}
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
}
