import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Loader2 } from "lucide-react";
import { useDREPorCentro } from "@/hooks/useDREPorCentro";
import { useReembolsosFOA } from "@/hooks/useReembolsosFOA";
import { useResumoFOA } from "@/hooks/useResumoFOA";
import { generateDREPDF, generateReembolsosPDF, generateResumoFOAPDF } from "@/utils/pdfGenerator";
import { generateFOAExcel } from "@/utils/excelExporter";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { ProjectSelector } from "@/components/ProjectSelector";
import { useProjects } from "@/hooks/useProjects";

export function DashboardRelatoriosFOASection() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const { data: projects } = useProjects();
  const selectedProject = projects?.find(p => p.id.toString() === selectedProjectId);
  
  const currentDate = new Date();
  const [mes, setMes] = useState(currentDate.getMonth() + 1);
  const [ano, setAno] = useState(currentDate.getFullYear());
  const [tipoRelatorio, setTipoRelatorio] = useState<'dre' | 'reembolsos' | 'resumo' | 'completo'>('resumo');

  // Buscar dados do projeto ESPECÍFICO selecionado
  const { data: linhasDRE, isLoading: isLoadingDRE } = useDREPorCentro(selectedProject?.id || 0, mes, ano);
  const { data: reembolsos, isLoading: isLoadingReembolsos } = useReembolsosFOA(selectedProject?.id);
  const { data: resumoData, isLoading: isLoadingResumo } = useResumoFOA(selectedProject?.id);

  // Encontrar dados do projeto específico no array retornado
  const resumo = resumoData?.find(r => r.projeto_id === selectedProject?.id) || 
    (resumoData && resumoData.length > 0 ? resumoData[0] : null);

  const isLoading = isLoadingDRE || isLoadingReembolsos || isLoadingResumo;

  const handleGeneratePDF = () => {
    if (!selectedProject) {
      toast.warning("Selecione um projeto primeiro");
      return;
    }

    if (isLoading) {
      toast.warning("Aguarde o carregamento dos dados...");
      return;
    }

    try {
      console.log('Gerando PDF para projeto:', selectedProject.id, selectedProject.nome);
      console.log('Resumo FOA:', resumo);
      console.log('Linhas DRE:', linhasDRE);
      console.log('Reembolsos:', reembolsos);

      switch (tipoRelatorio) {
        case 'dre':
          if (linhasDRE && linhasDRE.length > 0) {
            generateDREPDF(selectedProject, mes, ano, linhasDRE);
          } else {
            toast.warning("Nenhum dado DRE encontrado para este período");
            return;
          }
          break;
        case 'reembolsos':
          if (reembolsos) {
            generateReembolsosPDF(selectedProject, reembolsos);
          } else {
            toast.warning("Nenhum reembolso encontrado");
            return;
          }
          break;
        case 'resumo':
          if (resumo) {
            generateResumoFOAPDF(selectedProject, resumo);
          } else {
            toast.warning("Nenhum dado financeiro encontrado para este projeto");
            return;
          }
          break;
        case 'completo':
          if (linhasDRE) generateDREPDF(selectedProject, mes, ano, linhasDRE);
          if (reembolsos) generateReembolsosPDF(selectedProject, reembolsos);
          if (resumo) generateResumoFOAPDF(selectedProject, resumo);
          break;
      }
      toast.success("Relatorio PDF gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar relatorio PDF");
      console.error(error);
    }
  };

  const handleGenerateExcel = async () => {
    if (!selectedProject) {
      toast.warning("Selecione um projeto primeiro");
      return;
    }

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
            <CardTitle>Configuracoes do Relatorio</CardTitle>
            <CardDescription>Selecione o projeto e o tipo de relatorio</CardDescription>
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

            <div>
              <Label>Tipo de Relatorio</Label>
              <Select value={tipoRelatorio} onValueChange={(v: any) => setTipoRelatorio(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resumo">Resumo Executivo</SelectItem>
                  <SelectItem value="dre">DRE - Demonstracao de Resultados</SelectItem>
                  <SelectItem value="reembolsos">Reembolsos FOA - FOF</SelectItem>
                  <SelectItem value="completo">Relatorio Completo (Todos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tipoRelatorio === 'dre' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mes</Label>
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
            <CardTitle>Gerar Relatorios</CardTitle>
            <CardDescription>Escolha o formato de exportacao</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleGeneratePDF} 
              className="w-full" 
              size="lg"
              disabled={!selectedProject || isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <FileText className="mr-2 h-5 w-5" />
              )}
              {isLoading ? "Carregando dados..." : "Gerar PDF"}
            </Button>
            <Button 
              onClick={handleGenerateExcel} 
              variant="outline" 
              className="w-full" 
              size="lg"
              disabled={!selectedProject}
            >
              <Download className="mr-2 h-5 w-5" />
              Exportar Excel Completo FOA
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview dos dados */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Relatorio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {isLoading ? (
              <p className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando dados do projeto...
              </p>
            ) : !selectedProject ? (
              <p>Selecione um projeto para visualizar os dados</p>
            ) : (
              <>
                {tipoRelatorio === 'dre' && (
                  <p>{linhasDRE && linhasDRE.length > 0 ? `${linhasDRE.length} centros de custo encontrados para ${mes}/${ano}` : 'Nenhum dado DRE encontrado'}</p>
                )}
                {tipoRelatorio === 'reembolsos' && (
                  <p>{reembolsos && reembolsos.length > 0 ? `${reembolsos.length} reembolsos registrados` : 'Nenhum reembolso registrado'}</p>
                )}
                {tipoRelatorio === 'resumo' && resumo && (
                  <div className="space-y-1">
                    <p>FOF Financiamento: {(resumo.fof_financiamento || 0).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' }).replace('AOA', 'Kz')}</p>
                    <p>Amortizacao: {(resumo.amortizacao || 0).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' }).replace('AOA', 'Kz')}</p>
                    <p>Divida FOA - FOF: {(resumo.divida_foa_com_fof || 0).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' }).replace('AOA', 'Kz')}</p>
                  </div>
                )}
                {tipoRelatorio === 'completo' && (
                  <div className="space-y-1">
                    <p>DRE: {linhasDRE?.length || 0} centros</p>
                    <p>Reembolsos: {reembolsos?.length || 0} registros</p>
                    <p>Resumo executivo: {resumo ? 'Disponivel' : 'Sem dados'}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
