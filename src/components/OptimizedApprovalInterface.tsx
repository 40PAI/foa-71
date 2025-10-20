
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, Clock, AlertCircle, Package } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useOptimizedPendingApprovals, useOptimizedApproveRequisition } from "@/hooks/useOptimizedFinancialIntegration";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";

interface OptimizedApprovalInterfaceProps {
  projectId: number;
}

export function OptimizedApprovalInterface({ projectId }: OptimizedApprovalInterfaceProps) {
  const { data: approvals = [], isLoading, refetch } = useOptimizedPendingApprovals(projectId);
  const approveRequisition = useOptimizedApproveRequisition();
  const { toast } = useToast();

  // Memoize calculations to avoid unnecessary re-renders
  const stats = useMemo(() => {
    const totalValue = approvals.reduce((sum, approval) => sum + Number(approval.valor), 0);
    const highPriorityCount = approvals.filter(approval => approval.urgencia_prioridade === 'Alta').length;
    const pendingCount = approvals.filter(approval => approval.status_fluxo === 'Pendente').length;
    
    return { totalValue, highPriorityCount, pendingCount };
  }, [approvals]);

  const handleApprove = async (requisitionId: number, currentStatus: string) => {
    try {
      let newStatus = '';
      let approveQuality = false;
      
      console.log('Iniciando aprovação:', { requisitionId, currentStatus });
      
      // Determine next status based on current status
      switch (currentStatus) {
        case 'Pendente':
          newStatus = 'Cotações';
          break;
        case 'Cotações':
          newStatus = 'Aprovação Qualidade';
          break;
        case 'Aprovação Qualidade':
          newStatus = 'Aprovação Direção';
          approveQuality = true;
          break;
        case 'Aprovação Direção':
          newStatus = 'OC Gerada';
          break;
        default:
          console.error('Status não reconhecido:', currentStatus);
          toast({
            title: "Erro de Status",
            description: `Status '${currentStatus}' não pode ser aprovado`,
            variant: "destructive",
          });
          return;
      }

      console.log('Executando aprovação:', { requisitionId, newStatus, approveQuality });

      await approveRequisition.mutateAsync({
        requisitionId,
        newStatus,
        approveQuality
      });

      console.log('Aprovação executada com sucesso');

      toast({
        title: "Requisição Aprovada",
        description: `Status alterado para: ${newStatus}`,
      });

      // Refresh data after successful approval
      setTimeout(() => {
        refetch();
      }, 500);

    } catch (error) {
      console.error('Erro detalhado na aprovação:', error);
      
      let errorMessage = "Erro desconhecido ao aprovar requisição";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as any).message;
      }

      toast({
        title: "Erro ao Aprovar",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleReject = async (requisitionId: number) => {
    try {
      console.log('Iniciando rejeição:', { requisitionId });
      
      await approveRequisition.mutateAsync({
        requisitionId,
        newStatus: 'Rejeitado',
        approveQuality: false
      });

      console.log('Rejeição executada com sucesso');

      toast({
        title: "Requisição Rejeitada",
        description: "A requisição foi rejeitada com sucesso",
        variant: "destructive",
      });

      // Refresh data after successful rejection
      setTimeout(() => {
        refetch();
      }, 500);

    } catch (error) {
      console.error('Erro detalhado na rejeição:', error);
      
      let errorMessage = "Erro desconhecido ao rejeitar requisição";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as any).message;
      }

      toast({
        title: "Erro ao Rejeitar",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Pendente': { variant: 'secondary' as const, icon: Clock },
      'Cotações': { variant: 'outline' as const, icon: Package },
      'Aprovação Qualidade': { variant: 'default' as const, icon: CheckCircle },
      'Aprovação Direção': { variant: 'default' as const, icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, icon: Clock };
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aprovações Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Aprovações Pendentes
        </CardTitle>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{approvals.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.highPriorityCount}</div>
            <div className="text-sm text-muted-foreground">Alta Prioridade</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</div>
            <div className="text-sm text-muted-foreground">Valor Total</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {approvals.length === 0 ? (
          <div className="text-center p-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sem Aprovações Pendentes</h3>
            <p className="text-muted-foreground">
              Todas as requisições foram processadas.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvals.map((approval) => (
                <TableRow key={approval.id}>
                  <TableCell className="font-medium">
                    <div className="truncate" title={approval.nome_comercial_produto}>
                      {approval.nome_comercial_produto}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {approval.requisitante}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{approval.categoria_principal}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(Number(approval.valor))}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(approval.status_fluxo)}
                  </TableCell>
                  <TableCell>
                    {new Date(approval.data_requisicao).toLocaleDateString('pt-PT')}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={approval.urgencia_prioridade === 'Alta' ? 'destructive' : 
                               approval.urgencia_prioridade === 'Média' ? 'default' : 'secondary'}
                    >
                      {approval.urgencia_prioridade}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(approval.id, approval.status_fluxo)}
                        disabled={approveRequisition.isPending}
                        className="h-8 px-3 text-xs"
                        title="Aprovar"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {approveRequisition.isPending ? 'Processando...' : 'Aprovar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(approval.id)}
                        disabled={approveRequisition.isPending}
                        className="h-8 px-3 text-xs"
                        title="Rejeitar"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        {approveRequisition.isPending ? 'Processando...' : 'Rejeitar'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
