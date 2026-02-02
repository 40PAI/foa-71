import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown, RefreshCw, Info, Database } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useFinancialAudit, type FinancialDiscrepancy } from "@/hooks/useFinancialAudit";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface DiscrepancyReportProps {
  projectId: number;
}

function getStatusBadge(status: FinancialDiscrepancy['status'], percentual: number) {
  const absPercentual = Math.abs(percentual);
  
  if (status === 'critico') {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        Crítica ({absPercentual.toFixed(1)}%)
      </Badge>
    );
  }
  
  if (status === 'atencao') {
    return (
      <Badge variant="secondary" className="gap-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
        <AlertTriangle className="h-3 w-3" />
        Atenção ({absPercentual.toFixed(1)}%)
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="gap-1 text-green-700 border-green-300 dark:text-green-400">
      <CheckCircle className="h-3 w-3" />
      OK
    </Badge>
  );
}

function getFontesLabel(fontes: string[]) {
  if (!fontes || fontes.length === 0) {
    return "Sem dados";
  }
  
  const labels: Record<string, string> = {
    'movimentos_financeiros': 'Movimentos',
    'requisicoes': 'Requisições',
    'gastos_detalhados': 'Gastos Det.',
  };
  
  return fontes.map(f => labels[f] || f).join(', ');
}

export function DiscrepancyReport({ projectId }: DiscrepancyReportProps) {
  const queryClient = useQueryClient();
  const { data: auditData, isLoading, error, refetch } = useFinancialAudit(projectId);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["financial-audit", projectId] });
    refetch();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Auditoria e Discrepâncias
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Analisando discrepâncias...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Erro na Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-8 gap-4">
          <p className="text-muted-foreground text-center">
            Ocorreu um erro ao analisar as discrepâncias financeiras.
          </p>
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!auditData || auditData.discrepancies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            Auditoria e Discrepâncias
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-8 gap-4">
          <Info className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Sem Dados para Comparar</h3>
            <p className="text-muted-foreground max-w-md">
              Não existem dados financeiros suficientes para realizar a auditoria. 
              Adicione movimentos financeiros ou gastos manuais para ver a comparação.
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { discrepancies, summary, isConsistent } = auditData;
  const hasIssues = discrepancies.some(d => d.status !== 'ok');

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isConsistent ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            )}
            <CardTitle>Auditoria e Discrepâncias</CardTitle>
            {hasIssues && (
              <Badge variant="destructive">
                {discrepancies.filter(d => d.status !== 'ok').length} problemas
              </Badge>
            )}
          </div>
          <Button onClick={handleRefresh} variant="ghost" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>
        <CardDescription className="flex items-center gap-2 mt-2">
          <span>Última verificação: {format(new Date(summary.data_calculo), "dd/MM/yyyy 'às' HH:mm", { locale: pt })}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Compara gastos manuais (tabela Finanças) com gastos calculados automaticamente de Movimentos Financeiros, Requisições aprovadas e Gastos Detalhados.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 p-4 border-b">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Gasto Manual (Finanças)</p>
            <p className="text-lg font-semibold">{formatCurrency(summary.total_manual)}</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Gasto Calculado</p>
            <p className="text-lg font-semibold">{formatCurrency(summary.total_calculado)}</p>
          </div>
          <div className={`text-center p-3 rounded-lg ${
            Math.abs(summary.discrepancia_total) < 1000 
              ? 'bg-green-100 dark:bg-green-900/30' 
              : 'bg-red-100 dark:bg-red-900/30'
          }`}>
            <p className="text-xs text-muted-foreground mb-1">Discrepância Total</p>
            <p className={`text-lg font-semibold ${
              summary.discrepancia_total > 0 ? 'text-red-600' : 
              summary.discrepancia_total < 0 ? 'text-green-600' : ''
            }`}>
              {summary.discrepancia_total >= 0 ? '+' : ''}{formatCurrency(summary.discrepancia_total)}
            </p>
          </div>
        </div>

        {/* Detailed Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Gasto Manual</TableHead>
              <TableHead className="text-right">Gasto Calculado</TableHead>
              <TableHead className="text-right">Discrepância</TableHead>
              <TableHead>Fontes</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discrepancies.map((discrepancy, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{discrepancy.categoria}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(discrepancy.gasto_manual)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(discrepancy.gasto_calculado)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {discrepancy.discrepancia > 0 ? (
                      <TrendingUp className="h-4 w-4 text-red-600" />
                    ) : discrepancy.discrepancia < 0 ? (
                      <TrendingDown className="h-4 w-4 text-green-600" />
                    ) : null}
                    <span className={`font-medium ${
                      discrepancy.discrepancia > 0 ? 'text-red-600' : 
                      discrepancy.discrepancia < 0 ? 'text-green-600' : 'text-muted-foreground'
                    }`}>
                      {discrepancy.discrepancia >= 0 ? '+' : ''}{formatCurrency(discrepancy.discrepancia)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm text-muted-foreground cursor-help">
                          {getFontesLabel(discrepancy.fontes)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Dados agregados de: {discrepancy.fontes.join(', ') || 'Nenhuma fonte'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(discrepancy.status, discrepancy.percentual_discrepancia)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Legend */}
        <div className="p-4 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground">
            <strong>Legenda:</strong> OK = diferença ≤5% | Atenção = diferença 5-10% | Crítica = diferença &gt;10%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            <strong>Discrepância positiva:</strong> Gasto calculado &gt; Gasto manual (possíveis gastos não registados em Finanças)
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Discrepância negativa:</strong> Gasto manual &gt; Gasto calculado (possíveis lançamentos duplicados em Finanças)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
