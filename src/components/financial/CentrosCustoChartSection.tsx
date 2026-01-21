import { Card } from "@/components/ui/card";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { AlertTriangle, AlertCircle, Building2, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { clampPercentage, formatPercentageWithExcess } from "@/lib/helpers";

interface CentrosCustoChartSectionProps {
  data: {
    topCentros: Array<{
      codigo: string;
      nome: string;
      orcamento: number;
      gasto: number;
      utilizacao: number;
      status: 'normal' | 'atencao' | 'critico';
    }>;
    totalCentros: number;
    centrosEmAlerta: number;
    orcamentoTotal: number;
  };
}

export function CentrosCustoChartSection({ data }: CentrosCustoChartSectionProps) {
  const chartData = data.topCentros.map(cc => ({
    name: cc.codigo,
    value: cc.gasto,
    status: cc.status,
  }));

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Total de Centros</p>
          </div>
          <p className="text-2xl font-bold mt-2">{data.totalCentros}</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <p className="text-sm text-muted-foreground">Centros em Alerta</p>
          </div>
          <p className="text-2xl font-bold mt-2 text-warning">{data.centrosEmAlerta}</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Orçamento Total</p>
          </div>
          <p className="text-2xl font-bold mt-2">{formatCurrency(data.orcamentoTotal)}</p>
        </Card>
      </div>

      {/* Alerta de centros críticos */}
      {data.centrosEmAlerta > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {data.centrosEmAlerta} centro(s) de custo com utilização acima de 80% do orçamento
          </AlertDescription>
        </Alert>
      )}

      {/* Gráfico */}
      <Card className="p-4">
        <HorizontalBarChart 
          data={chartData}
          title="Top 5 Centros de Custo por Gasto"
        />
      </Card>

      {/* Tabela detalhada */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Detalhes dos Centros de Custo</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Código</th>
                <th className="text-left p-2">Nome</th>
                <th className="text-right p-2">Orçamento</th>
                <th className="text-right p-2">Gasto</th>
                <th className="text-right p-2">Utilização</th>
              </tr>
            </thead>
            <tbody>
              {data.topCentros.map((cc, idx) => (
                <tr key={idx} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-mono text-sm">{cc.codigo}</td>
                  <td className="p-2">{cc.nome}</td>
                  <td className="p-2 text-right">{formatCurrency(cc.orcamento)}</td>
                  <td className="p-2 text-right">{formatCurrency(cc.gasto)}</td>
                  <td className="p-2 text-right">
                    <span className={`font-semibold flex items-center justify-end gap-1 ${
                      cc.utilizacao >= 100 ? 'text-destructive' :
                      cc.status === 'critico' ? 'text-destructive' :
                      cc.status === 'atencao' ? 'text-warning' :
                      'text-success'
                    }`}>
                      {cc.utilizacao >= 100 && <AlertCircle className="h-3 w-3" />}
                      {formatPercentageWithExcess(cc.utilizacao, 1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
