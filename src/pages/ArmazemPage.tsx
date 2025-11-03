
import { useState, useMemo } from "react";
import { MainContent } from "@/components/MainContent";
import { MaterialArmazemModal } from "@/components/modals/MaterialArmazemModal";
import { MaterialMovementModal } from "@/components/modals/MaterialMovementModal";
import { ConsumptionGuideModal } from "@/components/modals/ConsumptionGuideModal";
import { WarehouseImportModal } from "@/components/modals/WarehouseImportModal";
import { useMaterialsArmazem } from "@/hooks/useMaterialsArmazem";
import { useMaterialMovements } from "@/hooks/useMaterialMovements";
import { useConsumptionGuides } from "@/hooks/useConsumptionGuides";
import { useProjectContext } from "@/contexts/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Package, ArrowRightLeft, ClipboardList, CheckCircle, AlertTriangle, Grid3X3, Table as TableIcon, List, Search, Filter } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { Tables } from "@/integrations/supabase/types";

export function ArmazemPage() {
  const { selectedProjectId } = useProjectContext();
  const { data: materials, isLoading } = useMaterialsArmazem();
  const { data: movements } = useMaterialMovements(selectedProjectId || undefined);
  const { data: consumptionGuides } = useConsumptionGuides(selectedProjectId || undefined);
  
  // View states
  const [viewType, setViewType] = useState<'grid' | 'table' | 'list'>('grid');
  const [movementsViewType, setMovementsViewType] = useState<'grid' | 'table' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSubcategory, setFilterSubcategory] = useState('all');

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    if (!materials) return [];
    
    return materials.filter(material => {
      const matchesSearch = material.nome_material.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           material.codigo_interno.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || material.status_item === filterStatus;
      const matchesCategory = filterCategory === 'all' || material.categoria_principal === filterCategory;
      const matchesSubcategory = filterSubcategory === 'all' || material.subcategoria === filterSubcategory;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesSubcategory;
    });
  }, [materials, searchTerm, filterStatus, filterCategory, filterSubcategory]);

  // Render materials in grid view
  const renderGridView = () => (
    <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredMaterials.map((material) => (
        <Card key={material.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {material.nome_material}
            </CardTitle>
            <Package className="h-4 w-4 text-foreground opacity-60" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Código: {material.codigo_interno}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {material.quantidade_stock}
                </span>
                <span className="text-xs text-muted-foreground">
                  {material.unidade_medida}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <Badge 
                  variant={material.status_item === 'Disponível' ? 'default' : 'secondary'}
                >
                  {material.status_item}
                </Badge>
                <MaterialArmazemModal material={material} trigger="edit" />
              </div>
              {material.descricao_tecnica && (
                <p className="text-xs text-muted-foreground">
                  {material.descricao_tecnica}
                </p>
              )}
              {material.localizacao_fisica && (
                <p className="text-xs text-muted-foreground">
                  Localização: {material.localizacao_fisica}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Render materials in table view
  const renderTableView = () => (
    <div className="scrollable-table-container" style={{ maxHeight: '600px' }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Unidade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Subcategoria</TableHead>
            <TableHead>Localização</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMaterials.map((material) => (
            <TableRow key={material.id}>
              <TableCell className="font-medium">{material.nome_material}</TableCell>
              <TableCell>{material.codigo_interno}</TableCell>
              <TableCell className="text-right font-mono">{material.quantidade_stock}</TableCell>
              <TableCell>{material.unidade_medida}</TableCell>
              <TableCell>
                <Badge variant={material.status_item === 'Disponível' ? 'default' : 'secondary'}>
                  {material.status_item}
                </Badge>
              </TableCell>
              <TableCell>{material.categoria_principal || '-'}</TableCell>
              <TableCell>{material.subcategoria || '-'}</TableCell>
              <TableCell>{material.localizacao_fisica || '-'}</TableCell>
              <TableCell>
                <MaterialArmazemModal material={material} trigger="edit" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // Render materials in list view
  const renderListView = () => (
    <div className="space-y-2">
      {filteredMaterials.map((material) => (
        <Card key={material.id}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-semibold">{material.nome_material}</h4>
                  <p className="text-sm text-muted-foreground">
                    {material.codigo_interno} • {material.quantidade_stock} {material.unidade_medida}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={material.status_item === 'Disponível' ? 'default' : 'secondary'}>
                  {material.status_item}
                </Badge>
                <MaterialArmazemModal material={material} trigger="edit" />
              </div>
            </div>
            {material.localizacao_fisica && (
              <p className="text-xs text-muted-foreground mt-2">
                📍 {material.localizacao_fisica}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Render movements in grid view
  const renderMovementsGridView = () => (
    <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {movements?.map((movement) => (
        <Card key={movement.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {movement.material?.nome_material}
            </CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-foreground opacity-60" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {movement.quantidade}
                </span>
                <Badge variant="outline">{movement.tipo_movimentacao}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {movement.projeto_origem?.nome || "Armazém"} → {movement.projeto_destino?.nome || "Armazém"}
              </p>
              <p className="text-xs text-muted-foreground">
                Responsável: {movement.responsavel}
              </p>
              <p className="text-xs text-muted-foreground">
                Data: {new Date(movement.data_movimentacao).toLocaleDateString()}
              </p>
              {movement.observacoes && (
                <p className="text-xs text-muted-foreground">
                  Obs: {movement.observacoes}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Render movements in table view
  const renderMovementsTableView = () => (
    <div className="scrollable-table-container" style={{ maxHeight: '600px' }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Material</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Destino</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Observações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements?.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell className="font-medium">{movement.material?.nome_material}</TableCell>
              <TableCell>
                <Badge variant="outline">{movement.tipo_movimentacao}</Badge>
              </TableCell>
              <TableCell className="text-right font-mono">{movement.quantidade}</TableCell>
              <TableCell>{movement.projeto_origem?.nome || "Armazém"}</TableCell>
              <TableCell>{movement.projeto_destino?.nome || "Armazém"}</TableCell>
              <TableCell>{movement.responsavel}</TableCell>  
              <TableCell>{new Date(movement.data_movimentacao).toLocaleDateString()}</TableCell>
              <TableCell className="max-w-xs truncate">{movement.observacoes || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // Render movements in list view
  const renderMovementsListView = () => (
    <div className="space-y-2">
      {movements?.map((movement) => (
        <Card key={movement.id}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-semibold">{movement.material?.nome_material}</h4>
                  <p className="text-sm text-muted-foreground">
                    {movement.quantidade} unidades • {movement.responsavel}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {movement.projeto_origem?.nome || "Armazém"} → {movement.projeto_destino?.nome || "Armazém"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <Badge variant="outline">{movement.tipo_movimentacao}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(movement.data_movimentacao).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            {movement.observacoes && (
              <p className="text-xs text-muted-foreground mt-2">
                📝 {movement.observacoes}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Em uso":
        return "status-success";
      case "Disponível":
        return "status-info";
      case "Manutenção":
        return "status-warning";
      case "Reservado":
        return "status-info";
      case "Inativo":
        return "status-neutral";
      default:
        return "status-neutral";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Material de Construção":
        return "status-warning";
      case "Equipamento":
        return "status-danger";
      case "Ferramenta":
        return "status-info";
      case "Consumível":
        return "status-success";
      case "EPI":
        return "status-info";
      default:
        return "status-neutral";
    }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Armazém</h1>
          <p className="text-muted-foreground">
            Controle de materiais, movimentações e guias de consumo
          </p>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Armazém</h1>
        <div className="flex gap-2">
          <WarehouseImportModal />
          <MaterialArmazemModal />
          <MaterialMovementModal />
          <ConsumptionGuideModal />
        </div>
      </div>

          <Tabs defaultValue="materials" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-1 h-auto sm:h-10">
              <TabsTrigger value="materials">Materiais</TabsTrigger>
              <TabsTrigger value="movements">Movimentações</TabsTrigger>
              <TabsTrigger value="consumption">Guias de Consumo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="materials" className="space-y-4">
              {/* Filters and View Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  {/* Search */}
                  <div className="relative flex-1 min-w-0 sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar materiais..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  
                  {/* Status Filter */}
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos Status</SelectItem>
                      <SelectItem value="Disponível">Disponível</SelectItem>
                      <SelectItem value="Em uso">Em uso</SelectItem>
                      <SelectItem value="Reservado">Reservado</SelectItem>
                      <SelectItem value="Manutenção">Manutenção</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Category Filter */}
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas Categorias</SelectItem>
                      <SelectItem value="Material">Material</SelectItem>
                      <SelectItem value="Mão de Obra">Mão de Obra</SelectItem>
                      <SelectItem value="Património">Patrimônio</SelectItem>
                      <SelectItem value="Custos Indiretos">Custos Indiretos</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Subcategory Filter */}
                  <Select value={filterSubcategory} onValueChange={setFilterSubcategory}>
                    <SelectTrigger className="w-full sm:w-52">
                      <SelectValue placeholder="Subcategoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas Subcategorias</SelectItem>
                      <SelectItem value="Materiais de Construção">Materiais de Construção</SelectItem>
                      <SelectItem value="Equipamentos e Ferramentas">Equipamentos e Ferramentas</SelectItem>
                      <SelectItem value="Ferramentas Manuais">Ferramentas Manuais</SelectItem>
                      <SelectItem value="EPIs">EPIs</SelectItem>
                      <SelectItem value="Consumo Rápido / Apoio">Consumo Rápido / Apoio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* View Toggle Buttons */}
                <div className="flex gap-1 border rounded-lg p-1">
                  <Button
                    variant={viewType === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewType('grid')}
                    className="h-8 w-8 p-0"
                    title="Vista em grade"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewType === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewType('table')}
                    className="h-8 w-8 p-0"
                    title="Vista em tabela"
                  >
                    <TableIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewType === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewType('list')}
                    className="h-8 w-8 p-0"
                    title="Vista em lista"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-muted-foreground">
                {filteredMaterials.length} de {materials?.length || 0} materiais
              </div>

              {/* Materials Content */}
              {filteredMaterials.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum material encontrado</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' || filterSubcategory !== 'all'
                        ? 'Tente ajustar os filtros para encontrar materiais.'
                        : 'Comece adicionando materiais ao armazém.'}
                    </p>
                    <MaterialArmazemModal />
                  </CardContent>
                </Card>
              ) : (
                <>
                  {viewType === 'grid' && renderGridView()}
                  {viewType === 'table' && renderTableView()}
                  {viewType === 'list' && renderListView()}
                </>
              )}
            </TabsContent>

            <TabsContent value="movements" className="space-y-4">
              {/* View Toggle Buttons for Movements */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {movements?.length || 0} movimentações
                </div>
                <div className="flex gap-1 border rounded-lg p-1">
                  <Button
                    variant={movementsViewType === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMovementsViewType('grid')}
                    className="h-8 w-8 p-0"
                    title="Vista de Grade"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={movementsViewType === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMovementsViewType('table')}
                    className="h-8 w-8 p-0"
                    title="Vista em Tabela"
                  >
                    <TableIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={movementsViewType === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMovementsViewType('list')}
                    className="h-8 w-8 p-0"
                    title="Vista em Lista"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Movements Content */}
              {!movements || movements.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma movimentação encontrada</h3>
                    <p className="text-muted-foreground mb-4">
                      Comece criando movimentações de materiais.
                    </p>
                    <MaterialMovementModal />
                  </CardContent>
                </Card>
              ) : (
                <>
                  {movementsViewType === 'grid' && renderMovementsGridView()}
                  {movementsViewType === 'table' && renderMovementsTableView()}
                  {movementsViewType === 'list' && renderMovementsListView()}
                </>
              )}
            </TabsContent>

            <TabsContent value="consumption" className="space-y-4">
              <div className="grid gap-4">
                {consumptionGuides?.map((guide) => (
                  <Card key={guide.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">Guia {guide.numero_guia}</h4>
                          <p className="text-sm text-muted-foreground">
                            {guide.responsavel} - {new Date(guide.data_consumo).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={guide.status === 'ativo' ? 'default' : 'secondary'}>
                          {guide.status}
                        </Badge>
                      </div>
                      
                      {guide.tarefa_relacionada && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Tarefa: {guide.tarefa_relacionada}
                        </p>
                      )}
                      
                      {guide.frente_servico && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Frente: {guide.frente_servico}
                        </p>
                      )}

                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Materiais:</h5>
                        {guide.itens?.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.material?.nome_material}</span>
                            <span>{item.quantidade_consumida} {item.material?.unidade_medida}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
      </Tabs>
    </div>
  );
}
