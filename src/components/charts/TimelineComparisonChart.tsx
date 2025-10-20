import { GroupedBarChart } from './GroupedBarChart';
import { useStageComparison } from '@/hooks/useStageComparison';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { useSonnerToast } from '@/hooks/use-sonner-toast';

interface TimelineComparisonChartProps {
  projectId: number | null;
}

export function TimelineComparisonChart({ projectId }: TimelineComparisonChartProps) {
  const { data, isLoading } = useStageComparison(projectId);
  const toast = useSonnerToast();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Prazos por Etapa</CardTitle>
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
    previsto: stage.dias_previstos,
    executado: stage.dias_executados,
    status: stage.status_prazo
  }));

  const handleExport = () => {
    const csvContent = [
      ['Etapa', 'Dias Previstos', 'Dias Executados', 'Eficiência %'].join(','),
      ...data.map(s => [
        s.etapa_nome,
        s.dias_previstos,
        s.dias_executados,
        s.eficiencia_temporal.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise-prazos-${new Date().toISOString().split('T')[0]}.csv`;
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
      case 'critico': return <Badge variant="destructive">Atrasado</Badge>;
      case 'atencao': return <Badge variant="outline" className="border-warning text-warning">Atenção</Badge>;
      default: return <Badge variant="outline" className="border-success text-success">No Prazo</Badge>;
    }
  };

  const formatDays = (days: number) => `${days} dias`;

  return (
    <div className="space-y-6">
      <GroupedBarChart
        data={chartData}
        title="Previsão de Etapas: Dias Previstos vs Dias Executados"
        description="Comparação temporal entre planejamento e execução"
        dataKeys={[
          { key: 'previsto', name: 'Previsto', color: 'hsl(var(--primary))' },
          { key: 'executado', name: 'Executado', color: 'hsl(var(--chart-3))' }
        ]}
        xAxisKey="etapa"
        formatValue={formatDays}
        onExport={handleExport}
        height={400}
      />

      <Card>
        <CardHeader>
          <CardTitle>Eficiência Temporal por Etapa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((stage, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(stage.status_prazo)}
                  <div>
                    <p className="font-semibold">{stage.etapa_nome}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        Eficiência: {stage.eficiencia_temporal.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Previsto</p>
                    <p className="font-semibold">{stage.dias_previstos} dias</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Executado</p>
                    <p className="font-semibold">{stage.dias_executados} dias</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Diferença</p>
                    <p className={`font-semibold ${stage.dias_executados > stage.dias_previstos ? 'text-destructive' : 'text-success'}`}>
                      {stage.dias_executados > stage.dias_previstos ? '+' : ''}
                      {stage.dias_executados - stage.dias_previstos} dias
                    </p>
                  </div>
                  {getStatusBadge(stage.status_prazo)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
