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

export function DetailedBreakdown({ breakdown, className }: DetailedBreakdownProps) {
  const { selectedProjectId } = useProjectContext();
  const { data: taskSummary } = useTaskFinancialSummary(selectedProjectId);

  if (breakdown.length === 0) return null;

  // Map task costs to financial categories
  const taskCosts = {
    "Materiais": taskSummary?.totals.subtotal_material || 0,
    "Mão de Obra": taskSummary?.totals.subtotal_mao_obra || 0,
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Análise Comparativa: Calculado vs Manual vs Tarefas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {breakdown.map((item, index) => {
            const taskCost = taskCosts[item.categoria as keyof typeof taskCosts] || 0;
            const hasTaskData = taskCost > 0;
            
            return (
              <div key={index} className="space-y-3 border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{item.categoria}</h4>
                  <span className={`text-sm font-medium ${
                    Math.abs(item.discrepancia) > 0 ? 'text-warning' : 'text-success'
                  }`}>
                    {Math.abs(item.discrepancia) > 0 ? '⚠️ ' : '✓ '}
                    Discrepância: {formatCurrency(Math.abs(item.discrepancia))}
                  </span>
                </div>
                
                <div className={`grid gap-3 text-sm ${hasTaskData ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  <div>
                    <span className="text-muted-foreground">Calculado: </span>
                    <span className="font-medium">{formatCurrency(item.valor_calculado)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Manual: </span>
                    <span className="font-medium">{formatCurrency(item.valor_manual)}</span>
                  </div>
                  {hasTaskData && (
                    <div>
                      <span className="text-muted-foreground">Planejado: </span>
                      <span className="font-medium text-primary">{formatCurrency(taskCost)}</span>
                    </div>
                  )}
                </div>

                {hasTaskData && (
                  <div className="text-xs text-muted-foreground">
                    <span>Desvio Tarefas vs Real: </span>
                    <span className={taskCost > item.valor_calculado ? 'text-warning' : 'text-success'}>
                      {formatCurrency(Math.abs(taskCost - item.valor_calculado))}
                      {' '}({taskCost > 0 ? ((Math.abs(taskCost - item.valor_calculado) / taskCost) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">% do Orçamento</span>
                    <span className="font-medium">{item.percentual_orcamento.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(item.percentual_orcamento, 100)} className="h-2" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}