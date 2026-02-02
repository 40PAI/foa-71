import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MapPin,
  Package,
  Download,
  FileSpreadsheet,
  Calendar,
  ArrowDownToLine,
  Hammer,
  RotateCcw,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  useProjectConsumptionSummary,
  MaterialConsumptionItem,
} from "@/hooks/useProjectConsumptionSummary";
import * as XLSX from "xlsx";

interface ProjectConsumptionGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number | null;
  projectName: string;
  onMaterialClick?: (item: MaterialConsumptionItem) => void;
}

// Mini timeline component
function MiniTimeline({ item }: { item: MaterialConsumptionItem }) {
  const hasMovements = item.movimento_count > 0;
  const hasConsumption = item.quantidade_consumida > 0;
  const hasReturn = item.quantidade_devolvida > 0;

  if (!hasMovements) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  return (
    <div className="flex items-center gap-0.5">
      <div className="w-2 h-2 rounded-full bg-blue-500" title="Alocado" />
      <div className="w-3 h-0.5 bg-border" />
      {hasConsumption && (
        <>
          <div className="w-2 h-2 rounded-full bg-orange-500" title="Consumo" />
          <div className="w-3 h-0.5 bg-border" />
        </>
      )}
      {hasReturn && (
        <>
          <div className="w-2 h-2 rounded-full bg-purple-500" title="Devolução" />
          <div className="w-3 h-0.5 bg-border" />
        </>
      )}
      <div
        className={`w-2 h-2 rounded-full ${
          item.quantidade_pendente > 0 ? "bg-yellow-500" : "bg-green-500"
        }`}
        title={item.quantidade_pendente > 0 ? "Pendente" : "Concluído"}
      />
    </div>
  );
}

export function ProjectConsumptionGuideModal({
  open,
  onOpenChange,
  projectId,
  projectName,
  onMaterialClick,
}: ProjectConsumptionGuideModalProps) {
  const { data, isLoading } = useProjectConsumptionSummary(projectId);

  const handleExportExcel = () => {
    if (!data?.materiais || data.materiais.length === 0) return;

    const exportData = data.materiais.map((m) => ({
      Código: m.material_codigo,
      Material: m.material_nome,
      Unidade: m.material_unidade,
      Etapa: m.etapa_nome || "",
      Alocado: m.quantidade_alocada,
      Consumido: m.quantidade_consumida,
      Devolvido: m.quantidade_devolvida,
      Pendente: m.quantidade_pendente,
      Status: m.status,
      "Primeiro Movimento": m.primeiro_movimento
        ? format(new Date(m.primeiro_movimento), "dd/MM/yyyy")
        : "",
      "Último Movimento": m.ultimo_movimento
        ? format(new Date(m.ultimo_movimento), "dd/MM/yyyy")
        : "",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Guia de Consumo");

    // Add summary row
    const summaryData = [
      {
        Código: "TOTAL",
        Material: "",
        Unidade: "",
        Etapa: "",
        Alocado: data.totais.total_alocado,
        Consumido: data.totais.total_consumido,
        Devolvido: data.totais.total_devolvido,
        Pendente: data.totais.total_pendente,
        Status: "",
        "Primeiro Movimento": "",
        "Último Movimento": "",
      },
    ];
    XLSX.utils.sheet_add_json(ws, summaryData, {
      origin: -1,
      skipHeader: true,
    });

    const fileName = `guia_consumo_${projectName
      .toLowerCase()
      .replace(/\s+/g, "_")}_${format(new Date(), "yyyyMMdd")}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const periodText =
    data?.periodo.inicio && data?.periodo.fim
      ? `${format(new Date(data.periodo.inicio), "dd/MM/yyyy")} - ${format(
          new Date(data.periodo.fim),
          "dd/MM/yyyy"
        )}`
      : "Sem período definido";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Guia de Consumo: {projectName}
          </DialogTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Período: {periodText}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-5 gap-2">
              <Card className="bg-muted/30">
                <CardContent className="p-3 text-center">
                  <Package className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Materiais</p>
                  <p className="text-lg font-bold">
                    {data?.totais.materiais_distintos || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-3 text-center">
                  <ArrowDownToLine className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                  <p className="text-xs text-muted-foreground">Alocado</p>
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                    {data?.totais.total_alocado || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                <CardContent className="p-3 text-center">
                  <Hammer className="h-4 w-4 mx-auto mb-1 text-orange-600" />
                  <p className="text-xs text-muted-foreground">Consumido</p>
                  <p className="text-lg font-bold text-orange-700 dark:text-orange-400">
                    {data?.totais.total_consumido || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-3 text-center">
                  <RotateCcw className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                  <p className="text-xs text-muted-foreground">Devolvido</p>
                  <p className="text-lg font-bold text-purple-700 dark:text-purple-400">
                    {data?.totais.total_devolvido || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-3 text-center">
                  <Clock className="h-4 w-4 mx-auto mb-1 text-yellow-600" />
                  <p className="text-xs text-muted-foreground">Pendente</p>
                  <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                    {data?.totais.total_pendente || 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Materials Table */}
            <ScrollArea className="h-[350px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead className="text-center w-16">Aloc</TableHead>
                    <TableHead className="text-center w-16">Cons</TableHead>
                    <TableHead className="text-center w-16">Dev</TableHead>
                    <TableHead className="text-center w-16">Pend</TableHead>
                    <TableHead className="text-center w-24">Timeline</TableHead>
                    <TableHead className="w-20">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.materiais.map((item) => (
                    <TableRow
                      key={item.allocation_id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onMaterialClick?.(item)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm line-clamp-1">
                            {item.material_nome}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.material_codigo} | {item.material_unidade}
                            {item.etapa_nome && ` | ${item.etapa_nome}`}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {item.quantidade_alocada}
                      </TableCell>
                      <TableCell className="text-center text-orange-600 font-medium">
                        {item.quantidade_consumida}
                      </TableCell>
                      <TableCell className="text-center text-purple-600 font-medium">
                        {item.quantidade_devolvida}
                      </TableCell>
                      <TableCell className="text-center font-bold text-primary">
                        {item.quantidade_pendente}
                      </TableCell>
                      <TableCell className="text-center">
                        <MiniTimeline item={item} />
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            item.status === "consumido"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30"
                              : item.status === "devolvido"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30"
                              : item.status === "parcialmente_consumido"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30"
                          }`}
                        >
                          {item.status === "parcialmente_consumido"
                            ? "Parcial"
                            : item.status === "consumido"
                            ? "Consumido"
                            : item.status === "devolvido"
                            ? "Devolvido"
                            : "Alocado"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data?.materiais.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Sem materiais alocados nesta obra</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>

            {/* Export Button */}
            <div className="flex justify-end pt-2 border-t">
              <Button
                onClick={handleExportExcel}
                disabled={!data?.materiais || data.materiais.length === 0}
                className="gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Exportar Excel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
