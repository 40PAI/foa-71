import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  MapPin,
  Package,
  Hammer,
  RotateCcw,
  CheckCircle2,
  Clock,
  Filter,
  LayoutGrid,
  TableIcon,
  History,
} from "lucide-react";
import {
  useMaterialAllocations,
  MaterialAllocationWithDetails,
} from "@/hooks/useMaterialAllocations";
import { useProjects } from "@/hooks/useProjects";
import { MaterialConsumptionModal } from "@/components/modals/MaterialConsumptionModal";
import { MaterialReturnModal } from "@/components/modals/MaterialReturnModal";
import { AllocationHistoryModal } from "@/components/modals/AllocationHistoryModal";
import { ProjectConsumptionGuideModal } from "@/components/modals/ProjectConsumptionGuideModal";
import { MaterialConsumptionItem } from "@/hooks/useProjectConsumptionSummary";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  alocado: {
    label: "Alocado",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30",
    icon: Clock,
  },
  parcialmente_consumido: {
    label: "Parcial",
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30",
    icon: Hammer,
  },
  consumido: {
    label: "Consumido",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30",
    icon: CheckCircle2,
  },
  devolvido: {
    label: "Devolvido",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30",
    icon: RotateCcw,
  },
};

export function MaterialAllocationsSection() {
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");

  // Modal states
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] =
    useState<MaterialAllocationWithDetails | null>(null);
  const [selectedGuideProject, setSelectedGuideProject] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const { data: projects } = useProjects();
  const { data: allocations, isLoading } = useMaterialAllocations(
    selectedProject !== "all" ? parseInt(selectedProject) : undefined
  );

  const filteredAllocations =
    allocations?.filter((a) => {
      // Status filter
      if (
        statusFilter === "active" &&
        (a.status === "consumido" || a.status === "devolvido")
      ) {
        return false;
      }
      if (
        statusFilter !== "all" &&
        statusFilter !== "active" &&
        a.status !== statusFilter
      ) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          a.material_nome?.toLowerCase().includes(search) ||
          a.material_codigo?.toLowerCase().includes(search) ||
          a.projeto_nome?.toLowerCase().includes(search)
        );
      }

      return true;
    }) || [];

  // Group by project
  const groupedByProject = filteredAllocations.reduce((acc, alloc) => {
    const projectName = alloc.projeto_nome || "Sem Projecto";
    if (!acc[projectName]) {
      acc[projectName] = { projectId: alloc.projeto_id, allocations: [] };
    }
    acc[projectName].allocations.push(alloc);
    return acc;
  }, {} as Record<string, { projectId: number; allocations: typeof filteredAllocations }>);

  const handleAllocationClick = (allocation: MaterialAllocationWithDetails) => {
    setSelectedAllocation(allocation);
    setHistoryModalOpen(true);
  };

  const handleProjectClick = (projectId: number, projectName: string) => {
    setSelectedGuideProject({ id: projectId, name: projectName });
    setGuideModalOpen(true);
  };

  const handleMaterialClickFromGuide = (item: MaterialConsumptionItem) => {
    // Find the allocation from the current data
    const allocation = allocations?.find(
      (a) => a.id === item.allocation_id
    );
    if (allocation) {
      setSelectedAllocation(allocation);
      setGuideModalOpen(false);
      setHistoryModalOpen(true);
    }
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

          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos os projectos" />
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

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="active">Apenas Activos</SelectItem>
              <SelectItem value="alocado">Alocado</SelectItem>
              <SelectItem value="parcialmente_consumido">
                Parcialmente Consumido
              </SelectItem>
              <SelectItem value="consumido">Consumido</SelectItem>
              <SelectItem value="devolvido">Devolvido</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Pesquisar material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48"
          />

          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="outline">{filteredAllocations.length} alocações</Badge>

            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) =>
                value && setViewMode(value as "cards" | "table")
              }
              className="border rounded-lg"
            >
              <ToggleGroupItem value="cards" aria-label="Vista Cards" size="sm">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="Vista Tabela" size="sm">
                <TableIcon className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filteredAllocations.length === 0 ? (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Sem alocações encontradas</p>
            <p className="text-sm">
              Registe uma saída de material para criar uma alocação
            </p>
          </div>
        </Card>
      ) : viewMode === "table" ? (
        /* Table View */
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Obra</TableHead>
                <TableHead>Material</TableHead>
                <TableHead className="text-center w-16">Aloc</TableHead>
                <TableHead className="text-center w-16">Cons</TableHead>
                <TableHead className="text-center w-16">Dev</TableHead>
                <TableHead className="text-center w-16">Pend</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-32">Acções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAllocations.map((alloc) => {
                const statusConfig =
                  STATUS_CONFIG[alloc.status] || STATUS_CONFIG.alocado;
                const StatusIcon = statusConfig.icon;

                return (
                  <TableRow
                    key={alloc.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleAllocationClick(alloc)}
                  >
                    <TableCell>
                      <button
                        className="text-left font-medium text-primary hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProjectClick(
                            alloc.projeto_id,
                            alloc.projeto_nome || "Sem nome"
                          );
                        }}
                      >
                        {alloc.projeto_nome || "Sem Projecto"}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm line-clamp-1">
                          {alloc.material_nome}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {alloc.material_codigo}
                          {alloc.etapa_nome && ` | ${alloc.etapa_nome}`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {alloc.quantidade_alocada}
                    </TableCell>
                    <TableCell className="text-center text-orange-600 font-medium">
                      {alloc.quantidade_consumida}
                    </TableCell>
                    <TableCell className="text-center text-purple-600 font-medium">
                      {alloc.quantidade_devolvida}
                    </TableCell>
                    <TableCell className="text-center font-bold text-primary">
                      {alloc.quantidade_pendente}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusConfig.color} gap-1`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {alloc.quantidade_pendente > 0 && (
                        <div
                          className="flex gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MaterialConsumptionModal
                            allocation={alloc}
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-orange-600 hover:text-orange-700"
                              >
                                <Hammer className="h-3 w-3" />
                              </Button>
                            }
                          />
                          <MaterialReturnModal
                            allocation={alloc}
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-purple-600 hover:text-purple-700"
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                            }
                          />
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        /* Cards View */
        <div className="space-y-4">
          {Object.entries(groupedByProject).map(
            ([projectName, { projectId, allocations: allocs }]) => (
              <Card key={projectName}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <button
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                      onClick={() => handleProjectClick(projectId, projectName)}
                    >
                      <MapPin className="h-5 w-5" />
                      {projectName}
                      <History className="h-4 w-4 opacity-50" />
                    </button>
                    <Badge variant="secondary" className="ml-2">
                      {allocs.length} materiais
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allocs.map((alloc) => {
                      const statusConfig =
                        STATUS_CONFIG[alloc.status] || STATUS_CONFIG.alocado;
                      const StatusIcon = statusConfig.icon;

                      return (
                        <div
                          key={alloc.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => handleAllocationClick(alloc)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              <Package className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{alloc.material_nome}</p>
                              <p className="text-xs text-muted-foreground">
                                {alloc.material_codigo} | {alloc.material_unidade}
                              </p>
                              {alloc.etapa_nome && (
                                <p className="text-xs text-muted-foreground">
                                  Etapa: {alloc.etapa_nome}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right text-sm">
                              <div className="flex items-center gap-3">
                                <span className="text-muted-foreground">
                                  Alocado:{" "}
                                  <strong className="text-foreground">
                                    {alloc.quantidade_alocada}
                                  </strong>
                                </span>
                                <span className="text-muted-foreground">
                                  Consumido:{" "}
                                  <strong className="text-orange-600">
                                    {alloc.quantidade_consumida}
                                  </strong>
                                </span>
                                <span className="text-muted-foreground">
                                  Devolvido:{" "}
                                  <strong className="text-purple-600">
                                    {alloc.quantidade_devolvida}
                                  </strong>
                                </span>
                                <span className="text-primary font-semibold">
                                  Pendente: {alloc.quantidade_pendente}
                                </span>
                              </div>
                            </div>

                            <Badge className={`${statusConfig.color} gap-1`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </Badge>

                            {alloc.quantidade_pendente > 0 && (
                              <div
                                className="flex gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MaterialConsumptionModal
                                  allocation={alloc}
                                  trigger={
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="gap-1 text-orange-600 hover:text-orange-700"
                                    >
                                      <Hammer className="h-4 w-4" />
                                      Consumir
                                    </Button>
                                  }
                                />
                                <MaterialReturnModal
                                  allocation={alloc}
                                  trigger={
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="gap-1 text-purple-600 hover:text-purple-700"
                                    >
                                      <RotateCcw className="h-4 w-4" />
                                      Devolver
                                    </Button>
                                  }
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}

      {/* History Modal */}
      <AllocationHistoryModal
        open={historyModalOpen}
        onOpenChange={setHistoryModalOpen}
        materialId={selectedAllocation?.material_id || null}
        projectId={selectedAllocation?.projeto_id || null}
        allocation={selectedAllocation || undefined}
      />

      {/* Project Consumption Guide Modal */}
      <ProjectConsumptionGuideModal
        open={guideModalOpen}
        onOpenChange={setGuideModalOpen}
        projectId={selectedGuideProject?.id || null}
        projectName={selectedGuideProject?.name || ""}
        onMaterialClick={handleMaterialClickFromGuide}
      />
    </div>
  );
}
