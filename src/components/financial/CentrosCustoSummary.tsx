import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { useSaldosCentrosCusto } from "@/hooks/useCentrosCusto";
import { formatCurrencyInput } from "@/utils/currency";
import { useNavigate } from "react-router-dom";

interface CentrosCustoSummaryProps {
  projectId: number;
}

export function CentrosCustoSummary({ projectId }: CentrosCustoSummaryProps) {
  const { data: saldos, isLoading } = useSaldosCentrosCusto(projectId);
  const navigate = useNavigate();

  const getStatusColor = (percentual: number) => {
    if (percentual >= 100) return "destructive";
    if (percentual >= 90) return "destructive";
    if (percentual >= 80) return "secondary";
    return "default";
  };

  const getStatusText = (percentual: number) => {
    if (percentual >= 100) return "Excedido";
    if (percentual >= 90) return "Crítico";
    if (percentual >= 80) return "Atenção";
    return "Normal";
  };

  const centrosEmAlerta = saldos?.filter(s => s.percentual_utilizado >= 80).length || 0;
  const topCentros = saldos?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {centrosEmAlerta > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-medium">
                {centrosEmAlerta} centro{centrosEmAlerta > 1 ? 's' : ''} de custo {centrosEmAlerta > 1 ? 'estão' : 'está'} acima de 80% do orçamento
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Top 5 Centros de Custo por Utilização</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/centros-custo')}
            className="gap-2"
          >
            Ver Todos
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {topCentros.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum centro de custo polo cadastrado.</p>
              <Button 
                variant="link" 
                onClick={() => navigate('/centros-custo')}
                className="mt-2"
              >
                Criar primeiro centro de custo polo
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Orçamento</TableHead>
                  <TableHead className="text-right">Gasto</TableHead>
                  <TableHead>Utilização</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCentros.map((saldo) => (
                  <TableRow key={saldo.centro_custo_id}>
                    <TableCell className="font-mono text-sm">{saldo.codigo}</TableCell>
                    <TableCell className="font-medium">{saldo.nome}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrencyInput(saldo.orcamento_mensal)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrencyInput(saldo.total_saidas)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={Math.min(saldo.percentual_utilizado, 100)} 
                          className="w-[80px]"
                        />
                        <span className="text-sm font-medium">
                          {Math.round(saldo.percentual_utilizado)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(saldo.percentual_utilizado)}>
                        {getStatusText(saldo.percentual_utilizado)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
