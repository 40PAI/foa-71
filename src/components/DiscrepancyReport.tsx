import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown, RefreshCw, Info, PieChart, Target } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useGastosObraSummary } from "@/hooks/useGastosObra";
import { useProjects } from "@/hooks/useProjects";
import { useProjectStages } from "@/hooks/useProjectStages";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface DiscrepancyReportProps {
  projectId: number;
}

interface CategoryAnalysis {
  categoria: string;
  orcamento: number;
  gasto_real: number;
  variacao: number;
  percentual_usado: number;
  status: 'ok' | 'atencao' | 'critico';
}

function getStatusBadge(status: CategoryAnalysis['status'], percentual: number) {
  if (status === 'critico') {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        {percentual > 100 ? 'Excedido' : 'Crítico'}
      </Badge>
    );
  }
  
  if (status === 'atencao') {
    return (
      <Badge variant="secondary" className="gap-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
        <AlertTriangle className="h-3 w-3" />
        Atenção
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

export function DiscrepancyReport({ projectId }: DiscrepancyReportProps) {
  const queryClient = useQueryClient();
  const { data: projects } = useProjects();
  const { data: stages } = useProjectStages(projectId);
  const { data: gastosSummary, isLoading, refetch } = useGastosObraSummary(projectId);

  const project = projects?.find(p => p.id === projectId);
  const orcamentoTotal = project?.orcamento || 0;

  // Calcular análise por etapa
  const stageAnalysis: CategoryAnalysis[] = stages?.map(stage => {
    const orcamento = stage.orcamento_etapa || 0;
    const gasto = stage.gasto_etapa || 0;
    const variacao = gasto - orcamento;
    const percentual = orcamento > 0 ? (gasto / orcamento) * 100 : 0;
    
    let status: 'ok' | 'atencao' | 'critico' = 'ok';
    if (percentual > 100) {
      status = 'critico';
    } else if (percentual > 85) {
      status = 'atencao';
    }

    return {
      categoria: stage.nome_etapa,
      orcamento,
      gasto_real: gasto,
      variacao,
      percentual_usado: percentual,
      status,
    };
  }) || [];

  // Resumo geral
  const totalOrcado = stageAnalysis.reduce((sum, s) => sum + s.orcamento, 0);
  const totalGasto = gastosSummary?.total_custos || 0;
  const saldoDisponivel = gastosSummary?.saldo_atual || 0;
  const percentualUsado = orcamentoTotal > 0 ? (totalGasto / orcamentoTotal) * 100 : 0;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["gastos-obra-summary", projectId] });
    queryClient.invalidateQueries({ queryKey: ["project-stages", projectId] });
    refetch();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Análise Orçamentária
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">A analisar orçamento...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-muted-foreground" />
            Análise Orçamentária
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-8 gap-4">
          <Info className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Projecto Não Encontrado</h3>
            <p className="text-muted-foreground">
              Seleccione um projecto para ver a análise orçamentária.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasIssues = stageAnalysis.some(s => s.status !== 'ok');

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!hasIssues ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            )}
            <CardTitle>Análise Orçamentária</CardTitle>
            {hasIssues && (
              <Badge variant="destructive">
                {stageAnalysis.filter(s => s.status !== 'ok').length} alertas
              </Badge>
            )}
          </div>
          <Button onClick={handleRefresh} variant="ghost" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>
        <CardDescription className="flex items-center gap-2 mt-2">
          <span>Comparação: Orçamento vs Gasto Real</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Analisa o consumo do orçamento por etapa do projecto, identificando desvios e alertas quando o gasto se aproxima ou excede o orçamentado.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-b">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Orçamento Total</p>
            <p className="text-lg font-semibold">{formatCurrency(orcamentoTotal)}</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Gasto Total</p>
            <p className="text-lg font-semibold">{formatCurrency(totalGasto)}</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Saldo Disponível</p>
            <p className={`text-lg font-semibold ${saldoDisponivel >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(saldoDisponivel)}
            </p>
          </div>
          <div className={`text-center p-3 rounded-lg ${
            percentualUsado <= 85 
              ? 'bg-green-100 dark:bg-green-900/30' 
              : percentualUsado <= 100 
                ? 'bg-orange-100 dark:bg-orange-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
          }`}>
            <p className="text-xs text-muted-foreground mb-1">% Utilizado</p>
            <p className={`text-lg font-semibold ${
              percentualUsado <= 85 ? 'text-green-600' : 
              percentualUsado <= 100 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {percentualUsado.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Progress Bar Geral */}
        <div className="p-4 border-b space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Consumo do Orçamento</span>
            <span className="font-medium">{percentualUsado.toFixed(1)}%</span>
          </div>
          <Progress 
            value={Math.min(percentualUsado, 100)} 
            className={`h-3 ${percentualUsado > 100 ? '[&>div]:bg-red-500' : percentualUsado > 85 ? '[&>div]:bg-orange-500' : ''}`}
          />
        </div>

        {/* Detailed Analysis by Stage */}
        {stageAnalysis.length > 0 ? (
          <div className="divide-y">
            {stageAnalysis.map((stage, index) => (
              <div key={index} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{stage.categoria}</span>
                  {getStatusBadge(stage.status, stage.percentual_usado)}
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                  <div>
                    <span className="text-muted-foreground">Orçamento:</span>
                    <span className="ml-2 font-medium">{formatCurrency(stage.orcamento)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gasto:</span>
                    <span className="ml-2 font-medium">{formatCurrency(stage.gasto_real)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Variação:</span>
                    {stage.variacao > 0 ? (
                      <TrendingUp className="h-4 w-4 text-red-600" />
                    ) : stage.variacao < 0 ? (
                      <TrendingDown className="h-4 w-4 text-green-600" />
                    ) : null}
                    <span className={`font-medium ${
                      stage.variacao > 0 ? 'text-red-600' : 
                      stage.variacao < 0 ? 'text-green-600' : 'text-muted-foreground'
                    }`}>
                      {stage.variacao >= 0 ? '+' : ''}{formatCurrency(stage.variacao)}
                    </span>
                  </div>
                </div>
                <Progress 
                  value={Math.min(stage.percentual_usado, 100)} 
                  className={`h-2 ${stage.percentual_usado > 100 ? '[&>div]:bg-red-500' : stage.percentual_usado > 85 ? '[&>div]:bg-orange-500' : ''}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Não existem etapas definidas para análise orçamentária.
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="p-4 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground">
            <strong>Legenda:</strong> OK = consumo ≤85% | Atenção = consumo 85-100% | Crítico/Excedido = consumo &gt;100%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            <strong>Variação positiva (+):</strong> Gasto acima do orçamentado
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Variação negativa (-):</strong> Gasto abaixo do orçamentado (economia)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
