import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './currency';

export function generateDREPDF(projeto: any, mes: number, ano: number, linhasDRE: any[]) {
  const doc = new jsPDF();
  
  // Cabeçalho
  doc.setFontSize(18);
  doc.text('Demonstração de Resultados - FOA', 14, 22);
  doc.setFontSize(11);
  doc.text(`Projeto: ${projeto.nome}`, 14, 30);
  doc.text(`Período: ${mes}/${ano}`, 14, 36);
  
  // Tabela
  const tableData = linhasDRE.map(linha => [
    linha.centro_nome,
    formatCurrency(linha.receita_cliente),
    formatCurrency(linha.fof_financiamento),
    formatCurrency(linha.foa_auto),
    formatCurrency(linha.custos_totais),
    formatCurrency(linha.resultado),
  ]);

  // Totais
  const totais = linhasDRE.reduce((acc, linha) => ({
    receita: acc.receita + linha.receita_cliente,
    fof: acc.fof + linha.fof_financiamento,
    foa: acc.foa + linha.foa_auto,
    custos: acc.custos + linha.custos_totais,
    resultado: acc.resultado + linha.resultado,
  }), { receita: 0, fof: 0, foa: 0, custos: 0, resultado: 0 });

  tableData.push([
    'TOTAL',
    formatCurrency(totais.receita),
    formatCurrency(totais.fof),
    formatCurrency(totais.foa),
    formatCurrency(totais.custos),
    formatCurrency(totais.resultado),
  ]);

  autoTable(doc, {
    head: [['Centro de Custo', 'Receita Cliente', 'FOF Financ.', 'FOA Auto', 'Custos', 'Resultado']],
    body: tableData,
    startY: 42,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
  });

  // Salvar
  doc.save(`DRE_${projeto.nome}_${mes}_${ano}.pdf`);
}

export function generateReembolsosPDF(projeto: any, reembolsos: any[]) {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Reembolsos FOA ↔ FOF', 14, 22);
  doc.setFontSize(11);
  doc.text(`Projeto: ${projeto.nome}`, 14, 30);
  
  const tableData = reembolsos.map(r => [
    r.data_reembolso,
    r.descricao,
    r.tipo === 'amortizacao' ? 'Amortização' : 'Aporte',
    formatCurrency(r.valor),
    r.percentual_cumprido ? `${r.percentual_cumprido}%` : '-',
  ]);

  const totalAmortizacao = reembolsos
    .filter(r => r.tipo === 'amortizacao')
    .reduce((sum, r) => sum + r.valor, 0);

  tableData.push([
    'TOTAL AMORTIZADO',
    '',
    '',
    formatCurrency(totalAmortizacao),
    '',
  ]);

  autoTable(doc, {
    head: [['Data', 'Descrição', 'Tipo', 'Valor', '% Cumprido']],
    body: tableData,
    startY: 36,
    theme: 'striped',
    headStyles: { fillColor: [52, 152, 219] },
  });

  doc.save(`Reembolsos_${projeto.nome}.pdf`);
}

export function generateResumoFOAPDF(projeto: any, resumo: any) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Resumo Executivo FOA', 14, 22);
  doc.setFontSize(12);
  doc.text(`Projeto: ${projeto.nome}`, 14, 32);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 38);

  // KPIs principais
  const kpis = [
    ['FOF Financiamento', formatCurrency(resumo.fof_financiamento)],
    ['Amortização', formatCurrency(resumo.amortizacao)],
    ['Custos Suportados FOA', formatCurrency(resumo.custos_suportados)],
    ['Dívida FOA ↔ FOF', formatCurrency(resumo.divida_foa_com_fof)],
  ];

  autoTable(doc, {
    body: kpis,
    startY: 45,
    theme: 'plain',
    styles: { fontSize: 14, cellPadding: 8 },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'left' },
      1: { halign: 'right', textColor: [52, 73, 94] },
    },
  });

  // Alerta se dívida alta
  if (resumo.divida_foa_com_fof > 100000000) {
    doc.setTextColor(231, 76, 60);
    doc.setFontSize(12);
    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    doc.text('⚠️ ATENÇÃO: Dívida acima de 100M Kz', 14, finalY + 15);
  }

  doc.save(`Resumo_FOA_${projeto.nome}.pdf`);
}
