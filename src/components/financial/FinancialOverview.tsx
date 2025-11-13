import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wallet, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import type { BaseComponentProps } from "@/types";

interface FinancialData {
  total_budget: number;
  total_expenses: number;
  financial_progress: number;
}

interface FinancialOverviewProps extends BaseComponentProps {
  data: FinancialData;
  hasDiscrepancies?: boolean;
}

export const FinancialOverview = memo(function FinancialOverview({
  data, 
  hasDiscrepancies = false,
  className 
}: FinancialOverviewProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Visão Geral Financeira Integrada
          {hasDiscrepancies && (
            <Badge variant="destructive" className="ml-2">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Discrepâncias
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Orçamento Total</p>
            <p className="text-2xl font-bold">{formatCurrency(data.total_budget)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Executado</p>
            <p className="text-2xl font-bold">{formatCurrency(data.total_expenses)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Avanço Financeiro</p>
            <div className="flex items-center gap-2">
              <Progress 
                value={Math.min(data.financial_progress, 100)} 
                variant="financial"
                className="flex-1"
              />
              <span className={`font-bold ${
                data.financial_progress > 100 ? 'text-red-600' :
                data.financial_progress > 80 ? 'text-orange-600' :
                'text-green-600'
              }`}>
                {(data.financial_progress ?? 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});