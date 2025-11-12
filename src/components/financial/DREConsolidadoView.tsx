import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileDown, AlertTriangle } from "lucide-react";
import { useDREConsolidado } from "@/hooks/useDREConsolidado";
import { formatCurrency } from "@/utils/currency";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

export function DREConsolidadoView() {
  const { data: linhas, isLoading, isError, error, refetch } = useDREConsolidado();

  const totais = linhas?.reduce(
    (acc, linha) => ({
      receita_cliente: acc.receita_cliente + Number(linha.receita_cliente),
      fof_financiamento: acc.fof_financiamento + Number(linha.fof_financiamento),
      foa_auto: acc.foa_auto + Number(linha.foa_auto),
      custos_totais: acc.custos_totais + Number(linha.custos_totais),
      resultado: acc.resultado + Number(linha.resultado),
    }),
    { receita_cliente: 0, fof_financiamento: 0, foa_auto: 0, custos_totais: 0, resultado: 0 }
  );

  const handleExportar = () => {
    if (!linhas || linhas.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }
    toast.info("Exportação em desenvolvimento");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <CardTitle>DEMONSTRAÇÃO DE RESULTADO DE EXERCÍCIOS</CardTitle>
            <CardDescription>Consolidado de todos os projetos</CardDescription>
          </div>
          <Button onClick={handleExportar} variant="outline" size="sm" disabled={!linhas || linhas.length === 0}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isError ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar DRE Consolidado</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>{error?.message || "Ocorreu um erro ao buscar os dados."}</p>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : linhas && linhas.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-primary/90">
                <TableRow className="hover:bg-primary/90">
                  <TableHead className="text-primary-foreground font-bold">Nº</TableHead>
                  <TableHead className="text-primary-foreground font-bold">Projeto</TableHead>
                  <TableHead className="text-right text-primary-foreground font-bold">FOA RECEBIMENTO DO CLIENTE</TableHead>
                  <TableHead className="text-right text-primary-foreground font-bold">FOF FINANCIAMENTO</TableHead>
                  <TableHead className="text-right text-primary-foreground font-bold">FOA AUTO FINANCIAMENTO</TableHead>
                  <TableHead className="text-right text-primary-foreground font-bold">RESULTADO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {linhas.map((linha) => (
                  <TableRow key={linha.numero}>
                    <TableCell className="font-medium">{linha.numero}</TableCell>
                    <TableCell className="font-medium">{linha.projeto_nome}</TableCell>
                    <TableCell className="text-right">{formatCurrency(linha.receita_cliente)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(linha.fof_financiamento)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(linha.foa_auto)}</TableCell>
                    <TableCell className={`text-right font-medium ${
                      linha.resultado >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"
                    }`}>
                      {formatCurrency(linha.resultado)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {totais && (
                <TableFooter className="bg-primary/90">
                  <TableRow className="hover:bg-primary/90">
                    <TableCell colSpan={2} className="font-bold text-primary-foreground">DRE FOA - FOF</TableCell>
                    <TableCell className="text-right font-bold text-primary-foreground">
                      {formatCurrency(totais.receita_cliente)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary-foreground">
                      {formatCurrency(totais.fof_financiamento)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary-foreground">
                      {formatCurrency(totais.foa_auto)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary-foreground">
                      {formatCurrency(totais.resultado)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum dado encontrado
          </div>
        )}
      </CardContent>
    </Card>
  );
}
