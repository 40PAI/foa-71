import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useDetailedExpenseBreakdown } from "@/hooks/useIntegratedFinances";

interface DiscrepancyReportProps {
  projectId: number;
}

export function DiscrepancyReport({ projectId }: DiscrepancyReportProps) {
  const { data: discrepancies = [], isLoading } = useDetailedExpenseBreakdown(projectId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Verificação de Discrepâncias
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Analisando discrepâncias...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasDiscrepancies = discrepancies.some(d => Math.abs(d.discrepancia) > 0);

  if (!hasDiscrepancies) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Verificação de Discrepâncias
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Dados Consistentes</h3>
            <p className="text-muted-foreground">
              Não foram encontradas discrepâncias entre os dados manuais e calculados.
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
          Relatório de Discrepâncias
          <Badge variant="destructive" className="ml-2">
            {discrepancies.filter(d => Math.abs(d.discrepancia) > 0).length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead>Gasto Manual (Kz)</TableHead>
              <TableHead>Gasto Calculado (Kz)</TableHead>
              <TableHead>Discrepância (Kz)</TableHead>
              <TableHead>% Discrepância</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discrepancies.map((discrepancy, index) => {
              const discrepancyValue = discrepancy.discrepancia;
              const percentualDiscrepancy = (discrepancy.valor_calculado > 0) 
                ? ((discrepancyValue / discrepancy.valor_calculado) * 100) 
                : 0;
              const hasDiscrepancy = Math.abs(discrepancyValue) > 0;
              
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">{discrepancy.categoria}</TableCell>
                  <TableCell>{formatCurrency(discrepancy.valor_manual)}</TableCell>
                  <TableCell>{formatCurrency(discrepancy.valor_calculado)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {discrepancyValue > 0 ? (
                        <TrendingUp className="h-4 w-4 text-red-600" />
                      ) : discrepancyValue < 0 ? (
                        <TrendingDown className="h-4 w-4 text-green-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      <span className={`font-medium ${
                        discrepancyValue > 0 ? 'text-red-600' : 
                        discrepancyValue < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {formatCurrency(Math.abs(discrepancyValue))}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      Math.abs(percentualDiscrepancy) > 10 ? 'text-red-600' :
                      Math.abs(percentualDiscrepancy) > 5 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {percentualDiscrepancy.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      !hasDiscrepancy ? "default" :
                      Math.abs(percentualDiscrepancy) > 10 ? "destructive" :
                      Math.abs(percentualDiscrepancy) > 5 ? "secondary" : "outline"
                    }>
                      {!hasDiscrepancy ? "OK" :
                       Math.abs(percentualDiscrepancy) > 10 ? "Crítica" :
                       Math.abs(percentualDiscrepancy) > 5 ? "Atenção" : "Menor"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}