import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useStageComparison } from '@/hooks/useStageComparison';
import { formatCurrency } from '@/utils/formatters';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSonnerToast } from '@/hooks/use-sonner-toast';

interface StageCostsPieChartProps {
  projectId: number | null;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))'
];

export function StageCostsPieChart({ projectId }: StageCostsPieChartProps) {
  const { data, isLoading, totals } = useStageComparison(projectId);
  const toast = useSonnerToast();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custos por Etapa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pieData = data.map((stage, index) => ({
    name: stage.etapa_nome,
    value: stage.custo_orcado,
    percentage: stage.percentual_custo_total,
    real: stage.custo_real,
    color: COLORS[index % COLORS.length]
  }));

  const handleExport = () => {
    const csvContent = [
      ['Etapa', 'Custo Orçado', 'Custo Real', '% do Total'].join(','),
      ...data.map(s => [
        s.etapa_nome,
        s.custo_orcado,
        s.custo_real,
        s.percentual_custo_total.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `distribuicao-custos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success('Dados exportados com sucesso');
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Orçado:</span>
              <span className="font-semibold">{formatCurrency(data.value)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Real:</span>
              <span className="font-semibold">{formatCurrency(data.real)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">% do Total:</span>
              <span className="font-semibold">{data.percentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Custos por Etapa</CardTitle>
            <CardDescription>
              Distribuição percentual dos custos planejados
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={140}
              fill="#8884d8"
              dataKey="value"
              animationDuration={800}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value, entry: any) => (
                <span className="text-sm">
                  {value} ({entry.payload.percentage.toFixed(1)}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        {totals && (
          <div className="mt-6 p-4 bg-accent/50 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Orçado</p>
                <p className="text-lg font-bold">{formatCurrency(totals.total)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Material</p>
                <p className="text-lg font-bold">{formatCurrency(totals.subtotal_material)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Mão de Obra</p>
                <p className="text-lg font-bold">{formatCurrency(totals.subtotal_mao_obra)}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
