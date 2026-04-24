import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as XLSX from "xlsx";

interface EmployeeTemplateDownloadButtonProps {
  variant?: "outline" | "default";
  size?: "sm" | "default";
  label?: string;
}

export function EmployeeTemplateDownloadButton({
  variant = "outline",
  size = "sm",
  label = "Baixar Template",
}: EmployeeTemplateDownloadButtonProps) {
  const generateTemplate = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Colaboradores
    const employeesData = [
      [
        "Nome",
        "Cargo",
        "Categoria",
        "Custo/Hora",
        "Tipo Colaborador",
        "Nº Funcional",
        "BI",
        "Morada",
        "Hora Entrada",
        "Hora Saída",
        "CV Link",
      ],
      [
        "João Silva",
        "Pedreiro",
        "Oficial",
        2500,
        "Fixo",
        "FUNC-001",
        "001234567LA041",
        "Rua Principal, Luanda",
        "08:00",
        "17:00",
        "",
      ],
      [
        "Maria Santos",
        "Servente",
        "Auxiliar",
        1500,
        "Fixo",
        "FUNC-002",
        "002345678LA042",
        "Bairro Operário, Luanda",
        "08:00",
        "17:00",
        "",
      ],
      [
        "Pedro Costa",
        "Engenheiro Civil",
        "Técnico Superior",
        5000,
        "Temporário",
        "FUNC-003",
        "003456789LA043",
        "Talatona, Luanda",
        "08:00",
        "17:00",
        "",
      ],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(employeesData);
    ws1["!cols"] = [
      { wch: 25 }, { wch: 20 }, { wch: 18 }, { wch: 12 }, { wch: 16 },
      { wch: 14 }, { wch: 18 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(wb, ws1, "Colaboradores");

    // Sheet 2: Alocações
    const allocationsData = [
      ["Nº Funcional", "Projeto ID", "Função", "Tipo Horário", "Data Alocação"],
      ["FUNC-001", 1, "Pedreiro", "integral", "2025-01-15"],
      ["FUNC-002", 1, "Servente", "integral", "2025-01-15"],
      ["FUNC-003", 2, "Engenheiro Responsável", "meio_periodo", "2025-02-01"],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(allocationsData);
    ws2["!cols"] = [{ wch: 14 }, { wch: 12 }, { wch: 25 }, { wch: 16 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Alocações");

    // Sheet 3: Instruções
    const instructions = [
      ["INSTRUÇÕES PARA PREENCHIMENTO DO TEMPLATE DE COLABORADORES"],
      [""],
      ["1. ABA 'Colaboradores' (obrigatória)"],
      ["- Nome: nome completo do colaborador (obrigatório)"],
      ["- Cargo: função principal (obrigatório)"],
      ["- Categoria: deve ser exatamente um destes valores: Oficial, Auxiliar, Técnico Superior"],
      ["- Custo/Hora: valor numérico em Kz (>= 0)"],
      ["- Tipo Colaborador: 'Fixo' ou 'Temporário'"],
      ["- Nº Funcional: identificador único interno (ex.: FUNC-001). Não pode haver duplicados."],
      ["- BI: número do Bilhete de Identidade"],
      ["- Morada: endereço completo"],
      ["- Hora Entrada / Hora Saída: formato HH:MM (ex.: 08:00, 17:30)"],
      ["- CV Link: URL para o curriculum (opcional)"],
      [""],
      ["2. ABA 'Alocações' (opcional)"],
      ["- Nº Funcional: deve corresponder a um colaborador da aba 'Colaboradores'"],
      ["- Projeto ID: ID numérico do projeto onde o colaborador será alocado"],
      ["- Função: função desempenhada no projeto"],
      ["- Tipo Horário: 'integral', 'meio_periodo' ou 'turno'"],
      ["- Data Alocação: formato YYYY-MM-DD (ex.: 2025-01-15)"],
      [""],
      ["3. VALIDAÇÕES"],
      ["- Números funcionais não podem repetir-se nem existir já na base de dados"],
      ["- Custos devem ser positivos"],
      ["- Datas devem ser válidas"],
      [""],
      ["4. IMPORTAÇÃO"],
      ["- Após preencher, salve o ficheiro como .xlsx"],
      ["- Clique em 'Importar de Excel' na plataforma"],
      ["- Faça upload e revise a pré-visualização"],
      ["- Confirme a importação"],
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(instructions);
    ws3["!cols"] = [{ wch: 90 }];
    XLSX.utils.book_append_sheet(wb, ws3, "Instruções");

    XLSX.writeFile(wb, "template-colaboradores.xlsx");
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={variant} size={size} onClick={generateTemplate} className="gap-2">
            <Download className="h-4 w-4" />
            {label}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Baixar template Excel para importação de colaboradores</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
