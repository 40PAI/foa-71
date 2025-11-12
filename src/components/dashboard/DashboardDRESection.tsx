import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDREPorCentro, useSalvarDRE } from "@/hooks/useDREPorCentro";
import { formatCurrency } from "@/utils/currency";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FileDown, Save, Grid3x3, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { ProjectSelector } from "@/components/ProjectSelector";
import { useProjects } from "@/hooks/useProjects";
import { generateDREPDF } from "@/utils/pdfGenerator";
import { DREChartsSection } from "@/components/financial/DREChartsSection";
import { DREConsolidadoView } from "@/components/financial/DREConsolidadoView";

export function DashboardDRESection() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const { data: projects } = useProjects();
  const selectedProject = projects?.find(p => p.id.toString() === selectedProjectId);
  
  const currentDate = new Date();
  const [mes, setMes] = useState(currentDate.getMonth() + 1);
  const [ano, setAno] = useState(currentDate.getFullYear());

  const { data: dreLinhas, isLoading } = useDREPorCentro(
    selectedProject?.id || 0,
    mes,
    ano
  );
  
  const salvarDRE = useSalvarDRE();

  const handleSalvar = () => {
    if (!dreLinhas || !selectedProject) return;
    
    salvarDRE.mutate({
      projectId: selectedProject.id,
      mes,
      ano,
      linhas: dreLinhas,
    });
  };

  const handleExportar = () => {
    if (!selectedProject || !dreLinhas || dreLinhas.length === 0) {
      toast.error("Selecione um projeto com dados DRE para exportar");
      return;
    }

    try {
      generateDREPDF(selectedProject, mes, ano, dreLinhas);
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar PDF");
      console.error(error);
    }
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
    <div className="space-y-4">
      <Tabs defaultValue="consolidado" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="consolidado" className="flex items-center gap-2">
            <Grid3x3 className="h-4 w-4" />
            DRE Consolidado
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            DRE por Projeto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="consolidado" className="mt-6">
          <DREConsolidadoView />
        </TabsContent>

        <TabsContent value="individual" className="mt-6 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <CardTitle>DRE - Demonstração de Resultados</CardTitle>
              <CardDescription>
                {selectedProject ? `Projeto: ${selectedProject.nome}` : "Selecione um projeto"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleExportar} 
                variant="outline" 
                size="sm"
                disabled={!selectedProject}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
              <Button 
                onClick={handleSalvar} 
                disabled={!dreLinhas || salvarDRE.isPending || !selectedProject} 
                size="sm"
              >
                <Save className="mr-2 h-4 w-4" />
                Salvar DRE
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Projeto</Label>
            <ProjectSelector 
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
              placeholder="Selecionar projeto..."
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Período:</span>
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

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : dreLinhas && dreLinhas.length > 0 ? (
            <div className="overflow-x-auto">
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
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum dado encontrado para o período selecionado
            </div>
          )}
        </CardContent>
      </Card>

      {selectedProject && dreLinhas && dreLinhas.length > 0 && (
        <DREChartsSection projectId={selectedProject.id} />
      )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
