import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

export function MovimentosTemplateDownloadButton() {
  const handleDownload = () => {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Sheet 1 - Movimentos (exemplo)
      const movimentosData = [
        {
          'Data': '01/01/2025',
          'Descrição': 'Compra de Cimento',
          'Categoria': 'Material',
          'Subcategoria': 'Cimento',
          'Tipo': 'saida',
          'Valor': 15000.00,
          'Centro Custo': 'PROJ-001',
          'Fonte Financiamento': 'FOF_FIN',
          'Forma Pagamento': 'transferencia',
          'Número Documento': 'NF-001',
          'Observações': 'Compra para obra X',
        },
        {
          'Data': '05/01/2025',
          'Descrição': 'Recebimento Parcela Cliente',
          'Categoria': 'Receita',
          'Subcategoria': 'Parcela Projeto',
          'Tipo': 'entrada',
          'Valor': 50000.00,
          'Centro Custo': 'PROJ-001',
          'Fonte Financiamento': 'REC_FOA',
          'Forma Pagamento': 'transferencia',
          'Número Documento': 'REC-005',
          'Observações': 'Parcela 2 do projeto',
        },
        {
          'Data': '10/01/2025',
          'Descrição': 'Pagamento Mão de Obra',
          'Categoria': 'Servicos',
          'Subcategoria': 'Pedreiros',
          'Tipo': 'saida',
          'Valor': 28000.00,
          'Centro Custo': 'PROJ-002',
          'Fonte Financiamento': 'FOA_AUTO',
          'Forma Pagamento': 'pix',
          'Número Documento': '',
          'Observações': 'Pagamento semanal',
        },
      ];

      const ws1 = XLSX.utils.json_to_sheet(movimentosData);

      // Set column widths
      ws1['!cols'] = [
        { wch: 12 },  // Data
        { wch: 30 },  // Descrição
        { wch: 15 },  // Categoria
        { wch: 15 },  // Subcategoria
        { wch: 10 },  // Tipo
        { wch: 12 },  // Valor
        { wch: 15 },  // Centro Custo
        { wch: 18 },  // Fonte Financiamento
        { wch: 15 },  // Forma Pagamento
        { wch: 15 },  // Número Documento
        { wch: 25 },  // Observações
      ];

      XLSX.utils.book_append_sheet(wb, ws1, "Movimentos");

      // Sheet 2 - Instruções
      const instrucoesData = [
        { 'Campo': 'Data', 'Obrigatório': 'SIM', 'Formato': 'DD/MM/YYYY', 'Exemplo': '15/01/2025', 'Observações': 'Data do movimento financeiro' },
        { 'Campo': 'Descrição', 'Obrigatório': 'SIM', 'Formato': 'Texto', 'Exemplo': 'Compra de Material', 'Observações': 'Descrição detalhada do movimento' },
        { 'Campo': 'Tipo', 'Obrigatório': 'SIM', 'Formato': 'entrada ou saida', 'Exemplo': 'saida', 'Observações': 'Tipo de movimento: entrada ou saida' },
        { 'Campo': 'Valor', 'Obrigatório': 'SIM', 'Formato': 'Número', 'Exemplo': '15000.00', 'Observações': 'Valor em número positivo (sem símbolo de moeda)' },
        { 'Campo': 'Fonte Financiamento', 'Obrigatório': 'SIM', 'Formato': 'REC_FOA, FOF_FIN, FOA_AUTO', 'Exemplo': 'FOF_FIN', 'Observações': 'Fonte de financiamento (obrigatória)' },
        { 'Campo': 'Categoria', 'Obrigatório': 'NÃO', 'Formato': 'Texto', 'Exemplo': 'Material', 'Observações': 'Categoria principal do gasto/receita (opcional)' },
        { 'Campo': 'Subcategoria', 'Obrigatório': 'NÃO', 'Formato': 'Texto', 'Exemplo': 'Cimento', 'Observações': 'Subcategoria para maior detalhamento' },
        { 'Campo': 'Centro Custo', 'Obrigatório': 'NÃO', 'Formato': 'Código ou Nome', 'Exemplo': 'PROJ-001', 'Observações': 'Código ou nome do centro de custo existente' },
        { 'Campo': 'Forma Pagamento', 'Obrigatório': 'NÃO', 'Formato': 'Texto', 'Exemplo': 'transferencia', 'Observações': 'Forma como foi realizado o pagamento' },
        { 'Campo': 'Número Documento', 'Obrigatório': 'NÃO', 'Formato': 'Texto', 'Exemplo': 'NF-001', 'Observações': 'Número da nota fiscal ou documento' },
        { 'Campo': 'Observações', 'Obrigatório': 'NÃO', 'Formato': 'Texto', 'Exemplo': 'Compra urgente', 'Observações': 'Informações adicionais relevantes' },
        {},
        { 'Campo': '🔴 IMPORTANTE:', 'Obrigatório': '', 'Formato': '', 'Exemplo': '', 'Observações': '' },
        { 'Campo': '1.', 'Obrigatório': '', 'Formato': '', 'Exemplo': '', 'Observações': 'Não altere os nomes das colunas na planilha' },
        { 'Campo': '2.', 'Obrigatório': '', 'Formato': '', 'Exemplo': '', 'Observações': 'Mantenha a primeira linha (cabeçalho) intacta' },
        { 'Campo': '3.', 'Obrigatório': '', 'Formato': '', 'Exemplo': '', 'Observações': 'O Centro de Custo informado deve existir no projeto' },
        { 'Campo': '4.', 'Obrigatório': '', 'Formato': '', 'Exemplo': '', 'Observações': 'Valores devem ser positivos (sem sinal negativo)' },
        { 'Campo': '5.', 'Obrigatório': '', 'Formato': '', 'Exemplo': '', 'Observações': 'Use vírgula ou ponto para decimais (15000,00 ou 15000.00)' },
        { 'Campo': '6.', 'Obrigatório': '', 'Formato': '', 'Exemplo': '', 'Observações': 'Tamanho máximo do arquivo: 10MB' },
      ];

      const ws2 = XLSX.utils.json_to_sheet(instrucoesData);
      
      ws2['!cols'] = [
        { wch: 20 },
        { wch: 12 },
        { wch: 25 },
        { wch: 20 },
        { wch: 50 },
      ];

      XLSX.utils.book_append_sheet(wb, ws2, "Instruções");

      // Generate file and download
      XLSX.writeFile(wb, 'template_movimentos_financeiros.xlsx');
      
      toast.success('Template baixado com sucesso!', {
        description: 'Use este arquivo como modelo para importar seus movimentos',
      });
    } catch (error) {
      console.error('Error generating template:', error);
      toast.error('Erro ao gerar template');
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleDownload}>
      <Download className="h-4 w-4 mr-2" />
      Baixar Template
    </Button>
  );
}
