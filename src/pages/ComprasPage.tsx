
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatters";
import { CheckCircle, XCircle, Clock, AlertTriangle, FileText, User, AlertCircle, Edit, Eye, Trash2 } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { useRequisitions, useDeleteRequisition } from "@/hooks/useRequisitions";
import { useDashboardKpis } from "@/hooks/useDashboardKpis";
import { useProjectContext } from "@/contexts/ProjectContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { RequisitionModal } from "@/components/modals/RequisitionModal";
import { RequisitionDetailsModal } from "@/components/modals/RequisitionDetailsModal";
import { useToast } from "@/hooks/use-toast";

export function ComprasPage() {
  const { selectedProjectId } = useProjectContext();
  const { data: allRequisitions = [], isLoading: loadingRequisitions } = useRequisitions();
  const { data: kpis = [], isLoading: loadingKpis } = useDashboardKpis();
  const deleteRequisitionMutation = useDeleteRequisition();
  const { toast } = useToast();
  
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Filtrar requisições pelo projeto selecionado
  const requisitions = selectedProjectId 
    ? allRequisitions.filter(r => r.id_projeto === selectedProjectId)
    : allRequisitions;

  if (loadingRequisitions || loadingKpis) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Compras & Aprovações</h1>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  // Mostrar aviso se nenhum projeto estiver selecionado
  if (!selectedProjectId) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Compras & Aprovações</h1>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Selecione um Projeto</h3>
              <p className="text-muted-foreground">
                Por favor, selecione um projeto no cabeçalho para ver as requisições de compras.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalRequisicoes = requisitions.length;
  const pendentesAprovacao = requisitions.filter(r => 
    r.status_fluxo === 'Aprovação Qualidade' || r.status_fluxo === 'Aprovação Direção'
  ).length;
  const valorTotal = requisitions.reduce((acc, r) => acc + (r.valor || 0), 0);
  const leadTimeMedio = kpis.length > 0 
    ? kpis.reduce((acc, k) => acc + (k.lead_time_compras_medio || 0), 0) / kpis.length 
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente': return 'gray';
      case 'Cotações': return 'blue';
      case 'Aprovação Qualidade': return 'yellow';
      case 'Aprovação Direção': return 'orange';
      case 'OC Gerada': return 'green';
      case 'Recepcionado': return 'teal';
      case 'Liquidado': return 'emerald';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OC Gerada': return <CheckCircle className="h-4 w-4" />;
      case 'Aprovação Qualidade':
      case 'Aprovação Direção': return <Clock className="h-4 w-4" />;
      case 'Pendente': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Alta': return 'bg-red-500';
      case 'Média': return 'bg-yellow-500';
      case 'Baixa': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja eliminar esta requisição?")) {
      try {
        await deleteRequisitionMutation.mutateAsync(id);
        toast({
          title: "Sucesso",
          description: "Requisição eliminada com sucesso",
        });
      } catch (error) {
        console.error("Erro ao eliminar requisição:", error);
        toast({
          title: "Erro",
          description: "Erro ao eliminar requisição. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewDetails = (requisition: any) => {
    setSelectedRequisition(requisition);
    setDetailsModalOpen(true);
  };

  // Helper function to safely get material name
  const getMaterialName = (req: any) => {
    if (req.nome_comercial_produto) {
      return req.nome_comercial_produto;
    }
    if (req.material && typeof req.material === 'object' && 'nome' in req.material) {
      return req.material.nome;
    }
    return 'N/A';
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Compras & Aprovações</h1>
        <RequisitionModal projectId={selectedProjectId} />
      </div>

      {/* KPIs de Compras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPICard
          title="Total Requisições"
          value={totalRequisicoes}
          subtitle="Ativas no projeto"
          icon={<FileText className="h-4 w-4" />}
          alert="green"
        />
        <KPICard
          title="Pendentes Aprovação"
          value={pendentesAprovacao}
          subtitle={totalRequisicoes > 0 ? `${((pendentesAprovacao / totalRequisicoes) * 100).toFixed(0)}% do total` : "0% do total"}
          icon={<Clock className="h-4 w-4" />}
          alert={pendentesAprovacao > 2 ? "red" : pendentesAprovacao > 0 ? "yellow" : "green"}
        />
        <KPICard
          title="Valor Total"
          value={formatCurrency(valorTotal)}
          subtitle="Requisições ativas"
          icon={<AlertTriangle className="h-4 w-4" />}
          alert="green"
        />
        <KPICard
          title="Lead-time Médio"
          value={`${leadTimeMedio.toFixed(1)} dias`}
          subtitle="Tempo médio aprovação"
          icon={<Clock className="h-4 w-4" />}
          alert={leadTimeMedio > 7 ? "red" : leadTimeMedio > 5 ? "yellow" : "green"}
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Requisições de Compra</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {requisitions.length === 0 ? (
            <div className="text-center p-8">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma Requisição</h3>
              <p className="text-muted-foreground">
                Não há requisições de compra para este projeto.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">ID / Data</TableHead>
                    <TableHead className="min-w-[180px]">Produto</TableHead>
                    <TableHead className="min-w-[100px]">Categoria</TableHead>
                    <TableHead className="min-w-[120px]">Quantidade</TableHead>
                    <TableHead className="min-w-[120px]">Valor Total</TableHead>
                    <TableHead className="min-w-[80px]">Urgência</TableHead>
                    <TableHead className="min-w-[140px]">Status</TableHead>
                    <TableHead className="min-w-[120px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {requisitions.map((req) => {
                  const statusColor = getStatusColor(req.status_fluxo);
                  const diasDesdeReq = Math.ceil((new Date().getTime() - new Date(req.data_requisicao).getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div>
                          <div className="font-mono text-sm font-semibold">REQ-{req.id}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(req.data_requisicao).toLocaleDateString('pt-PT')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {diasDesdeReq} dia{diasDesdeReq !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {getMaterialName(req)}
                          </div>
                          {req.codigo_produto && (
                            <div className="text-xs text-muted-foreground">
                              Cód: {req.codigo_produto}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Por: {req.requisitante}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {req.categoria_principal || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {req.quantidade_requisitada || 1} {req.unidade_medida || 'un'}
                          </div>
                          {req.valor_unitario && (
                            <div className="text-xs text-muted-foreground">
                              {formatCurrency(req.valor_unitario)}/un
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{formatCurrency(req.valor || 0)}</div>
                        {(req.valor || 0) > 10000000 && (
                          <Badge variant="destructive" className="text-xs mt-1">
                            Aprovação Direção
                          </Badge>
                        )}
                        {(req.valor || 0) > 3000000 && (req.valor || 0) <= 10000000 && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Aprovação Financeiro
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getUrgencyColor(req.urgencia_prioridade || 'Média')}`} />
                          <span className="text-sm">{req.urgencia_prioridade || 'Média'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(req.status_fluxo)}
                          <Badge variant="outline" className={`text-${statusColor}-700 border-${statusColor}-300`}>
                            {req.status_fluxo}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Ver detalhes"
                            onClick={() => handleViewDetails(req)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <RequisitionModal 
                            projectId={selectedProjectId}
                            requisition={req as any}
                            trigger="edit"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(req.id)}
                            title="Eliminar"
                            disabled={deleteRequisitionMutation.isPending}
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
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Limites de Aprovação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 border rounded-lg">
              <div className="font-semibold text-green-700">≤ 3.000.000 Kz</div>
              <div className="text-muted-foreground">Aprovação automática</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-semibold text-yellow-700">3.000.001 - 10.000.000 Kz</div>
              <div className="text-muted-foreground">Aprovação financeiro</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-semibold text-red-700">{'>'}10.000.000 Kz</div>
              <div className="text-muted-foreground">Aprovação direção</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {requisitions.filter(r => r.observacoes).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Observações Importantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {requisitions
                .filter(r => r.observacoes)
                .map(req => (
                  <div key={req.id} className="p-2 border-l-4 border-orange-400 bg-orange-50">
                    <div className="font-semibold text-sm">REQ-{req.id}</div>
                    <div className="text-sm text-muted-foreground">{req.observacoes}</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <RequisitionDetailsModal
        requisition={selectedRequisition}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />
    </div>
  );
}
