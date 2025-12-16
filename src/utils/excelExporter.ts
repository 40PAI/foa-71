import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

export async function generateFOAExcel(projectId: number) {
  // Buscar dados do projeto
  const { data: projeto } = await supabase
    .from('projetos')
    .select('*')
    .eq('id', projectId)
    .single();

  if (!projeto) throw new Error('Projeto nao encontrado');

  // Buscar centros de custo
  const { data: centros } = await supabase
    .from('centros_custo')
    .select('*')
    .eq('projeto_id', projectId)
    .order('codigo');

  // Buscar movimentos por centro
  const workbook = XLSX.utils.book_new();

  // Para cada centro, criar aba
  for (const centro of centros || []) {
    const { data: movimentos } = await supabase
      .from('movimentos_financeiros')
      .select('*')
      .eq('centro_custo_id', centro.id)
      .order('data_movimento');

    const rows: any[] = [];
    let saldoAcumulado = 0;

    movimentos?.forEach((mov) => {
      const entrada = mov.tipo_movimento === 'entrada' ? mov.valor : 0;
      const saida = mov.tipo_movimento === 'saida' ? mov.valor : 0;
      saldoAcumulado += entrada - saida;

      rows.push({
        DATA: mov.data_movimento,
        DESCRICAO: mov.descricao,
        'REC. FOA': mov.fonte_financiamento === 'REC_FOA' ? entrada : '',
        'FOF FINANCIAMENTO': mov.fonte_financiamento === 'FOF_FIN' ? (mov.tipo_movimento === 'saida' ? saida : entrada) : '',
        'FOA AUTO': mov.fonte_financiamento === 'FOA_AUTO' ? (mov.tipo_movimento === 'saida' ? saida : entrada) : '',
        SAIDA: saida || '',
        SALDO: saldoAcumulado,
        OBSERVACOES: mov.observacoes || '',
      });
    });

    // Adicionar linha de totais
    const totalEntradas = movimentos?.filter(m => m.tipo_movimento === 'entrada').reduce((sum, m) => sum + m.valor, 0) || 0;
    const totalSaidas = movimentos?.filter(m => m.tipo_movimento === 'saida').reduce((sum, m) => sum + m.valor, 0) || 0;
    
    rows.push({
      DATA: 'TOTAL',
      DESCRICAO: '',
      'REC. FOA': '',
      'FOF FINANCIAMENTO': '',
      'FOA AUTO': '',
      SAIDA: totalSaidas,
      SALDO: saldoAcumulado,
      OBSERVACOES: '',
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, centro.nome.substring(0, 31)); // Nome limitado a 31 chars
  }

  // Aba RESUMO - Usar a RPC para consistência com o PDF
  const { data: resumoData, error: resumoError } = await supabase
    .rpc('calcular_resumo_foa', { p_projeto_id: projectId });
  
  console.log('Resumo FOA para Excel:', resumoData, resumoError);
  
  const resumo = resumoData && resumoData.length > 0 ? resumoData[0] : null;
  
  const resumoRows = [{
    'FOF FINANCIAMENTO': resumo?.fof_financiamento || 0,
    'AMORTIZACAO': resumo?.amortizacao || 0,
    'DIVIDA FOA - FOF': resumo?.divida_foa_com_fof || 0,
  }];

  const resumoSheet = XLSX.utils.json_to_sheet(resumoRows);
  XLSX.utils.book_append_sheet(workbook, resumoSheet, 'RESUMO');

  // Aba DRE
  const { data: dre } = await supabase.rpc('calcular_dre_mensal', {
    p_projeto_id: projectId,
    p_mes: new Date().getMonth() + 1,
    p_ano: new Date().getFullYear()
  });

  const dreRows = dre?.map((linha: any) => ({
    'CENTRO DE CUSTO': linha.centro_nome,
    'RECEITA CLIENTE': linha.receita_cliente,
    'FOF FINANCIAMENTO': linha.fof_financiamento,
    'FOA AUTO': linha.foa_auto,
    'CUSTOS TOTAIS': linha.custos_totais,
    'RESULTADO': linha.resultado,
  })) || [];

  const dreSheet = XLSX.utils.json_to_sheet(dreRows);
  XLSX.utils.book_append_sheet(workbook, dreSheet, 'DRE');

  // Aba REEMBOLSOS
  const { data: reembolsos } = await supabase
    .from('reembolsos_foa_fof')
    .select('*')
    .eq('projeto_id', projectId)
    .order('data_reembolso');

  const reembolsosRows = reembolsos?.map(r => ({
    DATA: r.data_reembolso,
    DESCRICAO: r.descricao,
    TIPO: r.tipo,
    VALOR: r.valor,
    'META TOTAL': r.meta_total || '',
    '% CUMPRIDO': r.percentual_cumprido || '',
    OBSERVACOES: r.observacoes || '',
  })) || [];

  const reembolsosSheet = XLSX.utils.json_to_sheet(reembolsosRows);
  XLSX.utils.book_append_sheet(workbook, reembolsosSheet, 'REEMBOLSO FOF');

  // Gerar arquivo
  const fileName = `FOA_${projeto.nome}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
