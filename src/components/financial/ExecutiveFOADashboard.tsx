import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useResumoFOAGeral } from "@/hooks/useResumoFOA";
import { formatCurrency } from "@/utils/currency";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export function ExecutiveFOADashboard() {
  const { data: resumo, isLoading } = useResumoFOAGeral();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!resumo) return null;

  const isDivida = resumo.divida_foa_com_fof > 0;
  const isDividaAlta = resumo.divida_foa_com_fof > 100000000; // > 100M

  const chartData = [
    { name: "FOF Financiamento", value: resumo.fof_financiamento, fill: "hsl(var(--chart-1))" },
    { name: "Amortização", value: resumo.amortizacao, fill: "hsl(var(--chart-2))" },
    { name: "Dívida", value: resumo.divida_foa_com_fof, fill: "hsl(var(--chart-3))" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* FOF Financiamento */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FOF Financiamento</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(resumo.fof_financiamento)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total recebido do FOF
            </p>
          </CardContent>
        </Card>

        {/* Amortização */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amortização</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(resumo.amortizacao)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total amortizado
            </p>
          </CardContent>
        </Card>

        {/* Percentual de Amortização */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Amortização</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resumo.fof_financiamento > 0 
                ? `${((resumo.amortizacao / resumo.fof_financiamento) * 100).toFixed(1)}%`
                : '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Do financiamento FOF
            </p>
          </CardContent>
        </Card>

        {/* Dívida FOA com FOF */}
        <Card className={isDividaAlta ? "border-destructive" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isDivida ? "Dívida FOA ↔ FOF" : "Saldo FOA ↔ FOF"}
            </CardTitle>
            {isDivida ? (
              <TrendingDown className="h-4 w-4 text-destructive" />
            ) : (
              <TrendingUp className="h-4 w-4 text-green-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDivida ? "text-destructive" : "text-green-600"}`}>
              {formatCurrency(Math.abs(resumo.divida_foa_com_fof))}
            </div>
            <p className="text-xs text-muted-foreground">
              {isDivida ? "A reembolsar" : "Saldo positivo"}
            </p>
          </CardContent>
        </Card>
      </div>

      {isDividaAlta && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Atenção: A dívida da FOA com o FOF ultrapassou 100 milhões de Kz. 
            Recomenda-se aumento da amortização.
          </AlertDescription>
        </Alert>
      )}

      {/* Gráfico de Distribuição */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição Financeira</CardTitle>
          <CardDescription>
            Visualização dos valores principais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
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
    </div>
  );
}
