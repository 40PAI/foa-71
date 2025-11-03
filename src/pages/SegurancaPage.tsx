
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, MobileCard, MobileCardHeader, MobileCardContent, MobileCardItem } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Edit, Trash2, AlertTriangle, Eye } from "lucide-react";
import { IncidentModal } from "@/components/modals/IncidentModal";
import { useIncidents } from "@/hooks/useIncidents";
import { useProjects } from "@/hooks/useProjects";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ProjectGuard } from "@/components/ProjectGuard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useProjectContext } from "@/contexts/ProjectContext";

export function SegurancaPage() {
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const { selectedProjectId } = useProjectContext();
  
  const { data: incidents, isLoading, error } = useIncidents(selectedProjectId || undefined);
  const { data: projects } = useProjects();

  const filteredIncidents = incidents || [];

  const handleViewIncident = (incident: any) => {
    console.log('Visualizar incidente:', incident);
  };

  const handleEditIncident = (incident: any) => {
    setSelectedIncident(incident);
    setModalMode('edit');
    setIsIncidentModalOpen(true);
  };

  const handleDeleteIncident = (incident: any) => {
    console.log('Eliminar incidente:', incident);
  };

  const handleNewIncident = () => {
    setSelectedIncident(null);
    setModalMode('create');
    setIsIncidentModalOpen(true);
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erro de Conexão</h2>
          <p className="text-muted-foreground mb-4">
            Não foi possível carregar os dados de incidentes.
          </p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute module="seguranca">
      <ProjectGuard message="Selecione um projeto para ver os incidentes de segurança">
        <div className="w-full space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Segurança & Higiene</h1>
            <Button onClick={handleNewIncident} className="w-full sm:w-auto min-h-[44px]">
              <Plus className="mr-2 h-4 w-4" />
              Novo Registo
            </Button>
          </div>
      
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Registo de Incidentes e Near-Miss</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden sm:block">
            <div className="scrollable-table-container" style={{ maxHeight: '600px' }}>
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Data</TableHead>
                    <TableHead className="w-[150px]">Obra</TableHead>
                    <TableHead className="w-[120px]">Tipo</TableHead>
                    <TableHead className="min-w-[200px]">Descrição</TableHead>
                    <TableHead className="w-[120px]">Severidade</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents?.map((incidente, index) => {
                     const projeto = incidente.projeto?.nome || projects?.find(p => p.id === incidente.id_projeto)?.nome || 'N/A';
                    
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{incidente.data}</TableCell>
                        <TableCell>{projeto}</TableCell>
                        <TableCell>
                          <span className={`py-1 rounded text-xs font-medium whitespace-nowrap ${
                            incidente.tipo === 'Incidente' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {incidente.tipo}
                          </span>
                        </TableCell>
                        <TableCell className="truncate">
                          <div className="truncate" title={incidente.descricao}>
                            {incidente.descricao}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={incidente.severidade} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewIncident(incidente)}
                              className="h-8 w-8 p-0"
                              title="Visualizar"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditIncident(incidente)}
                              className="h-8 w-8 p-0"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteIncident(incidente)}
                              className="h-8 w-8 p-0"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="block sm:hidden p-4 space-y-4">
            {filteredIncidents?.map((incidente, index) => {
              const projeto = incidente.projeto?.nome || projects?.find(p => p.id === incidente.id_projeto)?.nome || 'N/A';
              
              return (
                <MobileCard key={index}>
                  <MobileCardHeader>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{incidente.data}</span>
                      <span className={`py-1 rounded text-xs font-medium ${
                        incidente.tipo === 'Incidente' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {incidente.tipo}
                      </span>
                    </div>
                  </MobileCardHeader>
                  
                  <MobileCardContent>
                    <MobileCardItem label="Obra">
                      {projeto}
                    </MobileCardItem>
                    
                    <MobileCardItem label="Severidade">
                      <StatusBadge status={incidente.severidade} />
                    </MobileCardItem>
                    
                    <div className="col-span-2 pt-2">
                      <div className="text-sm text-muted-foreground mb-1">Descrição:</div>
                      <div className="text-sm">{incidente.descricao}</div>
                    </div>
                    
                    <div className="flex gap-2 pt-2 border-t">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewIncident(incidente)}
                        className="flex-1 min-h-[44px]"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditIncident(incidente)}
                        className="flex-1 min-h-[44px]"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteIncident(incidente)}
                        className="flex-1 min-h-[44px]"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </Button>
                    </div>
                  </MobileCardContent>
                </MobileCard>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <IncidentModal
        open={isIncidentModalOpen}
        onOpenChange={setIsIncidentModalOpen}
        incident={selectedIncident}
        mode={modalMode}
      />
      </div>
      </ProjectGuard>
    </ProtectedRoute>
  );
}
