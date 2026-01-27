import { useState, useMemo, useEffect } from "react";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/common/TablePagination";
import { MaterialArmazemModal } from "@/components/modals/MaterialArmazemModal";
import { WarehouseImportModal } from "@/components/modals/WarehouseImportModal";
import { MaterialEntryModal } from "@/components/modals/MaterialEntryModal";
import { MaterialExitModal } from "@/components/modals/MaterialExitModal";
import { MaterialHistoryModal } from "@/components/modals/MaterialHistoryModal";
import { useMaterialsArmazem } from "@/hooks/useMaterialsArmazem";
import { useCriticalStock } from "@/hooks/useCriticalStock";
import { useProjectContext } from "@/contexts/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Grid3X3, Table as TableIcon, List, Search, History, MapPin, BarChart3, PackagePlus, PackageMinus, AlertTriangle } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MaterialAllocationsSection } from "@/components/warehouse/MaterialAllocationsSection";
import { MovementHistorySection } from "@/components/warehouse/MovementHistorySection";
import { WarehouseReportSection } from "@/components/warehouse/WarehouseReportSection";

export function ArmazemPage() {
  const { selectedProjectId } = useProjectContext();
  const { data: materials, isLoading } = useMaterialsArmazem();
  
  // Hook para verificar stock crítico e mostrar alertas
  const { criticalCount, criticalItems, hasWarehouseAccess } = useCriticalStock();
  
  const [viewType, setViewType] = useState<'grid' | 'table' | 'list'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredMaterials = useMemo(() => {
    if (!materials) return [];
    return materials.filter(material => {
      const matchesSearch = material.nome_material.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           material.codigo_interno.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || material.status_item === filterStatus;
      const matchesCategory = filterCategory === 'all' || material.categoria_principal === filterCategory;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [materials, searchTerm, filterStatus, filterCategory]);

  const materialsPagination = usePagination({
    totalItems: filteredMaterials.length,
    initialItemsPerPage: 50,
    persistKey: 'armazem-materials',
  });

  const paginatedMaterials = useMemo(() => {
    return filteredMaterials.slice(materialsPagination.startIndex, materialsPagination.endIndex);
  }, [filteredMaterials, materialsPagination.startIndex, materialsPagination.endIndex]);

  useEffect(() => {
    materialsPagination.resetToFirstPage();
  }, [searchTerm, filterStatus, filterCategory]);

  if (isLoading) {
    return (
      <div className="w-full space-y-6 p-4">
        <h1 className="text-2xl font-bold">Gestão de Armazém</h1>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Gestão de Armazém</h1>
          <p className="text-sm text-muted-foreground">Rastreabilidade completa de materiais</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <WarehouseImportModal />
          <MaterialArmazemModal />
          <MaterialEntryModal />
          <MaterialExitModal />
        </div>
      </div>

      {/* Critical Stock Alert Banner */}
      {criticalCount > 0 && hasWarehouseAccess && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="py-3 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-destructive">
                {criticalCount} material(s) com stock crítico
              </p>
              <p className="text-sm text-muted-foreground">
                {criticalItems.slice(0, 3).map(i => i.nome).join(', ')}
                {criticalCount > 3 && ` e mais ${criticalCount - 3}...`}
              </p>
            </div>
            <Badge variant="destructive">&lt; 10 unidades</Badge>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="materials" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 h-auto">
          <TabsTrigger value="materials" className="gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Materiais</span>
          </TabsTrigger>
          <TabsTrigger value="allocations" className="gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Alocações</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Histórico</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Relatórios</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2 flex-1">
              <div className="relative flex-1 min-w-0 max-w-xs">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Disponível">Disponível</SelectItem>
                  <SelectItem value="Em uso">Em uso</SelectItem>
                  <SelectItem value="Reservado">Reservado</SelectItem>
                  <SelectItem value="Manutenção">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-1">
              <Button variant={viewType === 'table' ? 'default' : 'ghost'} size="icon" onClick={() => setViewType('table')}>
                <TableIcon className="h-4 w-4" />
              </Button>
              <Button variant={viewType === 'grid' ? 'default' : 'ghost'} size="icon" onClick={() => setViewType('grid')}>
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant={viewType === 'list' ? 'default' : 'ghost'} size="icon" onClick={() => setViewType('list')}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {viewType === 'table' ? (
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedMaterials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{material.nome_material}</p>
                            <p className="text-xs text-muted-foreground">{material.codigo_interno}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{material.quantidade_stock} {material.unidade_medida}</TableCell>
                        <TableCell>
                          <Badge variant={material.status_item === 'Disponível' ? 'default' : 'secondary'}>
                            {material.status_item}
                          </Badge>
                        </TableCell>
                        <TableCell>{material.categoria_principal || '-'}</TableCell>
                        <TableCell>{material.localizacao_fisica || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <MaterialHistoryModal materialId={material.id} />
                            <MaterialEntryModal preSelectedMaterialId={material.id} trigger={
                              <Button variant="ghost" size="sm" className="gap-1 text-green-600"><PackagePlus className="h-4 w-4" /></Button>
                            } />
                            <MaterialExitModal preSelectedMaterialId={material.id} trigger={
                              <Button variant="ghost" size="sm" className="gap-1 text-orange-600"><PackageMinus className="h-4 w-4" /></Button>
                            } />
                            <MaterialArmazemModal material={material} trigger="edit" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <TablePagination
                currentPage={materialsPagination.currentPage}
                totalPages={materialsPagination.totalPages}
                totalItems={filteredMaterials.length}
                itemsPerPage={materialsPagination.itemsPerPage}
                startIndex={materialsPagination.startIndex}
                endIndex={materialsPagination.endIndex}
                onPageChange={materialsPagination.goToPage}
                onItemsPerPageChange={materialsPagination.setItemsPerPage}
              />
            </Card>
          ) : viewType === 'grid' ? (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredMaterials.map((material) => (
                <Card key={material.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm">{material.nome_material}</CardTitle>
                      <MaterialHistoryModal materialId={material.id} />
                    </div>
                    <p className="text-xs text-muted-foreground">{material.codigo_interno}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold">{material.quantidade_stock}</span>
                      <span className="text-xs text-muted-foreground">{material.unidade_medida}</span>
                    </div>
                    <Badge variant={material.status_item === 'Disponível' ? 'default' : 'secondary'}>
                      {material.status_item}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMaterials.map((material) => (
                <Card key={material.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{material.nome_material}</p>
                        <p className="text-xs text-muted-foreground">{material.codigo_interno} • {material.quantidade_stock} {material.unidade_medida}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={material.status_item === 'Disponível' ? 'default' : 'secondary'}>{material.status_item}</Badge>
                      <MaterialHistoryModal materialId={material.id} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Allocations Tab */}
        <TabsContent value="allocations">
          <MaterialAllocationsSection />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <MovementHistorySection />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <WarehouseReportSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ArmazemPage;
