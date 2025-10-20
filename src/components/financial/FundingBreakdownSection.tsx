import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFundingBreakdown } from "@/hooks/useFundingBreakdown";
import { formatCurrency } from "@/utils/currency";
import { Skeleton } from "@/components/ui/skeleton";

interface FundingBreakdownSectionProps {
  projectId: number;
}

const COLORS = {
  REC_FOA: 'hsl(var(--chart-1))',
  FOF_FIN: 'hsl(var(--chart-2))',
  FOA_AUTO: 'hsl(var(--chart-3))',
};

export function FundingBreakdownSection({ projectId }: FundingBreakdownSectionProps) {
  const { data, isLoading } = useFundingBreakdown(projectId);

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Breakdown por Fonte de Financiamento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhum movimento com fonte de financiamento registrado
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    name: item.fonte_label,
    value: item.total_valor,
    fill: COLORS[item.fonte_financiamento],
  }));

  return (
    <div className="space-y-6">
      {/* Gráfico Donut */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Financiamento</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={(entry) => `${entry.name}: ${((entry.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Fonte</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fonte</TableHead>
                <TableHead className="text-right">Total de Movimentos</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-right">% do Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.fonte_financiamento}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[item.fonte_financiamento] }}
                      />
                      {item.fonte_label}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{item.total_movimentos}</TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(item.total_valor)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold">{item.percentual_total?.toFixed(1)}%</span>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">
                  {data.reduce((sum, item) => sum + item.total_movimentos, 0)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(data.reduce((sum, item) => sum + item.total_valor, 0))}
                </TableCell>
                <TableCell className="text-right">100%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
