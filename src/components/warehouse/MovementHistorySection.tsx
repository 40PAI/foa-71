import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  History, 
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useMaterialMovements } from "@/hooks/useMaterialMovements";
import { useProjects } from "@/hooks/useProjects";
import { useMaterialsArmazem } from "@/hooks/useMaterialsArmazem";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

const MOVEMENT_LABELS: Record<string, string> = {
  entrada: "Entrada",
  saida: "Saída",
  consumo: "Consumo",
  devolucao: "Devolução",
  ajuste_positivo: "Ajuste +",
  ajuste_negativo: "Ajuste -",
  transferencia: "Transferência",
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

  const isPositiveMovement = (tipo: string) => {
    return tipo === "entrada" || tipo === "devolucao" || tipo === "ajuste_positivo";
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

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Histórico de Movimentações
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
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead>Origem / Destino</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Responsável</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements.map((mov: any) => {
                    const material = materials?.find((m) => m.id === mov.material_id);
                    const isPositive = isPositiveMovement(mov.tipo_movimentacao);

                    return (
                      <TableRow key={mov.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm font-medium">
                            {format(new Date(mov.data_movimentacao), "dd/MM/yyyy", { locale: pt })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {MOVEMENT_LABELS[mov.tipo_movimentacao] || mov.tipo_movimentacao}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{material?.nome_material || "N/A"}</p>
                            <p className="text-xs text-muted-foreground">
                              Cód: {material?.codigo_interno || "N/A"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isPositive ? (
                              <ArrowUpRight className="h-4 w-4 text-primary" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className={`font-semibold ${isPositive ? "text-primary" : "text-foreground"}`}>
                              {isPositive ? "+" : "-"}{mov.quantidade}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              {material?.unidade_medida || "un"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {mov.projeto_destino_nome && (
                              <p>→ {mov.projeto_destino_nome}</p>
                            )}
                            {mov.projeto_origem_nome && (
                              <p>← {mov.projeto_origem_nome}</p>
                            )}
                            {!mov.projeto_destino_nome && !mov.projeto_origem_nome && (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {mov.documento_referencia ? (
                            <span className="text-sm">{mov.documento_referencia}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{mov.responsavel || "—"}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}