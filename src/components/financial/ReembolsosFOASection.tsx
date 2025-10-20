import { useState } from "react";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useReembolsosFOA, useReembolsosAcumulados } from "@/hooks/useReembolsosFOA";
import { ReembolsoFOAModal } from "@/components/modals/ReembolsoFOAModal";
import { formatCurrency } from "@/utils/currency";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface ReembolsosFOASectionProps {
  projectId: number;
}

export function ReembolsosFOASection({ projectId }: ReembolsosFOASectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: reembolsos, isLoading } = useReembolsosFOA(projectId);
  const { data: totais } = useReembolsosAcumulados(projectId);

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financiamento FOF</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totais?.aporte || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total recebido de FOF</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amortização FOA</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totais?.amortizacao || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total devolvido para FOF</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo em Aberto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totais?.saldo || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totais && totais.saldo > 0 ? 'A favor de FOA' : totais && totais.saldo < 0 ? 'Em dívida com FOF' : 'Equilibrado'}
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
                {reembolsos.map((reembolso) => (
                  <TableRow key={reembolso.id}>
                    <TableCell>{format(new Date(reembolso.data_reembolso), 'dd/MM/yyyy')}</TableCell>
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
