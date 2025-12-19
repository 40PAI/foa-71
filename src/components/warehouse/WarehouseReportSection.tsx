import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Download, 
  PackagePlus, 
  PackageMinus, 
  Hammer, 
  RotateCcw,
  TrendingUp,
  TrendingDown,
  BarChart3
} from "lucide-react";
import { useWarehouseReport, PeriodType, getPeriodDates } from "@/hooks/useWarehouseReport";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function WarehouseReportSection() {
  const [periodType, setPeriodType] = useState<PeriodType>("month");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  const { start, end } = getPeriodDates(
    periodType, 
    customStart ? new Date(customStart) : undefined,
    customEnd ? new Date(customEnd) : undefined
  );

  const { data, isLoading } = useWarehouseReport(
    periodType,
    customStart ? new Date(customStart) : undefined,
    customEnd ? new Date(customEnd) : undefined
  );

  const getPeriodLabel = () => {
    switch (periodType) {
      case "week": return "Esta Semana";
      case "month": return format(new Date(), "MMMM yyyy", { locale: pt });
      case "quarter": return `${Math.ceil((new Date().getMonth() + 1) / 3)}º Trimestre ${new Date().getFullYear()}`;
      case "semester": return `${new Date().getMonth() < 6 ? "1º" : "2º"} Semestre ${new Date().getFullYear()}`;
      case "custom": return data?.periodo?.label || "Personalizado";
      default: return "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Period Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Filtro de Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Período</Label>
              <Select value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mês</SelectItem>
                  <SelectItem value="quarter">Trimestre</SelectItem>
                  <SelectItem value="semester">Semestre</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {periodType === "custom" && (
              <>
                <div className="space-y-1">
                  <Label className="text-xs">De</Label>
                  <Input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-36"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Até</Label>
                  <Input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-36"
                  />
                </div>
              </>
            )}

            <Badge variant="outline" className="h-9 px-3">
              {getPeriodLabel()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <>
          {/* Summary KPIs - Always show */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <PackagePlus className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Entradas</p>
                  <p className="text-xl font-bold text-green-600">+{data?.resumo?.entradas_quantidade || 0}</p>
                  <p className="text-xs text-muted-foreground">{data?.resumo?.entradas || 0} movim.</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <PackageMinus className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Saídas</p>
                  <p className="text-xl font-bold text-orange-600">-{data?.resumo?.saidas_quantidade || 0}</p>
                  <p className="text-xs text-muted-foreground">{data?.resumo?.saidas || 0} movim.</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <Hammer className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Consumos</p>
                  <p className="text-xl font-bold text-red-600">-{data?.resumo?.consumos_quantidade || 0}</p>
                  <p className="text-xs text-muted-foreground">{data?.resumo?.consumos || 0} movim.</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <RotateCcw className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Devoluções</p>
                  <p className="text-xl font-bold text-blue-600">+{data?.resumo?.devolucoes_quantidade || 0}</p>
                  <p className="text-xs text-muted-foreground">{data?.resumo?.devolucoes || 0} movim.</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Chart - Only show if there's data */}
          {data?.serie_temporal && data.serie_temporal.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5" />
                  Movimentação no Período
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.serie_temporal}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="periodo" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="entradas" name="Entradas" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="saidas" name="Saídas" fill="hsl(24, 95%, 53%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="devolucoes" name="Devoluções" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Material Breakdown Table */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Detalhamento por Material</CardTitle>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!data?.por_material || data.por_material.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Sem movimentações no período seleccionado
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Material</th>
                        <th className="text-right py-2 px-2 text-green-600">Entradas</th>
                        <th className="text-right py-2 px-2 text-orange-600">Saídas</th>
                        <th className="text-right py-2 px-2 text-red-600">Consumos</th>
                        <th className="text-right py-2 px-2 text-blue-600">Devoluções</th>
                        <th className="text-right py-2 px-2">Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.por_material.map((m) => (
                        <tr key={m.material_id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-2">
                            <div>
                              <p className="font-medium">{m.material_nome}</p>
                              <p className="text-xs text-muted-foreground">{m.material_codigo}</p>
                            </div>
                          </td>
                          <td className="text-right py-2 px-2 text-green-600">
                            {m.entradas > 0 ? `+${m.entradas}` : "-"}
                          </td>
                          <td className="text-right py-2 px-2 text-orange-600">
                            {m.saidas > 0 ? `-${m.saidas}` : "-"}
                          </td>
                          <td className="text-right py-2 px-2 text-red-600">
                            {m.consumos > 0 ? `-${m.consumos}` : "-"}
                          </td>
                          <td className="text-right py-2 px-2 text-blue-600">
                            {m.devolucoes > 0 ? `+${m.devolucoes}` : "-"}
                          </td>
                          <td className="text-right py-2 px-2 font-semibold">
                            <span className={m.saldo >= 0 ? "text-green-600" : "text-red-600"}>
                              {m.saldo >= 0 ? `+${m.saldo}` : m.saldo} {m.unidade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
