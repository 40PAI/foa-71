import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, TrendingUp, TrendingDown, Plus, Building2 } from "lucide-react";
import { useResumoFOA } from "@/hooks/useResumoFOA";
import { useReembolsosFOA } from "@/hooks/useReembolsosFOA";
import { ReembolsoFOAModal } from "@/components/modals/ReembolsoFOAModal";
import { formatCurrency } from "@/utils/currency";
import { format } from "date-fns";

export function DividaFOAPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<number | undefined>();
  
  // Dados detalhados por projeto (chama RPC com null para pegar todos)
  const { data: projetosList, isLoading: loadingProjetos } = useResumoFOA(undefined);
  
  // Histórico de todos os reembolsos (sem filtro de projeto)
  const { data: reembolsos, isLoading: loadingReembolsos } = useReembolsosFOA(undefined);

  const handleNovoReembolso = (projetoId?: number) => {
    setSelectedProjectForModal(projetoId);
    setModalOpen(true);
  };

  // Calcular totais directamente dos dados da tabela para garantir consistência
  const totaisGerais = useMemo(() => {
    if (!projetosList || projetosList.length === 0) {
      return { fof_financiamento: 0, amortizacao: 0, divida_foa_com_fof: 0 };
    }
    return projetosList.reduce(
      (acc, curr) => ({
        fof_financiamento: acc.fof_financiamento + (Number(curr.fof_financiamento) || 0),
        amortizacao: acc.amortizacao + (Number(curr.amortizacao) || 0),
        divida_foa_com_fof: acc.divida_foa_com_fof + (Number(curr.divida_foa_com_fof) || 0),
      }),
      { fof_financiamento: 0, amortizacao: 0, divida_foa_com_fof: 0 }
    );
  }, [projetosList]);

  if (loadingProjetos) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const dividaTotal = totaisGerais.divida_foa_com_fof;

  return (
    <div className="w-full mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3">
        <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Controle de Dívida FOA ↔ FOF
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Acompanhamento automático consolidado de todos os projetos
          </p>
        </div>
      </div>

      {/* KPIs Consolidados */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="max-h-28">
          <CardHeader size="sm" className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs sm:text-sm font-medium">FOF Financiamento</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </CardHeader>
          <CardContent size="sm">
            <div className="text-base sm:text-lg lg:text-xl font-bold text-green-600 truncate">
              {formatCurrency(totaisGerais?.fof_financiamento || 0)}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              Custos financiados pela FOF
            </p>
          </CardContent>
        </Card>

        <Card className="max-h-28">
          <CardHeader size="sm" className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs sm:text-sm font-medium">Amortização</CardTitle>
            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
          </CardHeader>
          <CardContent size="sm">
            <div className="text-base sm:text-lg lg:text-xl font-bold text-orange-600 truncate">
              {formatCurrency(totaisGerais?.amortizacao || 0)}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              Total amortizado
            </p>
          </CardContent>
        </Card>

        <Card className={`max-h-28 ${dividaTotal > 0 ? "border-destructive" : "border-green-600"}`}>
          <CardHeader size="sm" className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs sm:text-sm font-medium">Dívida FOA ↔ FOF</CardTitle>
          </CardHeader>
          <CardContent size="sm">
            <div className={`text-base sm:text-lg lg:text-xl font-bold truncate ${dividaTotal > 0 ? "text-destructive" : "text-green-600"}`}>
              {formatCurrency(dividaTotal)}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {dividaTotal > 0 ? '⚠️ A reembolsar' : '✅ Sem dívida'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown por Projeto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Breakdown por Projeto
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projetosList && projetosList.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projeto</TableHead>
                    <TableHead className="text-right">FOF Financiamento</TableHead>
                    <TableHead className="text-right">Amortização</TableHead>
                    <TableHead className="text-right">Dívida</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projetosList.map((projeto) => {
                    const temDivida = projeto.divida_foa_com_fof > 0;
                    return (
                      <TableRow key={projeto.projeto_id}>
                        <TableCell className="font-medium">{projeto.projeto_nome}</TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatCurrency(projeto.fof_financiamento)}
                        </TableCell>
                        <TableCell className="text-right text-orange-600">
                          {formatCurrency(projeto.amortizacao)}
                        </TableCell>
                        <TableCell className={`text-right font-bold ${temDivida ? 'text-destructive' : 'text-green-600'}`}>
                          {formatCurrency(projeto.divida_foa_com_fof)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={temDivida ? "destructive" : "default"}>
                            {temDivida ? 'Pendente' : 'Quitado'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum movimento FOF encontrado nos projetos
            </p>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Reembolsos - Todos os Projetos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Histórico Consolidado de Reembolsos</CardTitle>
          <Button onClick={() => handleNovoReembolso()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Reembolso
          </Button>
        </CardHeader>
        <CardContent>
          {loadingReembolsos ? (
            <Skeleton className="h-64 w-full" />
          ) : reembolsos && reembolsos.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reembolsos.map((reembolso) => (
                    <TableRow key={reembolso.id}>
                      <TableCell>{format(new Date(reembolso.data_reembolso), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="font-medium">
                        {projetosList?.find(p => p.projeto_id === reembolso.projeto_id)?.projeto_nome || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={reembolso.tipo === 'aporte' ? 'default' : 'secondary'}>
                          {reembolso.tipo === 'aporte' ? 'Aporte FOF' : 'Amortização FOA'}
                        </Badge>
                      </TableCell>
                      <TableCell>{reembolso.descricao}</TableCell>
                      <TableCell className="text-right font-bold">
                        <span className={reembolso.tipo === 'aporte' ? 'text-green-600' : 'text-orange-600'}>
                          {reembolso.tipo === 'aporte' ? '+' : '-'}{formatCurrency(reembolso.valor)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {reembolso.observacoes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum reembolso registrado
            </p>
          )}
        </CardContent>
      </Card>

      <ReembolsoFOAModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        projectId={selectedProjectForModal}
      />
    </div>
  );
}

export default DividaFOAPage;
