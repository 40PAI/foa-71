import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import type { BaseComponentProps } from "@/types";
import { useTaskFinancialSummary } from "@/hooks/useTaskFinancialSummary";
import { useProjectContext } from "@/contexts/ProjectContext";
interface BreakdownItem {
  categoria: string;
  valor_calculado: number;
  valor_manual: number;
  discrepancia: number;
  percentual_orcamento: number;
}
interface DetailedBreakdownProps extends BaseComponentProps {
  breakdown: BreakdownItem[];
}
export function DetailedBreakdown({
  breakdown,
  className
}: DetailedBreakdownProps) {
  const {
    selectedProjectId
  } = useProjectContext();
  const {
    data: taskSummary
  } = useTaskFinancialSummary(selectedProjectId);
  if (breakdown.length === 0) return null;

  // Map task costs to financial categories
  const taskCosts = {
    "Materiais": taskSummary?.totals.subtotal_material || 0,
    "Mão de Obra": taskSummary?.totals.subtotal_mao_obra || 0
  };
  return <Card className={className}>
      
      
    </Card>;
}