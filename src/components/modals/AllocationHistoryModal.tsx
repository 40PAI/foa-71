import React from "react";
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
  Package,
  MapPin,
  ArrowDownToLine,
  ArrowUpFromLine,
  Hammer,
  RotateCcw,
  Calendar,
  User,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useAllocationHistory } from "@/hooks/useAllocationHistory";
import { MaterialConsumptionModal } from "@/components/modals/MaterialConsumptionModal";
import { MaterialReturnModal } from "@/components/modals/MaterialReturnModal";
import { MaterialAllocationWithDetails } from "@/hooks/useMaterialAllocations";

interface AllocationHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialId: string | null;
  projectId: number | null;
  allocation?: MaterialAllocationWithDetails;
}

const MOVEMENT_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  entrada: {
    label: "Entrada no Armazém",
    icon: ArrowDownToLine,
    color: "text-green-600 bg-green-100 dark:bg-green-900/30",
  },
  saida: {
    label: "Saída / Alocação",
    icon: ArrowUpFromLine,
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  },
  consumo: {
    label: "Consumo Registado",
    icon: Hammer,
    color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
  },
  devolucao: {
    label: "Devolução",
    icon: RotateCcw,
    color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
  },
  ajuste_positivo: {
    label: "Ajuste Positivo",
    icon: CheckCircle2,
    color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
  },
  ajuste_negativo: {
    label: "Ajuste Negativo",
    icon: AlertCircle,
    color: "text-red-600 bg-red-100 dark:bg-red-900/30",
  },
};

export function AllocationHistoryModal({
  open,
  onOpenChange,
  materialId,
  projectId,
  allocation,
}: AllocationHistoryModalProps) {
  const { data, isLoading } = useAllocationHistory(materialId, projectId);

  const allocationData = data?.allocation;
  const pendente = allocationData?.quantidade_pendente ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Histórico: {data?.material?.nome || "Carregando..."}
          </DialogTitle>
          {data?.projeto && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Obra: {data.projeto.nome}
            </div>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Cards */}
            {allocationData && (
              <div className="grid grid-cols-4 gap-2">
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Alocado</p>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                      {allocationData.quantidade_alocada}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Consumido</p>
                    <p className="text-lg font-bold text-orange-700 dark:text-orange-400">
                      {allocationData.quantidade_consumida}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Devolvido</p>
                    <p className="text-lg font-bold text-purple-700 dark:text-purple-400">
                      {allocationData.quantidade_devolvida}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Pendente</p>
                    <p className="text-lg font-bold text-primary">
                      {allocationData.quantidade_pendente}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Timeline */}
            <ScrollArea className="h-[350px] pr-4">
              <div className="relative pl-6">
                {/* Vertical line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

                {/* First entry marker */}
                {data?.primeira_entrada && (
                  <div className="relative mb-6">
                    <div className="absolute left-[-18px] w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center border-2 border-green-500">
                      <ArrowDownToLine className="h-3 w-3 text-green-600" />
                    </div>
                    <div className="ml-4 p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                        <Calendar className="h-3 w-3" />
                        {format(
                          new Date(data.primeira_entrada.data),
                          "dd/MM/yyyy",
                          { locale: pt }
                        )}
                      </div>
                      <p className="text-sm font-medium mt-1">
                        Primeira Entrada no Armazém
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Quantidade: {data.primeira_entrada.quantidade}{" "}
                        {data.material?.unidade}
                      </p>
                      {data.primeira_entrada.fornecedor && (
                        <p className="text-xs text-muted-foreground">
                          Ref: {data.primeira_entrada.fornecedor}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Timeline events */}
                {data?.timeline.map((movement, index) => {
                  const config =
                    MOVEMENT_CONFIG[movement.tipo_movimentacao] ||
                    MOVEMENT_CONFIG.entrada;
                  const Icon = config.icon;

                  return (
                    <div key={movement.id} className="relative mb-4">
                      <div
                        className={`absolute left-[-18px] w-6 h-6 rounded-full flex items-center justify-center border-2 ${config.color}`}
                      >
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="ml-4 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">
                              {format(
                                new Date(movement.data_movimentacao),
                                "dd/MM/yyyy",
                                { locale: pt }
                              )}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">
                            Quantidade:{" "}
                            <strong>
                              {movement.quantidade} {data.material?.unidade}
                            </strong>
                          </p>
                          {movement.responsavel && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {movement.responsavel}
                            </p>
                          )}
                          {movement.observacoes && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {movement.observacoes}
                            </p>
                          )}
                          {movement.motivo_devolucao && (
                            <p className="text-xs text-muted-foreground">
                              Motivo: {movement.motivo_devolucao}
                            </p>
                          )}
                          {movement.estado_material && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              Estado: {movement.estado_material}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty state */}
                {data?.timeline.length === 0 && !data?.primeira_entrada && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Sem movimentações registadas</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Action buttons */}
            {allocation && pendente > 0 && (
              <div className="flex gap-2 pt-2 border-t">
                <MaterialConsumptionModal
                  allocation={allocation}
                  trigger={
                    <Button variant="outline" className="flex-1 gap-2">
                      <Hammer className="h-4 w-4" />
                      Registar Consumo
                    </Button>
                  }
                />
                <MaterialReturnModal
                  allocation={allocation}
                  trigger={
                    <Button variant="outline" className="flex-1 gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Registar Devolução
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
