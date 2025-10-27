import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download } from "lucide-react";
import { useProjectContext } from "@/contexts/ProjectContext";
import { useDREPorCentro } from "@/hooks/useDREPorCentro";
import { useReembolsosFOA } from "@/hooks/useReembolsosFOA";
import { useResumoFOAGeral } from "@/hooks/useResumoFOA";
import { generateDREPDF, generateReembolsosPDF, generateResumoFOAPDF } from "@/utils/pdfGenerator";
import { generateFOAExcel } from "@/utils/excelExporter";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export function DashboardRelatoriosFOASection() {
  const { selectedProjectId, projectData } = useProjectContext();
  const selectedProject = projectData?.project;
  
  const currentDate = new Date();
  const [mes, setMes] = useState(currentDate.getMonth() + 1);
  const [ano, setAno] = useState(currentDate.getFullYear());
  const [tipoRelatorio, setTipoRelatorio] = useState<'dre' | 'reembolsos' | 'resumo' | 'completo'>('resumo');

  const { data: linhasDRE } = useDREPorCentro(selectedProject?.id || 0, mes, ano);
  const { data: reembolsos } = useReembolsosFOA(selectedProject?.id);
  const { data: resumo } = useResumoFOAGeral();

  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Selecione um projeto para gerar relatórios FOA
        </CardContent>
      </Card>
    );
  }

  const handleGeneratePDF = () => {
    try {
      switch (tipoRelatorio) {
        case 'dre':
          if (linhasDRE) generateDREPDF(selectedProject, mes, ano, linhasDRE);
          break;
        case 'reembolsos':
          if (reembolsos) generateReembolsosPDF(selectedProject, reembolsos);
          break;
        case 'resumo':
          if (resumo) generateResumoFOAPDF(selectedProject, resumo);
          break;
        case 'completo':
          if (linhasDRE) generateDREPDF(selectedProject, mes, ano, linhasDRE);
          if (reembolsos) generateReembolsosPDF(selectedProject, reembolsos);
          if (resumo) generateResumoFOAPDF(selectedProject, resumo);
          break;
      }
      toast.success("Relatório PDF gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar relatório PDF");
      console.error(error);
    }
  };

  const handleGenerateExcel = async () => {
    try {
      await generateFOAExcel(selectedProject.id);
      toast.success("Excel FOA exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar Excel");
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Configurações */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações do Relatório</CardTitle>
            <CardDescription>Projeto: {selectedProject.nome}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tipo de Relatório</Label>
              <Select value={tipoRelatorio} onValueChange={(v: any) => setTipoRelatorio(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resumo">Resumo Executivo</SelectItem>
                  <SelectItem value="dre">DRE - Demonstração de Resultados</SelectItem>
                  <SelectItem value="reembolsos">Reembolsos FOA ↔ FOF</SelectItem>
                  <SelectItem value="completo">Relatório Completo (Todos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tipoRelatorio === 'dre' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mês</Label>
                  <Select value={mes.toString()} onValueChange={(v) => setMes(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {new Date(2000, i).toLocaleDateString('pt-BR', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ano</Label>
                  <Select value={ano.toString()} onValueChange={(v) => setAno(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = currentDate.getFullYear() - 2 + i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações */}
        <Card>
          <CardHeader>
            <CardTitle>Gerar Relatórios</CardTitle>
            <CardDescription>Escolha o formato de exportação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleGeneratePDF} className="w-full" size="lg">
              <FileText className="mr-2 h-5 w-5" />
              Gerar PDF
            </Button>
            <Button onClick={handleGenerateExcel} variant="outline" className="w-full" size="lg">
              <Download className="mr-2 h-5 w-5" />
              Exportar Excel Completo FOA
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview dos dados */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {tipoRelatorio === 'dre' && linhasDRE && (
              <p>✓ {linhasDRE.length} centros de custo encontrados para {mes}/{ano}</p>
            )}
            {tipoRelatorio === 'reembolsos' && reembolsos && (
              <p>✓ {reembolsos.length} reembolsos registrados</p>
            )}
            {tipoRelatorio === 'resumo' && resumo && (
              <p>✓ Resumo executivo disponível</p>
            )}
            {tipoRelatorio === 'completo' && (
              <div className="space-y-1">
                <p>✓ DRE: {linhasDRE?.length || 0} centros</p>
                <p>✓ Reembolsos: {reembolsos?.length || 0} registros</p>
                <p>✓ Resumo executivo disponível</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
