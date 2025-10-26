import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as XLSX from 'xlsx';

export function TemplateDownloadButton() {
  const generateTemplate = () => {
    // Criar workbook
    const wb = XLSX.utils.book_new();

    // Aba 1: Dados do Projeto
    const projectData = [
      ['Campo', 'Valor'],
      ['Nome do Projeto', 'Exemplo: Residencial Porto Rico'],
      ['Cliente', 'Exemplo: João Silva'],
      ['Encarregado', 'Exemplo: Maria Santos'],
      ['Data de Início', '2025-01-15'],
      ['Data de Fim Prevista', '2025-12-31'],
      ['Orçamento Total', 1000000],
      ['Limite de Aprovação', 50000],
      ['Limite de Gastos', 900000],
      ['Status', 'Em Andamento'],
      ['Província', 'Luanda'],
      ['Município', 'Luanda'],
      ['Zona/Bairro', 'Talatona'],
      ['Tipo de Projeto', 'Residencial'],
      ['Número de Etapas', 4]
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(projectData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Dados do Projeto');

    // Aba 2: Etapas
    const stagesData = [
      ['Número da Etapa', 'Nome da Etapa', 'Tipo de Etapa', 'Responsável da Etapa', 'Data Início Etapa', 'Data Fim Prevista Etapa', 'Status Etapa', 'Orçamento da Etapa', 'Tempo Previsto (dias)', 'Observações'],
      [1, 'Fundação', 'Fundação', 'João Silva', '2025-01-15', '2025-03-15', 'Não Iniciada', 250000, 60, 'Fundação completa'],
      [2, 'Estrutura', 'Estrutura', 'Maria Santos', '2025-03-16', '2025-06-15', 'Não Iniciada', 400000, 90, 'Estrutura de concreto'],
      [3, 'Alvenaria', 'Alvenaria', 'Pedro Costa', '2025-06-16', '2025-09-15', 'Não Iniciada', 200000, 90, 'Paredes e divisórias'],
      [4, 'Acabamento', 'Acabamento', 'Ana Lima', '2025-09-16', '2025-12-31', 'Não Iniciada', 150000, 105, 'Acabamento final']
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(stagesData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Etapas');

    // Aba 3: Tarefas
    const tasksData = [
      ['Número da Etapa', 'Descrição da Tarefa', 'Responsável', 'Prazo', 'Tipo', 'Status', 'Percentual de Conclusão', 'Custo Material', 'Custo Mão de Obra', 'Preço Unitário', 'Semana Programada'],
      [1, 'Escavação do terreno', 'João Silva', '2025-01-20', 'Residencial', 'Pendente', 0, 50000, 30000, 80000, 1],
      [1, 'Fundação em concreto', 'João Silva', '2025-02-15', 'Residencial', 'Pendente', 0, 100000, 70000, 170000, 2],
      [2, 'Pilares de concreto', 'Maria Santos', '2025-04-01', 'Residencial', 'Pendente', 0, 150000, 100000, 250000, 5],
      [2, 'Vigas e lajes', 'Maria Santos', '2025-05-15', 'Residencial', 'Pendente', 0, 180000, 120000, 300000, 8],
      [3, 'Alvenaria externa', 'Pedro Costa', '2025-07-01', 'Residencial', 'Pendente', 0, 80000, 60000, 140000, 12],
      [3, 'Alvenaria interna', 'Pedro Costa', '2025-08-15', 'Residencial', 'Pendente', 0, 70000, 50000, 120000, 15],
      [4, 'Revestimento', 'Ana Lima', '2025-10-01', 'Residencial', 'Pendente', 0, 60000, 40000, 100000, 18],
      [4, 'Pintura', 'Ana Lima', '2025-11-15', 'Residencial', 'Pendente', 0, 40000, 30000, 70000, 21]
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(tasksData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Tarefas');

    // Aba 4: Instruções
    const instructions = [
      ['INSTRUÇÕES PARA PREENCHIMENTO DO TEMPLATE'],
      [''],
      ['1. DADOS DO PROJETO'],
      ['- Preencha todos os campos obrigatórios'],
      ['- Datas devem estar no formato YYYY-MM-DD (exemplo: 2025-01-15)'],
      ['- Status válidos: Em Andamento, Atrasado, Concluído, Pausado, Planeado, Cancelado'],
      ['- Tipo de Projeto válidos: Residencial, Comercial, Industrial, Infraestrutura, Reforma'],
      [''],
      ['2. ETAPAS'],
      ['- Número da Etapa deve ser único e sequencial (1, 2, 3...)'],
      ['- Tipo de Etapa válidos: Fundação, Estrutura, Alvenaria, Acabamento, Instalações, Entrega, Mobilização, Desmobilização'],
      ['- Status Etapa válidos: Não Iniciada, Em Curso, Concluída, Atrasada'],
      ['- Tempo Previsto em dias'],
      [''],
      ['3. TAREFAS'],
      ['- Número da Etapa deve corresponder a uma etapa existente'],
      ['- Tipo válidos: Residencial, Comercial, Industrial, Infraestrutura, Reforma'],
      ['- Status válidos: Pendente, Em Andamento, Concluído, Cancelado, Atrasado'],
      ['- Percentual de Conclusão deve estar entre 0 e 100'],
      ['- Custos devem ser valores numéricos positivos'],
      ['- Semana Programada é opcional'],
      [''],
      ['4. VALIDAÇÕES'],
      ['- Todos os campos marcados como obrigatórios devem ser preenchidos'],
      ['- Datas de fim devem ser posteriores às datas de início'],
      ['- Valores numéricos devem ser positivos'],
      ['- Status e tipos devem estar entre os valores permitidos'],
      [''],
      ['5. IMPORTAÇÃO'],
      ['- Após preencher, salve o arquivo'],
      ['- Clique em "Importar de Excel" na plataforma'],
      ['- Faça upload do arquivo'],
      ['- Revise os dados na prévia'],
      ['- Confirme a importação']
    ];
    const ws4 = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, ws4, 'Instruções');

    // Gerar arquivo e fazer download
    XLSX.writeFile(wb, 'template-projeto.xlsx');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="default"
            onClick={generateTemplate}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Baixar Template
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Baixar template Excel para importação de projetos</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
