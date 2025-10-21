import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProjectState } from "@/hooks/useContextHooks";
import {
  useContasFornecedores,
  useSaldoContaFornecedor,
  useKPIsContasFornecedores,
  useLancamentosFornecedor,
} from "@/hooks/useContasFornecedores";
import { formatCurrency } from "@/utils/currency";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LancamentoFornecedorModal } from "@/components/modals/LancamentoFornecedorModal";
import { ContaFornecedorModal } from "@/components/modals/ContaFornecedorModal";
import { AmortizacaoFornecedorModal } from "@/components/modals/AmortizacaoFornecedorModal";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ContasCorrentesSection } from "@/components/financial/ContasCorrentesSection";

export default function ContasFornecedoresPage() {
  const { projectData } = useProjectState();
  const [selectedConta, setSelectedConta] = useState<string | null>(null);
  const [lancamentoModalOpen, setLancamentoModalOpen] = useState(false);
  const [contaModalOpen, setContaModalOpen] = useState(false);
  const [amortizacaoModalOpen, setAmortizacaoModalOpen] = useState(false);

  const { data: contas, isLoading } = useContasFornecedores(projectData?.id);
  const kpis = useKPIsContasFornecedores(projectData?.id);

  if (!projectData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Selecione um projeto para visualizar as contas correntes</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contas Correntes - Fornecedores</h1>
        <p className="text-muted-foreground">Projeto: {projectData?.nome}</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalContas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crédito Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(kpis.totalCredito)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Débito Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(kpis.totalDebito)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpis.saldoLiquido >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(kpis.saldoLiquido)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contas Correntes Section - Only Fornecedores */}
      <ContasCorrentesSection projectId={projectData?.id} mode="fornecedores" />

      {/* Tabela de Contas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Contas Correntes por Fornecedor</CardTitle>
          <div className="flex gap-2">
            <Button onClick={() => setContaModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Crédito
            </Button>
            <Button variant="outline" onClick={() => setAmortizacaoModalOpen(true)}>
              Amortização
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : contas && contas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>NIF</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Saldo Inicial</TableHead>
                  <TableHead className="text-right">Crédito</TableHead>
                  <TableHead className="text-right">Débito</TableHead>
                  <TableHead className="text-right">Saldo Atual</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contas.map((conta: any) => (
                  <ContaRow key={conta.id} conta={conta} />
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>Nenhuma conta corrente registrada</p>
              <p className="text-sm">Crie uma conta para começar o controlo de crédito com fornecedores</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ContaFornecedorModal open={contaModalOpen} onOpenChange={setContaModalOpen} />

      <AmortizacaoFornecedorModal 
        open={amortizacaoModalOpen} 
        onOpenChange={setAmortizacaoModalOpen}
        projectId={projectData?.id}
      />

      {selectedConta && (
        <LancamentoFornecedorModal
          open={lancamentoModalOpen}
          onOpenChange={setLancamentoModalOpen}
          contaFornecedorId={selectedConta}
        />
      )}
    </div>
  );
}

function ContaRow({ conta }: { conta: any }) {
  const [expanded, setExpanded] = useState(false);
  const { data: lancamentos } = useLancamentosFornecedor(expanded ? conta.id : undefined);

  const saldoAtual = conta.saldo?.saldo_atual || 0;
  const status = saldoAtual > 0 ? "credito" : saldoAtual < 0 ? "debito" : "zerado";

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{conta.fornecedores?.nome || "N/A"}</TableCell>
        <TableCell>{conta.fornecedores?.nif || "-"}</TableCell>
        <TableCell>
          <Badge variant="outline">{conta.fornecedores?.categoria_principal || "N/A"}</Badge>
        </TableCell>
        <TableCell className="text-right">{formatCurrency(conta.saldo_inicial)}</TableCell>
        <TableCell className="text-right text-green-600">{formatCurrency(conta.saldo?.total_credito || 0)}</TableCell>
        <TableCell className="text-right text-red-600">{formatCurrency(conta.saldo?.total_debito || 0)}</TableCell>
        <TableCell className="text-right font-bold">
          <span className={status === "credito" ? "text-green-600" : status === "debito" ? "text-red-600" : ""}>
            {formatCurrency(saldoAtual)}
          </span>
        </TableCell>
        <TableCell className="text-center">
          <Badge variant={status === "credito" ? "default" : status === "debito" ? "destructive" : "secondary"}>
            {status === "credito" ? "A Favor" : status === "debito" ? "Em Dívida" : "Zerado"}
          </Badge>
        </TableCell>
        <TableCell>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            {lancamentos?.length || 0} Lançamentos
          </Button>
        </TableCell>
      </TableRow>

      {expanded && lancamentos && lancamentos.length > 0 && (
        <TableRow>
          <TableCell colSpan={9} className="bg-muted/50 p-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Material Recebido / Lançamentos:</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Centro de Custo</TableHead>
                    <TableHead className="text-right">Crédito</TableHead>
                    <TableHead className="text-right">Débito</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lancamentos.map((lanc: any) => (
                    <TableRow key={lanc.id}>
                      <TableCell>{new Date(lanc.data_lancamento).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{lanc.descricao}</TableCell>
                      <TableCell>
                        {lanc.centros_custo ? (
                          <Badge variant="outline">
                            {lanc.centros_custo.codigo} - {lanc.centros_custo.nome}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {lanc.credito ? formatCurrency(lanc.credito) : "-"}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {lanc.debito ? formatCurrency(lanc.debito) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(lanc.saldo_corrente || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
