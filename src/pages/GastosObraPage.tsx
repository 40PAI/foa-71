import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { useProjectState } from "@/hooks/useContextHooks";
import { GastosObraKPICards } from "@/components/financial/GastosObraKPICards";
import { useGastosObraSummary } from "@/hooks/useGastosObra";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as XLSX from "xlsx";
import { formatCurrency } from "@/utils/currency";
import { useProjects } from "@/hooks/useProjects";
import { useGastosObra } from "@/hooks/useGastosObra";
import { format } from "date-fns";

export default function GastosObraPage() {
  const { selectedProjectId } = useProjectState();

  if (!selectedProjectId) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-muted-foreground">
          Selecione um projeto para visualizar os gastos da obra
        </div>
      </div>
    );
  }

  return <GastosObraContent projectId={selectedProjectId} />;
}

function GastosObraContent({ projectId }: { projectId: number }) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [filterType, setFilterType] = useState<"all" | "month">("month");

  const { data: projects } = useProjects();
  const currentProject = projects?.find(p => p.id === projectId);

  const { data: gastos } = useGastosObra(projectId);
  const { data: summary, isLoading: summaryLoading } = useGastosObraSummary(
    projectId,
    filterType === "month" ? selectedMonth : undefined,
    filterType === "month" ? selectedYear : undefined
  );

  const filteredGastos = filterType === "all" 
    ? gastos || []
    : gastos?.filter((gasto) => {
        const gastoDate = new Date(gasto.data_movimento);
        return gastoDate.getMonth() + 1 === selectedMonth && gastoDate.getFullYear() === selectedYear;
      }) || [];

  const handleExport = () => {
    if (!filteredGastos.length) return;

    let accumulatedBalance = 0;
    const exportData = filteredGastos.map((gasto) => {
      const movimento = gasto.recebimento_foa + gasto.fof_financiamento + gasto.foa_auto - gasto.saida;
      accumulatedBalance += movimento;
      
      return {
        "Data": format(new Date(gasto.data_movimento), "dd/MM/yyyy"),
        "Descrição": gasto.descricao,
        "Recebimento FOA": gasto.recebimento_foa > 0 ? formatCurrency(gasto.recebimento_foa) : "",
        "FOF Financiamento": gasto.fof_financiamento > 0 ? formatCurrency(gasto.fof_financiamento) : "",
        "FOA Auto": gasto.foa_auto > 0 ? formatCurrency(gasto.foa_auto) : "",
        "Saída": gasto.saida > 0 ? formatCurrency(gasto.saida) : "",
        "Saldo Acumulado": formatCurrency(accumulatedBalance),
        "Observações": gasto.observacoes || "",
        "Centro de Custo Polo": gasto.centro_custo_nome || "",
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Gastos da Obra");
    
    const fileName = filterType === "month" 
      ? `gastos_obra_${selectedMonth}_${selectedYear}.xlsx`
      : `gastos_obra_completo.xlsx`;
    
    XLSX.writeFile(wb, fileName);
  };

  const months = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Gastos da Obra"
          description={`Projeto: ${currentProject?.nome || ''}`}
        />
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" disabled={!filteredGastos.length}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>Selecione o período para visualizar</CardDescription>
            </div>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={filterType} onValueChange={(value: "all" | "month") => setFilterType(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mensal</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filterType === "month" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mês</label>
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) => setSelectedMonth(parseInt(value))}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Ano</label>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {summaryLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[120px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : summary ? (
        <GastosObraKPICards summary={summary} isLoading={summaryLoading} />
      ) : null}

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <CardTitle className="mb-2">Ver Movimentações Completas</CardTitle>
          <CardDescription className="mb-4">
            Para visualizar todas as movimentações financeiras detalhadas, acesse a página de Centros de Custo
          </CardDescription>
          <Button onClick={() => window.location.href = '/centros-custo'}>
            Ir para Centros de Custo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
