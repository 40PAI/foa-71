import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Building2, 
  Landmark, 
  Users, 
  HelpCircle,
  AlertTriangle,
  Calendar,
  PiggyBank
} from "lucide-react";
import { useResumoFOA } from "@/hooks/useResumoFOA";
import { useReembolsosFOA, useResumoDividas } from "@/hooks/useReembolsosFOA";
import { useProjects } from "@/hooks/useProjects";
import { useFornecedores } from "@/hooks/useFornecedores";
import { ReembolsoFOAModal } from "@/components/modals/ReembolsoFOAModal";
import { formatCurrency } from "@/utils/currency";
import { format, differenceInDays, parseISO } from "date-fns";
import { isCredito, type FonteCredito } from "@/types/dividas";

const fonteIcons = {
  FOF: Building2,
  BANCO: Landmark,
  FORNECEDOR: Users,
  OUTRO: HelpCircle,
};

const fonteLabels = {
  FOF: "FOF",
  BANCO: "Bancos",
  FORNECEDOR: "Fornecedores",
  OUTRO: "Outros",
};

export function DividaFOAPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<number | undefined>();
  const [activeTab, setActiveTab] = useState<string>("todas");
  
  // Dados
  const { data: projetosList, isLoading: loadingProjetos } = useResumoFOA(undefined);
  const { data: reembolsos, isLoading: loadingReembolsos } = useReembolsosFOA(undefined);
  const { data: resumoDividas, isLoading: loadingResumo } = useResumoDividas();
  const { data: projects = [] } = useProjects();
  const { data: fornecedores = [] } = useFornecedores();

  const handleNovoMovimento = (projetoId?: number) => {
    setSelectedProjectForModal(projetoId);
    setModalOpen(true);
  };

  // Calcular totais gerais - incluindo FOF financiamentos de movimentos_financeiros
  const totaisGerais = useMemo(() => {
    // Inicializar com valores dos FOF Financiamentos (movimentos_financeiros)
    let fof_financiamento_total = 0;
    let fof_amortizacao_total = 0;
    
    if (projetosList && projetosList.length > 0) {
      projetosList.forEach(projeto => {
        fof_financiamento_total += Number(projeto.fof_financiamento) || 0;
        fof_amortizacao_total += Number(projeto.amortizacao) || 0;
      });
    }

    // Adicionar dados de reembolsos_foa_fof (outras fontes: Bancos, Fornecedores, Outros)
    const resultado = (reembolsos || []).reduce(
      (acc, mov) => {
        if (isCredito(mov.tipo)) {
          // Só adicionar créditos de outras fontes (não FOF, pois já contamos de movimentos_financeiros)
          if (mov.fonte_credito !== 'FOF') {
            acc.total_creditos += mov.valor;
            acc.por_fonte[mov.fonte_credito || 'OUTRO'] = (acc.por_fonte[mov.fonte_credito || 'OUTRO'] || 0) + mov.valor;
          }
        } else if (mov.tipo === 'amortizacao') {
          // Só adicionar amortizações de outras fontes
          if (mov.fonte_credito !== 'FOF') {
            acc.total_amortizado += mov.valor;
          }
        } else if (mov.tipo === 'juro') {
          acc.total_juros += mov.valor;
        }
        return acc;
      },
      { 
        total_creditos: 0, 
        total_amortizado: 0, 
        total_juros: 0,
        por_fonte: { FOF: 0, BANCO: 0, FORNECEDOR: 0, OUTRO: 0 } as Record<FonteCredito, number>
      }
    );

    // Combinar FOF (de movimentos_financeiros) com outras fontes (de reembolsos_foa_fof)
    const total_creditos = fof_financiamento_total + resultado.total_creditos;
    const total_amortizado = fof_amortizacao_total + resultado.total_amortizado;
    
    return {
      total_creditos,
      total_amortizado,
      total_juros: resultado.total_juros,
      divida_total: total_creditos - total_amortizado,
      por_fonte: {
        FOF: fof_financiamento_total, // FOF vem de movimentos_financeiros
        BANCO: resultado.por_fonte.BANCO,
        FORNECEDOR: resultado.por_fonte.FORNECEDOR,
        OUTRO: resultado.por_fonte.OUTRO,
      }
    };
  }, [reembolsos, projetosList]);

  // Alertas de vencimento (próximos 30 dias)
  const alertasVencimento = useMemo(() => {
    if (!reembolsos) return [];
    
    const hoje = new Date();
    return reembolsos
      .filter(mov => mov.data_vencimento && mov.tipo === 'credito')
      .map(mov => {
        const dataVenc = parseISO(mov.data_vencimento!);
        const diasRestantes = differenceInDays(dataVenc, hoje);
        return { ...mov, diasRestantes };
      })
      .filter(mov => mov.diasRestantes > 0 && mov.diasRestantes <= 30)
      .sort((a, b) => a.diasRestantes - b.diasRestantes);
  }, [reembolsos]);

  // Filtrar movimentos por tab
  const movimentosFiltrados = useMemo(() => {
    if (!reembolsos) return [];
    if (activeTab === "todas") return reembolsos;
    return reembolsos.filter(mov => mov.fonte_credito === activeTab);
  }, [reembolsos, activeTab]);

  // Função para obter nome do credor
  const getNomeCredor = (mov: typeof reembolsos extends (infer T)[] ? T : never) => {
    if (mov.fonte_credito === 'FOF') return 'FOF';
    if (mov.fonte_credito === 'FORNECEDOR' && mov.fornecedor_id) {
      const fornecedor = fornecedores.find(f => f.id === mov.fornecedor_id);
      return fornecedor?.nome || 'Fornecedor';
    }
    return mov.credor_nome || 'N/A';
  };

  if (loadingProjetos || loadingReembolsos) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <PiggyBank className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
              Controle de Dívidas
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Gestão consolidada de créditos e financiamentos
            </p>
          </div>
        </div>
        <Button onClick={() => handleNovoMovimento()} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Novo Movimento
        </Button>
      </div>

      {/* KPIs Consolidados */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader size="sm" className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Créditos</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </CardHeader>
          <CardContent size="sm">
            <div className="text-base sm:text-lg lg:text-xl font-bold text-green-600 truncate">
              {formatCurrency(totaisGerais.total_creditos)}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              Recebido em financiamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader size="sm" className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Amortizado</CardTitle>
            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
          </CardHeader>
          <CardContent size="sm">
            <div className="text-base sm:text-lg lg:text-xl font-bold text-orange-600 truncate">
              {formatCurrency(totaisGerais.total_amortizado)}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              Pagamentos realizados
            </p>
          </CardContent>
        </Card>

        <Card className={totaisGerais.divida_total > 0 ? "border-destructive" : "border-green-600"}>
          <CardHeader size="sm" className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs sm:text-sm font-medium">Dívida Total</CardTitle>
            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
          </CardHeader>
          <CardContent size="sm">
            <div className={`text-base sm:text-lg lg:text-xl font-bold truncate ${totaisGerais.divida_total > 0 ? "text-destructive" : "text-green-600"}`}>
              {formatCurrency(totaisGerais.divida_total)}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {totaisGerais.divida_total > 0 ? '⚠️ A reembolsar' : '✅ Sem dívida'}
            </p>
          </CardContent>
        </Card>

        <Card className={alertasVencimento.length > 0 ? "border-warning" : ""}>
          <CardHeader size="sm" className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs sm:text-sm font-medium">Próx. Vencimento</CardTitle>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
          </CardHeader>
          <CardContent size="sm">
            <div className="text-base sm:text-lg lg:text-xl font-bold text-amber-600 truncate">
              {alertasVencimento.length > 0 
                ? format(parseISO(alertasVencimento[0].data_vencimento!), 'dd/MM/yy')
                : '-'}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {alertasVencimento.length > 0 
                ? `${alertasVencimento[0].diasRestantes} dias restantes`
                : 'Sem vencimentos próximos'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Vencimento */}
      {alertasVencimento.length > 0 && (
        <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader size="sm" className="pb-2">
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              Alertas de Vencimento
            </CardTitle>
          </CardHeader>
          <CardContent size="sm">
            <div className="space-y-2">
              {alertasVencimento.slice(0, 3).map((alerta) => (
                <div key={alerta.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {fonteIcons[alerta.fonte_credito || 'FOF'] && 
                      (() => { const Icon = fonteIcons[alerta.fonte_credito || 'FOF']; return <Icon className="h-4 w-4" />; })()
                    }
                    <span className="font-medium">{getNomeCredor(alerta)}</span>
                    <span className="text-muted-foreground">•</span>
                    <span>{formatCurrency(alerta.valor)}</span>
                  </div>
                  <Badge variant={alerta.diasRestantes <= 7 ? "destructive" : "outline"}>
                    {alerta.diasRestantes} dias
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Breakdown por Fonte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Dívidas por Fonte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.keys(fonteIcons) as FonteCredito[]).map((fonte) => {
              const Icon = fonteIcons[fonte];
              const valor = totaisGerais.por_fonte[fonte] || 0;
              return (
                <div key={fonte} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                  <div className="p-2 rounded-full bg-background">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{fonteLabels[fonte]}</p>
                    <p className="font-bold truncate">{formatCurrency(valor)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Histórico com Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Movimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full flex flex-wrap h-auto gap-1 mb-4">
              <TabsTrigger value="todas" className="flex-1 min-w-[60px]">Todas</TabsTrigger>
              {(Object.keys(fonteLabels) as FonteCredito[]).map((fonte) => (
                <TabsTrigger key={fonte} value={fonte} className="flex-1 min-w-[60px]">
                  {fonteLabels[fonte]}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {movimentosFiltrados.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Fonte</TableHead>
                        <TableHead>Credor</TableHead>
                        <TableHead>Projeto</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead>Vencimento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movimentosFiltrados.map((mov) => {
                        const Icon = fonteIcons[mov.fonte_credito || 'FOF'];
                        const projeto = projects.find(p => p.id === mov.projeto_id);
                        const isCred = isCredito(mov.tipo);
                        
                        return (
                          <TableRow key={mov.id}>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(mov.data_reembolso), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs">{fonteLabels[mov.fonte_credito || 'FOF']}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {getNomeCredor(mov)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {projeto?.nome || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={isCred ? 'default' : mov.tipo === 'juro' ? 'outline' : 'secondary'}>
                                {isCred ? 'Crédito' : mov.tipo === 'amortizacao' ? 'Amortização' : 'Juros'}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {mov.descricao}
                            </TableCell>
                            <TableCell className="text-right font-bold whitespace-nowrap">
                              <span className={isCred ? 'text-green-600' : 'text-orange-600'}>
                                {isCred ? '+' : '-'}{formatCurrency(mov.valor)}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap">
                              {mov.data_vencimento 
                                ? format(parseISO(mov.data_vencimento), 'dd/MM/yy') 
                                : '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum movimento encontrado
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Breakdown por Projeto (FOF apenas) */}
      {projetosList && projetosList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Breakdown FOF por Projeto
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}

      <ReembolsoFOAModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        projectId={selectedProjectForModal}
      />
    </div>
  );
}

export default DividaFOAPage;
