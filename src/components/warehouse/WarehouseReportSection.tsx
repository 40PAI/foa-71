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
  BarChart3
} from "lucide-react";
import { useWarehouseReport, PeriodType, getPeriodDates } from "@/hooks/useWarehouseReport";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  entrada: "Entrada",
  saida: "Saída",
  consumo: "Consumo",
  devolucao: "Devolução",
  transferencia_entrada: "Transferência (Entrada)",
  transferencia_saida: "Transferência (Saída)",
};

export function WarehouseReportSection() {
  const [periodType, setPeriodType] = useState<PeriodType>("month");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const startStr = format(start, "yyyy-MM-dd");
      const endStr = format(end, "yyyy-MM-dd");

      // Fetch detailed movements for export
      const { data: movements, error } = await supabase
        .from("materiais_movimentacoes")
        .select(`
          *,
          materiais_armazem!fk_material_movimentacoes_material(id, nome_material, codigo_interno, unidade_medida)
        `)
        .gte("data_movimentacao", startStr)
        .lte("data_movimentacao", endStr)
        .order("data_movimentacao", { ascending: true });

      if (error) throw error;

      // Fetch project names for the movements
      const projectIds = new Set<number>();
      movements?.forEach((mov: any) => {
        if (mov.projeto_origem_id) projectIds.add(mov.projeto_origem_id);
        if (mov.projeto_destino_id) projectIds.add(mov.projeto_destino_id);
      });

      const { data: projects } = await supabase
        .from("projetos")
        .select("id, nome")
        .in("id", Array.from(projectIds));

      const projectMap = new Map(projects?.map(p => [p.id, p.nome]) || []);

      if (error) throw error;

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Resumo por Material
      const resumoRows = data?.por_material?.map((m) => ({
        "Material": m.material_nome,
        "Código": m.material_codigo,
        "Unidade": m.unidade,
        "Entradas": m.entradas,
        "Saídas": m.saidas,
        "Consumos": m.consumos,
        "Devoluções": m.devolucoes,
        "Saldo": m.saldo,
      })) || [];

      const resumoSheet = XLSX.utils.json_to_sheet(resumoRows);
      XLSX.utils.book_append_sheet(workbook, resumoSheet, "Resumo por Material");

      // Sheet 2: Movimentações Detalhadas
      const detailRows = movements?.map((mov: any) => ({
        "Data": format(new Date(mov.data_movimentacao), "dd/MM/yyyy"),
        "Tipo": MOVEMENT_TYPE_LABELS[mov.tipo_movimentacao] || mov.tipo_movimentacao,
        "Material": mov.materiais_armazem?.nome_material || "-",
        "Código": mov.materiais_armazem?.codigo_interno || "-",
        "Quantidade": mov.quantidade,
        "Unidade": mov.materiais_armazem?.unidade_medida || "-",
        "Projecto Origem": mov.projeto_origem_id ? (projectMap.get(mov.projeto_origem_id) || "-") : "-",
        "Projecto Destino": mov.projeto_destino_id ? (projectMap.get(mov.projeto_destino_id) || "-") : "-",
        "Responsável": mov.responsavel || "-",
        "Documento": mov.documento_referencia || "-",
        "Observações": mov.observacoes || "-",
      })) || [];

      const detailSheet = XLSX.utils.json_to_sheet(detailRows);
      XLSX.utils.book_append_sheet(workbook, detailSheet, "Movimentações Detalhadas");

      // Generate filename based on period
      let fileName = "relatorio_armazem_";
      switch (periodType) {
        case "week":
          fileName += `semana_${format(start, "dd-MM-yyyy")}`;
          break;
        case "month":
          fileName += format(start, "MMMM_yyyy", { locale: pt });
          break;
        case "quarter":
          fileName += `trimestre_${Math.ceil((start.getMonth() + 1) / 3)}_${start.getFullYear()}`;
          break;
        case "semester":
          fileName += `semestre_${start.getMonth() < 6 ? "1" : "2"}_${start.getFullYear()}`;
          break;
        case "custom":
          fileName += `${format(start, "dd-MM-yyyy")}_a_${format(end, "dd-MM-yyyy")}`;
          break;
      }
      fileName += ".xlsx";

      // Download file
      XLSX.writeFile(workbook, fileName);
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast.error("Erro ao exportar relatório");
    } finally {
      setIsExporting(false);
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={handleExport}
                  disabled={isExporting || !data?.por_material?.length}
                >
                  <Download className="h-4 w-4" />
                  {isExporting ? "A exportar..." : "Exportar"}
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
