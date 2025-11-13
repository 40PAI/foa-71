import { Card } from "@/components/ui/card";
import { DonutChart } from "@/components/charts/DonutChart";
import { Layers, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

interface StageFinancialSectionProps {
  data: {
    distribuicao: Array<{
      nome: string;
      valor: number;
      percentual: number;
    }>;
    etapaMaisCustosa: { nome: string; valor: number } | null;
    totalEtapas: number;
  };
}

export function StageFinancialSection({ data }: StageFinancialSectionProps) {
  const chartData = data.distribuicao.map(etapa => ({
    name: etapa.nome,
    value: etapa.valor,
  }));

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Total de Etapas</p>
          </div>
          <p className="text-2xl font-bold mt-2">{data.totalEtapas}</p>
        </Card>
        
        {data.etapaMaisCustosa && (
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Etapa Mais Custosa</p>
            </div>
            <p className="text-lg font-bold mt-2">{data.etapaMaisCustosa.nome}</p>
            <p className="text-sm text-muted-foreground">{formatCurrency(data.etapaMaisCustosa.valor)}</p>
          </Card>
        )}
      </div>

      {/* Gráfico de Pizza */}
      <Card className="p-4">
        <DonutChart 
          data={chartData}
          title="Distribuição de Gastos por Etapa"
        />
      </Card>

      {/* Tabela */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Detalhes por Etapa</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Etapa</th>
                <th className="text-right p-2">Valor</th>
                <th className="text-right p-2">% do Total</th>
              </tr>
            </thead>
            <tbody>
              {data.distribuicao.map((etapa, idx) => (
                <tr key={idx} className="border-b hover:bg-muted/50">
                  <td className="p-2">{etapa.nome}</td>
                  <td className="p-2 text-right font-semibold">{formatCurrency(etapa.valor)}</td>
                  <td className="p-2 text-right">{(etapa.percentual ?? 0).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
