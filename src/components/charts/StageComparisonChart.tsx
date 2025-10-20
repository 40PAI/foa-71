import { GroupedBarChart } from './GroupedBarChart';
import { useStageComparison } from '@/hooks/useStageComparison';
import { formatCurrency } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useSonnerToast } from '@/hooks/use-sonner-toast';

interface StageComparisonChartProps {
  projectId: number | null;
}

export function StageComparisonChart({ projectId }: StageComparisonChartProps) {
  const { data, isLoading } = useStageComparison(projectId);
  const toast = useSonnerToast();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Custos por Etapa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(stage => ({
    etapa: stage.etapa_nome,
    orcado: stage.custo_orcado,
    real: stage.custo_real,
    status: stage.status_orcamento
  }));

  const handleExport = () => {
    const csvContent = [
      ['Etapa', 'Orçado', 'Real', 'Desvio', 'Desvio %'].join(','),
      ...data.map(s => [
        s.etapa_nome,
        s.custo_orcado,
        s.custo_real,
        s.desvio_orcamentario,
        s.desvio_percentual.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise-custos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success('Dados exportados com sucesso');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critico': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'atencao': return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return <CheckCircle2 className="h-4 w-4 text-success" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critico': return <Badge variant="destructive">Crítico</Badge>;
      case 'atencao': return <Badge variant="outline" className="border-warning text-warning">Atenção</Badge>;
      default: return <Badge variant="outline" className="border-success text-success">Normal</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <GroupedBarChart
        data={chartData}
        title="Entrada da Obra: Custos Orçados vs Custos Reais"
        description="Comparação entre valores planejados e executados por etapa"
        dataKeys={[
          { key: 'orcado', name: 'Orçado', color: 'hsl(var(--primary))' },
          { key: 'real', name: 'Real', color: 'hsl(var(--chart-2))' }
        ]}
        xAxisKey="etapa"
        formatValue={formatCurrency}
        onExport={handleExport}
        height={400}
      />

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Etapa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((stage, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(stage.status_orcamento)}
                  <div>
                    <p className="font-semibold">{stage.etapa_nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {stage.percentual_custo_total.toFixed(1)}% do custo total
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Orçado</p>
                    <p className="font-semibold">{formatCurrency(stage.custo_orcado)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Real</p>
                    <p className="font-semibold">{formatCurrency(stage.custo_real)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Desvio</p>
                    <p className={`font-semibold ${stage.desvio_orcamentario > 0 ? 'text-destructive' : 'text-success'}`}>
                      {stage.desvio_percentual > 0 ? '+' : ''}{stage.desvio_percentual.toFixed(1)}%
                    </p>
                  </div>
                  {getStatusBadge(stage.status_orcamento)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
