import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTaskFinancialSummary } from "@/hooks/useTaskFinancialSummary";
import { formatCurrency } from "@/utils/formatters";
import { Package, Users, Calculator, TrendingUp } from "lucide-react";

interface TaskFinancialBreakdownProps {
  projectId: number;
}

export function TaskFinancialBreakdown({ projectId }: TaskFinancialBreakdownProps) {
  const { data, isLoading } = useTaskFinancialSummary(projectId);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando análise financeira...</p>
        </div>
      </div>
    );
  }
  
  if (!data || data.stages.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma Tarefa com Custos</h3>
          <p className="text-muted-foreground">
            Não há tarefas com custos registrados ainda. Crie tarefas e preencha os campos de custos para ver a análise financeira.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Cards de Totais Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Subtotal Material</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(data.totals.subtotal_material)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Soma de todas as tarefas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Subtotal Mão de Obra</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.totals.subtotal_mao_obra)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Soma de todas as tarefas
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">TOTAL</CardTitle>
            <Calculator className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(data.totals.total)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Material + Mão de Obra
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Breakdown por Etapa */}
      <Card>
        <CardHeader>
          <CardTitle>Custos por Etapa</CardTitle>
          <p className="text-sm text-muted-foreground">
            Detalhamento dos custos agregados por etapa do projeto
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.stages.map((etapa) => (
              <div key={etapa.etapa_id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{etapa.etapa_nome}</h4>
                    <Badge variant="secondary" className="mt-1">
                      {etapa.quantidade_tarefas} tarefa(s)
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total Etapa</p>
                    <p className="text-xl font-bold text-primary">
                      {formatCurrency(etapa.total)}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-3 mt-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Material</p>
                        <p className="font-semibold text-blue-600 truncate" title={formatCurrency(etapa.subtotal_material)}>
                          {formatCurrency(etapa.subtotal_material)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Mão de Obra</p>
                        <p className="font-semibold text-green-600 truncate" title={formatCurrency(etapa.subtotal_mao_obra)}>
                          {formatCurrency(etapa.subtotal_mao_obra)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
