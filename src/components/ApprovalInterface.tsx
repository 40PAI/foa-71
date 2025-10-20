
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, AlertTriangle, User, Calendar } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { usePendingApprovals, useApproveRequisition } from "@/hooks/useFinancialIntegration";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ApprovalInterfaceProps {
  projectId: number;
}

export function ApprovalInterface({ projectId }: ApprovalInterfaceProps) {
  const { data: pendingApprovals = [], isLoading } = usePendingApprovals(projectId);
  const approveRequisition = useApproveRequisition();
  const { toast } = useToast();

  const handleApprove = async (requisitionId: number, currentStatus: string) => {
    try {
      let newStatus = currentStatus;
      let approveQuality = false;

      // Determinar próximo status baseado no fluxo
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
      }

      console.log('Aprovando requisição:', { requisitionId, currentStatus, newStatus, approveQuality });

      await approveRequisition.mutateAsync({
        requisitionId,
        newStatus,
        approveQuality
      });

      toast({
        title: "Requisição Aprovada",
        description: `Status alterado para: ${newStatus}`,
      });
    } catch (error) {
      console.error('Erro ao aprovar requisição:', error);
      toast({
        title: "Erro",
        description: "Erro ao aprovar requisição",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (requisitionId: number) => {
    try {
      console.log('Rejeitando requisição:', requisitionId);

      await approveRequisition.mutateAsync({
        requisitionId,
        newStatus: 'Rejeitado'
      });

      toast({
        title: "Requisição Rejeitada",
        description: "A requisição foi rejeitada",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Erro ao rejeitar requisição:', error);
      toast({
        title: "Erro",
        description: "Erro ao rejeitar requisição",
        variant: "destructive",
      });
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Alta': return 'destructive';
      case 'Média': return 'default';
      case 'Baixa': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente': return 'destructive';
      case 'Cotações': return 'default';
      case 'Aprovação Qualidade': return 'default';
      case 'Aprovação Direção': return 'default';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-spin" />
            <p className="text-muted-foreground">Carregando aprovações...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingApprovals.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Todas as Aprovações em Dia</h3>
            <p className="text-muted-foreground">
              Não há requisições pendentes de aprovação neste projeto.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Requisições Pendentes de Aprovação
          <Badge variant="destructive" className="ml-2">
            {pendingApprovals.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Valor (Kz)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Urgência</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Requisitante</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingApprovals.map((approval) => (
              <TableRow key={approval.id}>
                <TableCell className="font-medium">
                  <div className="truncate" title={approval.nome_comercial_produto || 'N/A'}>
                    {approval.nome_comercial_produto || 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {approval.categoria_principal}
                  </Badge>
                </TableCell>
                <TableCell className="font-bold">
                  {formatCurrency(approval.valor)}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(approval.status_fluxo)}>
                    {approval.status_fluxo}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getUrgencyColor(approval.urgencia_prioridade)}>
                    {approval.urgencia_prioridade}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(approval.data_requisicao), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <User className="h-3 w-3" />
                    {approval.requisitante}
                  </div>
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
                      Aprovar
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
                      Rejeitar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
