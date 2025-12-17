import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, 
  Filter,
  PackagePlus, 
  PackageMinus, 
  Hammer, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown,
  MapPin,
  Calendar,
  User,
  Download
} from "lucide-react";
import { useMaterialMovements } from "@/hooks/useMaterialMovements";
import { useProjects } from "@/hooks/useProjects";
import { useMaterialsArmazem } from "@/hooks/useMaterialsArmazem";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

const MOVEMENT_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string; bg: string }> = {
  entrada: { icon: PackagePlus, color: "text-green-600", label: "Entrada", bg: "bg-green-100 dark:bg-green-900/30" },
  saida: { icon: PackageMinus, color: "text-orange-600", label: "Saída", bg: "bg-orange-100 dark:bg-orange-900/30" },
  consumo: { icon: Hammer, color: "text-red-600", label: "Consumo", bg: "bg-red-100 dark:bg-red-900/30" },
  devolucao: { icon: RotateCcw, color: "text-blue-600", label: "Devolução", bg: "bg-blue-100 dark:bg-blue-900/30" },
  ajuste_positivo: { icon: TrendingUp, color: "text-emerald-600", label: "Ajuste +", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  ajuste_negativo: { icon: TrendingDown, color: "text-rose-600", label: "Ajuste -", bg: "bg-rose-100 dark:bg-rose-900/30" },
  transferencia: { icon: MapPin, color: "text-purple-600", label: "Transferência", bg: "bg-purple-100 dark:bg-purple-900/30" },
};

export function MovementHistorySection() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [materialFilter, setMaterialFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: movements, isLoading } = useMaterialMovements();
  const { data: projects } = useProjects();
  const { data: materials } = useMaterialsArmazem();

  const filteredMovements = movements?.filter((m) => {
    if (typeFilter !== "all" && m.tipo_movimentacao !== typeFilter) {
      return false;
    }
    if (materialFilter !== "all" && m.material_id !== materialFilter) {
      return false;
    }
    if (projectFilter !== "all") {
      const projId = parseInt(projectFilter);
      if (m.projeto_origem_id !== projId && m.projeto_destino_id !== projId) {
        return false;
      }
    }
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        m.responsavel?.toLowerCase().includes(search) ||
        m.observacoes?.toLowerCase().includes(search) ||
        m.documento_referencia?.toLowerCase().includes(search)
      );
    }
    return true;
  }) || [];

  const getMovementConfig = (tipo: string) => {
    return MOVEMENT_CONFIG[tipo] || MOVEMENT_CONFIG.entrada;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="entrada">Entradas</SelectItem>
              <SelectItem value="saida">Saídas</SelectItem>
              <SelectItem value="consumo">Consumos</SelectItem>
              <SelectItem value="devolucao">Devoluções</SelectItem>
              <SelectItem value="ajuste_positivo">Ajustes +</SelectItem>
              <SelectItem value="ajuste_negativo">Ajustes -</SelectItem>
            </SelectContent>
          </Select>

          <Select value={materialFilter} onValueChange={setMaterialFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Material" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Materiais</SelectItem>
              {materials?.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.codigo_interno} - {m.nome_material}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Projecto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Projectos</SelectItem>
              {projects?.map((p) => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-40"
          />

          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="outline">
              {filteredMovements.length} movimentações
            </Badge>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Timeline de Movimentações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Sem movimentações encontradas</p>
              <p className="text-sm">Ajuste os filtros ou registe uma nova movimentação</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {filteredMovements.map((mov: any) => {
                  const config = getMovementConfig(mov.tipo_movimentacao);
                  const Icon = config.icon;
                  const material = materials?.find((m) => m.id === mov.material_id);

                  return (
                    <div key={mov.id} className={`flex gap-3 p-3 rounded-lg ${config.bg}`}>
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-background ${config.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${config.color}`}>
                              {config.label}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {material?.codigo_interno || "N/A"}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(mov.data_movimentacao), "dd/MM/yyyy", { locale: pt })}
                          </span>
                        </div>
                        
                        <p className="text-sm">{material?.nome_material || "Material desconhecido"}</p>
                        
                        <div className="flex items-center gap-2 text-sm mt-1">
                          <span className="font-semibold">
                            {mov.tipo_movimentacao === "entrada" || mov.tipo_movimentacao === "devolucao" || mov.tipo_movimentacao === "ajuste_positivo" 
                              ? `+${mov.quantidade}` 
                              : `-${mov.quantidade}`}
                            {" "}{material?.unidade_medida || "un"}
                          </span>
                          {mov.projeto_destino_nome && (
                            <span className="text-muted-foreground">→ {mov.projeto_destino_nome}</span>
                          )}
                          {mov.projeto_origem_nome && (
                            <span className="text-muted-foreground">← {mov.projeto_origem_nome}</span>
                          )}
                        </div>

                        {(mov.documento_referencia || mov.observacoes) && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {mov.documento_referencia && <span>Doc: {mov.documento_referencia} | </span>}
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
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
