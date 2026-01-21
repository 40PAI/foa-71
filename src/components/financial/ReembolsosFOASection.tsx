import { useState } from "react";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useReembolsosFOA } from "@/hooks/useReembolsosFOA";
import { useResumoFOA } from "@/hooks/useResumoFOA";
import { ReembolsoFOAModal } from "@/components/modals/ReembolsoFOAModal";
import { formatCurrency } from "@/utils/currency";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { isCredito } from "@/types/dividas";

interface ReembolsosFOASectionProps {
  projectId?: number; // Agora é opcional
}

export function ReembolsosFOASection({ projectId }: ReembolsosFOASectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: reembolsos, isLoading: loadingReembolsos } = useReembolsosFOA(projectId);
  const { data: resumoData, isLoading: loadingResumo } = useResumoFOA(projectId);
  
  // Pegar o primeiro (e único) projeto do array
  const resumo = resumoData && resumoData.length > 0 ? resumoData[0] : null;

  if (loadingReembolsos || loadingResumo) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FOF Financiamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(resumo?.fof_financiamento || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de custos financiados pela FOF (saídas)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amortização FOA</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(resumo?.amortizacao || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total amortizado para FOF
            </p>
          </CardContent>
        </Card>

        <Card className={resumo && resumo.divida_foa_com_fof > 0 ? "border-destructive" : "border-green-600"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dívida FOA ↔ FOF</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${resumo && resumo.divida_foa_com_fof > 0 ? "text-destructive" : "text-green-600"}`}>
              {formatCurrency(resumo?.divida_foa_com_fof || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {resumo && resumo.divida_foa_com_fof > 0 ? '⚠️ A reembolsar' : '✅ Sem dívida'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Reembolsos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Histórico de Reembolsos FOA ↔ FOF</CardTitle>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Reembolso
          </Button>
        </CardHeader>
        <CardContent>
          {reembolsos && reembolsos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reembolsos.map((reembolso) => {
                  const isCred = isCredito(reembolso.tipo);
                  return (
                    <TableRow key={reembolso.id}>
                      <TableCell>{format(new Date(reembolso.data_reembolso), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={isCred ? 'default' : 'secondary'}>
                          {isCred ? 'Crédito' : reembolso.tipo === 'juro' ? 'Juros' : 'Amortização'}
                        </Badge>
                      </TableCell>
                      <TableCell>{reembolso.descricao}</TableCell>
                      <TableCell className="text-right font-bold">
                        <span className={isCred ? 'text-green-600' : 'text-orange-600'}>
                          {isCred ? '+' : '-'}{formatCurrency(reembolso.valor)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {reembolso.observacoes || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
        projectId={projectId}
      />
    </div>
  );
}
