import { useState } from "react";
import { useProjectState } from "@/hooks/useContextHooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDREPorCentro, useSalvarDRE } from "@/hooks/useDREPorCentro";
import { formatCurrency } from "@/utils/currency";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FileDown, Save } from "lucide-react";
import { toast } from "sonner";

export default function DREPage() {
  const { selectedProjectId, projectData } = useProjectState();
  const currentDate = new Date();
  const [mes, setMes] = useState(currentDate.getMonth() + 1);
  const [ano, setAno] = useState(currentDate.getFullYear());

  const { data: dreLinhas, isLoading } = useDREPorCentro(
    selectedProjectId || 0,
    mes,
    ano
  );
  
  const salvarDRE = useSalvarDRE();

  if (!selectedProjectId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Selecione um projeto para visualizar o DRE
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSalvar = () => {
    if (!dreLinhas) return;
    
    salvarDRE.mutate({
      projectId: selectedProjectId,
      mes,
      ano,
      linhas: dreLinhas,
    });
  };

  const handleExportar = () => {
    toast.info("Funcionalidade de exportação será implementada em breve");
  };

  const totais = dreLinhas?.reduce(
    (acc, linha) => ({
      receita_cliente: acc.receita_cliente + Number(linha.receita_cliente),
      fof_financiamento: acc.fof_financiamento + Number(linha.fof_financiamento),
      foa_auto: acc.foa_auto + Number(linha.foa_auto),
      custos_totais: acc.custos_totais + Number(linha.custos_totais),
      resultado: acc.resultado + Number(linha.resultado),
    }),
    {
      receita_cliente: 0,
      fof_financiamento: 0,
      foa_auto: 0,
      custos_totais: 0,
      resultado: 0,
    }
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">DRE - Demonstração de Resultados</h1>
          <p className="text-muted-foreground">
            Projeto: {projectData?.project?.nome || "Nenhum projeto selecionado"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportar} variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button onClick={handleSalvar} disabled={!dreLinhas || salvarDRE.isPending}>
            <Save className="mr-2 h-4 w-4" />
            Salvar DRE
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div>
              <CardTitle>Período</CardTitle>
              <CardDescription>Selecione o mês e ano para análise</CardDescription>
            </div>
            <div className="flex gap-2 ml-auto">
              <Select value={mes.toString()} onValueChange={(v) => setMes(parseInt(v))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {new Date(2024, m - 1).toLocaleDateString("pt-BR", { month: "long" })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={ano.toString()} onValueChange={(v) => setAno(parseInt(v))}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i).map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : dreLinhas && dreLinhas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Centro de Custo</TableHead>
                  <TableHead className="text-right">Receita Cliente</TableHead>
                  <TableHead className="text-right">FOF Financiamento</TableHead>
                  <TableHead className="text-right">FOA Auto</TableHead>
                  <TableHead className="text-right">Custos Totais</TableHead>
                  <TableHead className="text-right">Resultado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dreLinhas.map((linha) => (
                  <TableRow key={linha.centro_custo_id}>
                    <TableCell className="font-medium">{linha.centro_nome}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(linha.receita_cliente)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(linha.fof_financiamento)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(linha.foa_auto)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(linha.custos_totais)}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      linha.resultado >= 0 ? "text-green-600" : "text-destructive"
                    }`}>
                      {formatCurrency(linha.resultado)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {totais && (
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">TOTAL</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(totais.receita_cliente)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(totais.fof_financiamento)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(totais.foa_auto)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(totais.custos_totais)}
                    </TableCell>
                    <TableCell className={`text-right font-bold ${
                      totais.resultado >= 0 ? "text-green-600" : "text-destructive"
                    }`}>
                      {formatCurrency(totais.resultado)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum dado encontrado para o período selecionado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
