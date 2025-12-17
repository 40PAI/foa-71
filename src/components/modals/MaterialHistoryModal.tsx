import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  History, 
  Package, 
  PackagePlus, 
  PackageMinus, 
  Hammer, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown,
  MapPin,
  Calendar,
  User
} from "lucide-react";
import { useMaterialHistory } from "@/hooks/useMaterialHistory";
import { MaterialConsumptionModal } from "./MaterialConsumptionModal";
import { MaterialReturnModal } from "./MaterialReturnModal";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface MaterialHistoryModalProps {
  materialId: string;
  trigger?: React.ReactNode;
}

const MOVEMENT_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string; bg: string }> = {
  entrada: { icon: PackagePlus, color: "text-green-600", label: "Entrada", bg: "bg-green-100 dark:bg-green-900/30" },
  saida: { icon: PackageMinus, color: "text-orange-600", label: "Saída", bg: "bg-orange-100 dark:bg-orange-900/30" },
  consumo: { icon: Hammer, color: "text-red-600", label: "Consumo", bg: "bg-red-100 dark:bg-red-900/30" },
  devolucao: { icon: RotateCcw, color: "text-blue-600", label: "Devolução", bg: "bg-blue-100 dark:bg-blue-900/30" },
  ajuste_positivo: { icon: TrendingUp, color: "text-emerald-600", label: "Ajuste +", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  ajuste_negativo: { icon: TrendingDown, color: "text-rose-600", label: "Ajuste -", bg: "bg-rose-100 dark:bg-rose-900/30" },
  transferencia: { icon: MapPin, color: "text-purple-600", label: "Transferência", bg: "bg-purple-100 dark:bg-purple-900/30" },
};

export function MaterialHistoryModal({ materialId, trigger }: MaterialHistoryModalProps) {
  const { data, isLoading } = useMaterialHistory(materialId);

  const getMovementConfig = (tipo: string) => {
    return MOVEMENT_CONFIG[tipo] || MOVEMENT_CONFIG.entrada;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-1">
            <History className="h-4 w-4" />
            Histórico
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Histórico Completo do Material
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : data?.material ? (
          <ScrollArea className="h-[65vh] pr-4">
            {/* Material Info */}
            <div className="mb-4 p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg">{data.material.nome_material}</p>
                  <p className="text-sm text-muted-foreground">
                    {data.material.codigo_interno} | {data.material.categoria_principal || "Sem categoria"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{data.material.quantidade_stock}</p>
                  <p className="text-sm text-muted-foreground">{data.material.unidade_medida} em stock</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              <Card className="p-2">
                <div className="flex items-center gap-2">
                  <PackagePlus className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Entradas</p>
                    <p className="font-semibold text-green-600">+{data.resumo.total_entradas}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-2">
                <div className="flex items-center gap-2">
                  <PackageMinus className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Saídas</p>
                    <p className="font-semibold text-orange-600">-{data.resumo.total_saidas}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-2">
                <div className="flex items-center gap-2">
                  <Hammer className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Consumos</p>
                    <p className="font-semibold text-red-600">-{data.resumo.total_consumos}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-2">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Devoluções</p>
                    <p className="font-semibold text-blue-600">+{data.resumo.total_devolucoes}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Active Allocations */}
            {data.alocacoes_activas.length > 0 && (
              <>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Alocações Activas ({data.alocacoes_activas.length})
                </h3>
                <div className="space-y-2 mb-4">
                  {data.alocacoes_activas.map((alloc) => (
                    <Card key={alloc.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{alloc.projeto_nome}</p>
                          {alloc.etapa_nome && (
                            <p className="text-xs text-muted-foreground">Etapa: {alloc.etapa_nome}</p>
                          )}
                          <div className="flex gap-3 text-xs mt-1">
                            <span>Alocado: <strong>{alloc.quantidade_alocada}</strong></span>
                            <span>Consumido: <strong>{alloc.quantidade_consumida}</strong></span>
                            <span className="text-primary">Pendente: <strong>{alloc.quantidade_pendente}</strong></span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant={alloc.status === "alocado" ? "default" : "secondary"} className="text-xs">
                            {alloc.status === "alocado" ? "Alocado" : 
                             alloc.status === "parcialmente_consumido" ? "Parcial" : alloc.status}
                          </Badge>
                          {alloc.quantidade_pendente > 0 && (
                            <div className="flex gap-1">
                              <MaterialConsumptionModal
                                allocation={alloc as any}
                                trigger={<Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Consumir</Button>}
                              />
                              <MaterialReturnModal
                                allocation={alloc as any}
                                trigger={<Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Devolver</Button>}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <Separator className="my-4" />
              </>
            )}

            {/* Timeline */}
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline de Movimentações ({data.timeline.length})
            </h3>
            <div className="space-y-3">
              {data.timeline.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Sem movimentações registadas</p>
              ) : (
                data.timeline.map((mov) => {
                  const config = getMovementConfig(mov.tipo_movimentacao);
                  const Icon = config.icon;

                  return (
                    <div key={mov.id} className={`flex gap-3 p-3 rounded-lg ${config.bg}`}>
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-background ${config.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium ${config.color}`}>
                            {config.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(mov.data_movimentacao), "dd/MM/yyyy", { locale: pt })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold">
                            {mov.tipo_movimentacao === "entrada" || mov.tipo_movimentacao === "devolucao" || mov.tipo_movimentacao === "ajuste_positivo" 
                              ? `+${mov.quantidade}` 
                              : `-${mov.quantidade}`}
                          </span>
                          {mov.projeto_destino_nome && (
                            <span className="text-muted-foreground">→ {mov.projeto_destino_nome}</span>
                          )}
                          {mov.projeto_origem_nome && mov.tipo_movimentacao === "devolucao" && (
                            <span className="text-muted-foreground">← {mov.projeto_origem_nome}</span>
                          )}
                        </div>
                        {(mov.documento_referencia || mov.observacoes || mov.motivo_devolucao) && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {mov.documento_referencia && <span>Doc: {mov.documento_referencia} | </span>}
                            {mov.motivo_devolucao && <span>Motivo: {mov.motivo_devolucao} | </span>}
                            {mov.observacoes && <span>{mov.observacoes}</span>}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <User className="h-3 w-3" />
                          {mov.responsavel}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Material não encontrado
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
