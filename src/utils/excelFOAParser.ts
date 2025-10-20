import * as XLSX from 'xlsx';
import type { MovimentoFinanceiro } from '@/types/centroCusto';

export interface FOAExcelRow {
  data: string;
  descricao: string;
  categoria: string;
  subcategoria?: string;
  valor: number;
  tipo: 'entrada' | 'saida';
  fonte?: string;
  projeto?: string;
  centro_custo?: string;
}

export interface FOAParsedData {
  centros: Map<string, FOAExcelRow[]>;
  reembolsos: FOAExcelRow[];
  metadata: {
    totalCentros: number;
    totalMovimentos: number;
    totalReembolsos: number;
  };
}

export function parseFOAExcel(file: File): Promise<FOAParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        const centrosMap = new Map<string, FOAExcelRow[]>();
        const reembolsos: FOAExcelRow[] = [];
        
        // Percorrer todas as abas
        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // Detectar tipo de aba
          if (sheetName.toLowerCase().includes('reembolso') || sheetName.toLowerCase().includes('fof')) {
            // Processar reembolsos
            const reembolsoData = jsonData.map((row: any) => parseRowToFOA(row, sheetName));
            reembolsos.push(...reembolsoData);
          } else if (sheetName.toLowerCase() !== 'resumo' && sheetName.toLowerCase() !== 'dre') {
            // Processar como centro de custo
            const centroData = jsonData.map((row: any) => {
              const foaRow = parseRowToFOA(row, sheetName);
              return foaRow;
            });
            
            centrosMap.set(sheetName, centroData);
          }
        }
        
        const resultado: FOAParsedData = {
          centros: centrosMap,
          reembolsos,
          metadata: {
            totalCentros: centrosMap.size,
            totalMovimentos: Array.from(centrosMap.values()).reduce((sum, arr) => sum + arr.length, 0),
            totalReembolsos: reembolsos.length,
          },
        };
        
        resolve(resultado);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
}

// Função auxiliar para parsear linha
function parseRowToFOA(row: any, sheetName: string): FOAExcelRow {
  // Detectar colunas automaticamente (várias variações)
  const data = row['Data'] || row['DATA'] || row['data'] || row['Date'] || '';
  const descricao = row['Descrição'] || row['DESCRIÇÃO'] || row['Descricao'] || row['descricao'] || 
                    row['Descriçao'] || row['Description'] || '';
  const categoria = row['Categoria'] || row['CATEGORIA'] || row['categoria'] || 'Outros';
  const subcategoria = row['Subcategoria'] || row['SUBCATEGORIA'] || row['subcategoria'];
  
  // Tentar múltiplas colunas de valor
  const valorRaw = row['Valor'] || row['VALOR'] || row['valor'] || row['Value'] ||
                   row['Saída'] || row['SAÍDA'] || row['Saida'] || row['saida'] ||
                   row['Entrada'] || row['ENTRADA'] || row['entrada'] || 0;
  const valor = typeof valorRaw === 'number' ? valorRaw : parseFloat(String(valorRaw).replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
  
  // Detectar tipo baseado nas colunas presentes
  let tipo: 'entrada' | 'saida' = 'saida';
  if (row['Entrada'] || row['ENTRADA'] || row['entrada'] || row['Receita'] || row['RECEITA']) {
    tipo = 'entrada';
  }
  if (row['Tipo'] || row['TIPO'] || row['tipo']) {
    tipo = (row['Tipo'] || row['TIPO'] || row['tipo']).toLowerCase() as 'entrada' | 'saida';
  }
  
  // Detectar fonte de financiamento (múltiplas variações)
  const fonteRaw = row['Fonte'] || row['FONTE'] || row['fonte'] || 
                   row['FOF Financiamento'] || row['FOF FINANCIAMENTO'] || 
                   row['Finaniamento FOF'] || row['FINANIAMENTO FOF'] ||
                   row['Rec. FOA'] || row['REC. FOA'] || row['REC FOA'] ||
                   row['FOA Auto'] || row['FOA AUTO'] || '';
  
  let fonte = '';
  if (fonteRaw) {
    const fonteStr = String(fonteRaw).toLowerCase();
    if (fonteStr.includes('fof') || fonteStr.includes('financiamento')) {
      fonte = 'FOF_FIN';
    } else if (fonteStr.includes('rec') || fonteStr.includes('recebimento')) {
      fonte = 'REC_FOA';
    } else if (fonteStr.includes('auto') || fonteStr.includes('próprio')) {
      fonte = 'FOA_AUTO';
    }
  }
  
  const projeto = row['Projeto'] || row['PROJETO'] || row['projeto'] || '';
  const centro_custo = sheetName; // Nome da aba como centro de custo
  
  return {
    data,
    descricao,
    categoria,
    subcategoria,
    valor,
    tipo,
    fonte,
    projeto,
    centro_custo,
  };
}

export function convertFOARowToMovimento(
  row: FOAExcelRow,
  projectId: number,
  centroCustoId?: string
): Omit<MovimentoFinanceiro, 'id' | 'created_at' | 'updated_at'> {
  return {
    projeto_id: projectId,
    centro_custo_id: centroCustoId,
    data_movimento: row.data,
    tipo_movimento: row.tipo,
    fonte_financiamento: mapFonteFinanciamento(row.fonte),
    categoria: row.categoria,
    subcategoria: row.subcategoria,
    descricao: row.descricao,
    valor: row.valor,
    valor_liquido: row.valor,
    status_aprovacao: 'pendente',
    tags: [],
    metadata: {
      importado_excel: true,
      data_importacao: new Date().toISOString()
    }
  };
}

function mapFonteFinanciamento(fonte?: string): 'REC_FOA' | 'FOF_FIN' | 'FOA_AUTO' | undefined {
  if (!fonte) return undefined;
  
  const fonteNormalizada = fonte.toLowerCase().trim();
  
  // Mapear fontes FOA específicas
  if (fonteNormalizada.includes('rec') || fonteNormalizada.includes('recebimento')) {
    return 'REC_FOA';
  } else if (fonteNormalizada.includes('fof') || fonteNormalizada.includes('financiamento')) {
    return 'FOF_FIN';
  } else if (fonteNormalizada.includes('auto') || fonteNormalizada.includes('proprio') || fonteNormalizada.includes('próprio')) {
    return 'FOA_AUTO';
  }
  
  return undefined;
}

export function validateFOAData(rows: FOAExcelRow[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  rows.forEach((row, index) => {
    if (!row.data) {
      errors.push(`Linha ${index + 1}: Data é obrigatória`);
    }
    
    if (!row.descricao) {
      errors.push(`Linha ${index + 1}: Descrição é obrigatória`);
    }
    
    if (!row.categoria) {
      errors.push(`Linha ${index + 1}: Categoria é obrigatória`);
    }
    
    if (!row.valor || row.valor <= 0) {
      errors.push(`Linha ${index + 1}: Valor deve ser maior que zero`);
    }
    
    if (row.tipo !== 'entrada' && row.tipo !== 'saida') {
      errors.push(`Linha ${index + 1}: Tipo deve ser 'entrada' ou 'saida'`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}
