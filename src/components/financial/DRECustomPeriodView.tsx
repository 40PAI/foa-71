import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDREPorPeriodo } from "@/hooks/useDREPorPeriodo";
import { formatCurrency } from "@/utils/currency";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface DRECustomPeriodViewProps {
  projectId: number;
}

const COLORS = {
  entradas: "hsl(var(--chart-2))",
  saidas: "hsl(var(--chart-1))",
};

export function DRECustomPeriodView({ projectId }: DRECustomPeriodViewProps) {
  const today = new Date().toISOString().split("T")[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [dataInicio, setDataInicio] = useState(firstDayOfMonth);
  const [dataFim, setDataFim] = useState(today);
  const [appliedDates, setAppliedDates] = useState({
    inicio: firstDayOfMonth,
    fim: today,
  });

  const { data: drePeriodo, isLoading } = useDREPorPeriodo(
    projectId,
    appliedDates.inicio,
    appliedDates.fim
  );

  const handleAplicar = () => {
    setAppliedDates({ inicio: dataInicio, fim: dataFim });
  };

  const chartData = drePeriodo
    ? [
        {
          name: "Entradas",
          value: Number(drePeriodo.total_entradas),
          fill: COLORS.entradas,
        },
        {
          name: "Saídas",
          value: Number(drePeriodo.total_saidas),
          fill: COLORS.saidas,
        },
      ]
    : [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Período Customizado</CardTitle>
          <CardDescription>Selecione o período para análise</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data-inicio">Data Início</Label>
              <div className="relative">
                <Input
                  id="data-inicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  max={dataFim}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="data-fim">Data Fim</Label>
              <div className="relative">
                <Input
                  id="data-fim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  min={dataInicio}
                  max={today}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAplicar} className="w-full">
                Aplicar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : drePeriodo ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Entradas</p>
                  <p className="text-2xl font-bold text-chart-2">
                    {formatCurrency(drePeriodo.total_entradas)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Saídas</p>
                  <p className="text-2xl font-bold text-chart-1">
                    {formatCurrency(drePeriodo.total_saidas)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Resultado</p>
                  <p
                    className={`text-2xl font-bold ${
                      drePeriodo.resultado >= 0 ? "text-green-600" : "text-destructive"
                    }`}
                  >
                    {formatCurrency(drePeriodo.resultado)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Entradas e Saídas</CardTitle>
              <CardDescription>
                Período de {new Date(appliedDates.inicio).toLocaleDateString("pt-BR")} até{" "}
                {new Date(appliedDates.fim).toLocaleDateString("pt-BR")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(1)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              Selecione um período e clique em "Aplicar"
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
