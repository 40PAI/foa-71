import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, TrendingUp, TrendingDown, Plus, Building2 } from "lucide-react";
import { useResumoFOAGeral, useResumoFOA } from "@/hooks/useResumoFOA";
import { useReembolsosFOA } from "@/hooks/useReembolsosFOA";
import { ReembolsoFOAModal } from "@/components/modals/ReembolsoFOAModal";
import { formatCurrency } from "@/utils/currency";
import { format } from "date-fns";

export function DividaFOAPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<number | undefined>();
  
  // Dados consolidados de todos os projetos
  const { data: totaisGerais, isLoading: loadingTotais } = useResumoFOAGeral();
  
  // Dados detalhados por projeto (chama RPC com null para pegar todos)
  const { data: projetosList, isLoading: loadingProjetos } = useResumoFOA(undefined);
  
  // Histórico de todos os reembolsos (sem filtro de projeto)
  const { data: reembolsos, isLoading: loadingReembolsos } = useReembolsosFOA(undefined);

  const handleNovoReembolso = (projetoId?: number) => {
    setSelectedProjectForModal(projetoId);
    setModalOpen(true);
  };

  if (loadingTotais || loadingProjetos) {
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

  const dividaTotal = totaisGerais?.divida_foa_com_fof || 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ArrowRight className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Controle de Dívida FOA ↔ FOF
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhamento automático consolidado de todos os projetos
          </p>
        </div>
      </div>

      {/* KPIs Consolidados */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FOF Financiamento Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totaisGerais?.fof_financiamento || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total recebido de FOF em todos os projetos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amortização Total</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totaisGerais?.amortizacao || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total amortizado em todos os projetos
            </p>
          </CardContent>
        </Card>

        <Card className={dividaTotal > 0 ? "border-destructive" : "border-green-600"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dívida Total FOA ↔ FOF</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dividaTotal > 0 ? "text-destructive" : "text-green-600"}`}>
              {formatCurrency(dividaTotal)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dividaTotal > 0 ? '⚠️ Saldo a reembolsar' : '✅ Sem dívida'}
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
                    <TableHead className="text-right">Custos Suportados</TableHead>
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
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(projeto.custos_suportados)}
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
