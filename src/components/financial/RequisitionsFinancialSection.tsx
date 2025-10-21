import { Card } from "@/components/ui/card";
import { DonutChart } from "@/components/charts/DonutChart";
import { ShoppingCart, CheckCircle, DollarSign, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

interface RequisitionsFinancialSectionProps {
  data: {
    total: number;
    porStatus: Array<{ status: string; quantidade: number; valor: number }>;
    valorTotal: number;
    valorMedio: number;
    taxaAprovacao: number;
  };
}

export function RequisitionsFinancialSection({ data }: RequisitionsFinancialSectionProps) {
  const chartData = data.porStatus.map(item => ({
    name: item.status,
    value: item.quantidade,
  }));

  const aprovadas = data.porStatus
    .filter(r => ['OC Gerada', 'Recepcionado', 'Liquidado'].includes(r.status))
    .reduce((sum, r) => sum + r.quantidade, 0);

  const pendentes = data.total - aprovadas;

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Total Requisições</p>
          </div>
          <p className="text-2xl font-bold mt-2">{data.total}</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <p className="text-sm text-muted-foreground">Aprovadas</p>
          </div>
          <p className="text-2xl font-bold mt-2 text-success">{aprovadas}</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Valor Total</p>
          </div>
          <p className="text-2xl font-bold mt-2">{formatCurrency(data.valorTotal)}</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Taxa Aprovação</p>
          </div>
          <p className="text-2xl font-bold mt-2">{data.taxaAprovacao.toFixed(1)}%</p>
        </Card>
      </div>

      {/* Gráfico de Status */}
      <Card className="p-4">
        <DonutChart 
          data={chartData}
          title="Requisições por Status"
        />
      </Card>

      {/* Tabela detalhada */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Detalhes por Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Status</th>
                <th className="text-right p-2">Quantidade</th>
                <th className="text-right p-2">Valor Total</th>
                <th className="text-right p-2">Valor Médio</th>
              </tr>
            </thead>
            <tbody>
              {data.porStatus.map((item, idx) => (
                <tr key={idx} className="border-b hover:bg-muted/50">
                  <td className="p-2">{item.status}</td>
                  <td className="p-2 text-right font-semibold">{item.quantidade}</td>
                  <td className="p-2 text-right">{formatCurrency(item.valor)}</td>
                  <td className="p-2 text-right">
                    {formatCurrency(item.quantidade > 0 ? item.valor / item.quantidade : 0)}
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
