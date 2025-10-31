import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

export function WarehouseTemplateDownloadButton() {
  const handleDownload = () => {
    try {
      // Dados de exemplo para o template
      const materiaisData = [
        {
          'Código Interno': 'MAT-001',
          'Nome Material': 'Cimento CP-II',
          'Categoria Principal': 'Material',
          'Subcategoria': 'Cimento',
          'Descrição Técnica': 'Cimento Portland CPII 50kg',
          'Unidade Medida': 'saco',
          'Quantidade Stock': 100,
          'Fornecedor': 'CimentoSA',
          'Localização Física': 'Armazém Central - Zona A1',
          'Projeto Alocado ID': '',
          'Status': 'Disponível',
          'Data Entrada': '2025-01-15'
        },
        {
          'Código Interno': 'MAT-002',
          'Nome Material': 'Vergalhão 10mm CA-50',
          'Categoria Principal': 'Material',
          'Subcategoria': 'Ferragem',
          'Descrição Técnica': 'Barra de aço CA-50 10mm',
          'Unidade Medida': 'kg',
          'Quantidade Stock': 5000,
          'Fornecedor': 'AçosTEC',
          'Localização Física': 'Armazém Central - Zona B2',
          'Projeto Alocado ID': '',
          'Status': 'Disponível',
          'Data Entrada': '2025-01-15'
        },
        {
          'Código Interno': 'MAT-003',
          'Nome Material': 'Tinta Acrílica Branca',
          'Categoria Principal': 'Material',
          'Subcategoria': 'Pintura',
          'Descrição Técnica': 'Tinta acrílica fosca 18L',
          'Unidade Medida': 'litro',
          'Quantidade Stock': 200,
          'Fornecedor': 'TintasCor',
          'Localização Física': 'Armazém Central - Zona C1',
          'Projeto Alocado ID': '',
          'Status': 'Disponível',
          'Data Entrada': '2025-01-16'
        },
        {
          'Código Interno': 'EQP-001',
          'Nome Material': 'Betoneira 400L',
          'Categoria Principal': 'Património',
          'Subcategoria': 'Equipamentos',
          'Descrição Técnica': 'Betoneira elétrica 400L',
          'Unidade Medida': 'unidade',
          'Quantidade Stock': 2,
          'Fornecedor': 'EquipBuild',
          'Localização Física': 'Armazém Central - Zona D1',
          'Projeto Alocado ID': '',
          'Status': 'Em uso',
          'Data Entrada': '2025-01-10'
        },
        {
          'Código Interno': 'MOB-001',
          'Nome Material': 'Pedreiro',
          'Categoria Principal': 'Mão de Obra',
          'Subcategoria': 'Alvenaria',
          'Descrição Técnica': 'Serviço de pedreiro',
          'Unidade Medida': 'unidade',
          'Quantidade Stock': 0,
          'Fornecedor': '',
          'Localização Física': '',
          'Projeto Alocado ID': '',
          'Status': 'Disponível',
          'Data Entrada': '2025-01-01'
        }
      ];

      // Instruções detalhadas
      const instrucoesData = [
        { Campo: 'INSTRUÇÕES PARA PREENCHIMENTO DO TEMPLATE DE MATERIAIS', Descrição: '' },
        { Campo: '', Descrição: '' },
        { Campo: 'CAMPOS OBRIGATÓRIOS:', Descrição: '' },
        { Campo: '', Descrição: '' },
        { Campo: 'Código Interno', Descrição: 'Código único do material (ex: MAT-001, EQP-001). Não pode haver códigos duplicados.' },
        { Campo: 'Nome Material', Descrição: 'Nome descritivo do material (ex: Cimento CP-II, Vergalhão 10mm CA-50)' },
        { Campo: 'Subcategoria', Descrição: 'Subcategoria do material (ex: Cimento, Ferragem, Pintura, Equipamentos, Alvenaria)' },
        { Campo: 'Unidade Medida', Descrição: 'Valores válidos: saco, m³, m, kg, litro, unidade, outro' },
        { Campo: 'Quantidade Stock', Descrição: 'Quantidade em estoque (número inteiro ou decimal)' },
        { Campo: 'Status', Descrição: 'Valores válidos: Disponível, Em uso, Reservado, Manutenção, Inativo' },
        { Campo: 'Data Entrada', Descrição: 'Data de entrada no armazém (formato: AAAA-MM-DD ou DD/MM/AAAA)' },
        { Campo: '', Descrição: '' },
        { Campo: 'CAMPOS OPCIONAIS:', Descrição: '' },
        { Campo: '', Descrição: '' },
        { Campo: 'Categoria Principal', Descrição: 'Valores válidos: Material, Mão de Obra, Património, Custos Indiretos' },
        { Campo: 'Descrição Técnica', Descrição: 'Descrição detalhada do material (especificações técnicas)' },
        { Campo: 'Fornecedor', Descrição: 'Nome do fornecedor do material' },
        { Campo: 'Localização Física', Descrição: 'Localização do material no armazém (ex: Zona A1, Prateleira B2)' },
        { Campo: 'Projeto Alocado ID', Descrição: 'ID do projeto ao qual o material está alocado (número)' },
        { Campo: '', Descrição: '' },
        { Campo: 'OBSERVAÇÕES IMPORTANTES:', Descrição: '' },
        { Campo: '', Descrição: '' },
        { Campo: '1.', Descrição: 'Códigos internos devem ser únicos. Não podem existir duplicados.' },
        { Campo: '2.', Descrição: 'A unidade de medida deve ser exatamente um dos valores listados acima.' },
        { Campo: '3.', Descrição: 'O status deve ser exatamente um dos valores listados acima.' },
        { Campo: '4.', Descrição: 'Datas podem estar no formato AAAA-MM-DD (2025-01-15) ou DD/MM/AAAA (15/01/2025).' },
        { Campo: '5.', Descrição: 'Quantidade em stock não pode ser negativa.' },
        { Campo: '6.', Descrição: 'Deixe campos opcionais em branco se não tiver informação.' },
        { Campo: '7.', Descrição: 'Não altere os nomes das colunas na primeira linha.' },
        { Campo: '8.', Descrição: 'Não deixe linhas em branco entre os registros.' },
        { Campo: '', Descrição: '' },
        { Campo: 'EXEMPLOS DE PREENCHIMENTO:', Descrição: '' },
        { Campo: '', Descrição: '' },
        { Campo: 'Material Básico', Descrição: 'MAT-001 | Cimento CP-II | Material | Cimento | saco | 100 | Disponível | 2025-01-15' },
        { Campo: 'Equipamento', Descrição: 'EQP-001 | Betoneira 400L | Património | Equipamentos | unidade | 2 | Em uso | 2025-01-10' },
        { Campo: 'Mão de Obra', Descrição: 'MOB-001 | Pedreiro | Mão de Obra | Alvenaria | unidade | 0 | Disponível | 2025-01-01' }
      ];

      // Criar workbook
      const wb = XLSX.utils.book_new();

      // Adicionar sheet de materiais
      const wsMateriais = XLSX.utils.json_to_sheet(materiaisData);
      XLSX.utils.book_append_sheet(wb, wsMateriais, 'Materiais');

      // Adicionar sheet de instruções
      const wsInstrucoes = XLSX.utils.json_to_sheet(instrucoesData);
      XLSX.utils.book_append_sheet(wb, wsInstrucoes, 'Instruções');

      // Gerar arquivo e fazer download
      XLSX.writeFile(wb, 'template_materiais_armazem.xlsx');

      toast.success('Template baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar template:', error);
      toast.error('Erro ao gerar template. Tente novamente.');
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleDownload}
      className="w-full"
    >
      <Download className="h-4 w-4 mr-2" />
      Baixar Template
    </Button>
  );
}
