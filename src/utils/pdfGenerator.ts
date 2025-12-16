/**
 * Professional PDF Generator for FOA Reports
 * Refactored with modular components for rich, branded reports
 */

import jsPDF from 'jspdf';
import { drawHeader, drawSectionTitle, drawKPICard } from './pdfGenerator/pdfHeader';
import { addPageNumbers } from './pdfGenerator/pdfFooter';
import { drawCoverPage } from './pdfGenerator/pdfCover';
import { drawProfessionalTable, drawSummaryTable } from './pdfGenerator/pdfTables';
import { drawAlert, drawProgressBar, generateFinancialAlerts } from './pdfGenerator/pdfAlerts';
import { colors, formatCurrencyPDF, formatDatePDF } from './pdfGenerator/pdfStyles';

export function generateDREPDF(projeto: any, mes: number, ano: number, linhasDRE: any[]) {
  const doc = new jsPDF();
  
  // Header
  let y = drawHeader(doc, {
    titulo: 'DRE - Demonstração de Resultados',
    subtitulo: `${projeto.nome} - ${mes}/${ano}`,
  });

  y = drawSectionTitle(doc, 'Resultados por Centro de Custo', y + 5);

  // Table with professional styling
  const totais = linhasDRE.reduce((acc, linha) => ({
    receita_cliente: (acc.receita_cliente || 0) + (linha.receita_cliente || 0),
    fof_financiamento: (acc.fof_financiamento || 0) + (linha.fof_financiamento || 0),
    foa_auto: (acc.foa_auto || 0) + (linha.foa_auto || 0),
    custos_totais: (acc.custos_totais || 0) + (linha.custos_totais || 0),
    resultado: (acc.resultado || 0) + (linha.resultado || 0),
  }), {});

  y = drawProfessionalTable(doc, {
    startY: y,
    columns: [
      { header: 'Centro de Custo', dataKey: 'centro_nome', align: 'left' },
      { header: 'Receita Cliente', dataKey: 'receita_cliente', isCurrency: true },
      { header: 'FOF Financ.', dataKey: 'fof_financiamento', isCurrency: true },
      { header: 'FOA Auto', dataKey: 'foa_auto', isCurrency: true },
      { header: 'Custos', dataKey: 'custos_totais', isCurrency: true },
      { header: 'Resultado', dataKey: 'resultado', isCurrency: true, isNegativeRed: true },
    ],
    data: linhasDRE,
    showTotals: true,
    totalsRow: { centro_nome: 'TOTAL', ...totais },
  });

  addPageNumbers(doc);
  doc.save(`DRE_${projeto.nome}_${mes}_${ano}.pdf`);
}

export function generateReembolsosPDF(projeto: any, reembolsos: any[]) {
  const doc = new jsPDF();
  
  let y = drawHeader(doc, {
    titulo: 'Histórico de Reembolsos FOA ↔ FOF',
    subtitulo: projeto.nome,
  });

  y = drawSectionTitle(doc, 'Movimentações de Amortização', y + 5);

  const totalAmortizacao = reembolsos
    .filter(r => r.tipo === 'amortizacao')
    .reduce((sum, r) => sum + (r.valor || 0), 0);

  y = drawProfessionalTable(doc, {
    startY: y,
    columns: [
      { header: 'Data', dataKey: 'data_reembolso', align: 'center' },
      { header: 'Descrição', dataKey: 'descricao', align: 'left' },
      { header: 'Tipo', dataKey: 'tipo_display', align: 'center' },
      { header: 'Valor', dataKey: 'valor', isCurrency: true },
      { header: '% Cumprido', dataKey: 'percentual_cumprido', isPercentage: true },
    ],
    data: reembolsos.map(r => ({
      ...r,
      tipo_display: r.tipo === 'amortizacao' ? 'Amortização' : 'Aporte',
    })),
    showTotals: true,
    totalsRow: { data_reembolso: '', descricao: 'TOTAL AMORTIZADO', tipo_display: '', valor: totalAmortizacao, percentual_cumprido: null },
  });

  addPageNumbers(doc);
  doc.save(`Reembolsos_${projeto.nome}.pdf`);
}

export function generateResumoFOAPDF(projeto: any, resumo: any) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Cover page
  drawCoverPage(doc, {
    titulo: 'RESUMO EXECUTIVO FOA',
    subtitulo: 'Relatório de Situação Financeira',
    projeto: { nome: projeto.nome, cliente: projeto.cliente },
  });

  // Second page with content
  doc.addPage();
  let y = drawHeader(doc, { titulo: 'Resumo Financeiro FOA', subtitulo: projeto.nome });

  // KPI Cards
  y = drawSectionTitle(doc, 'Indicadores Principais', y + 5);
  
  const cardWidth = (pageWidth - 40) / 2;
  const cardHeight = 30;
  
  drawKPICard(doc, 15, y, cardWidth, cardHeight, 'FOF Financiamento', formatCurrencyPDF(resumo?.fof_financiamento || 0), colors.primary, '💰');
  drawKPICard(doc, 20 + cardWidth, y, cardWidth, cardHeight, 'Amortização', formatCurrencyPDF(resumo?.amortizacao || 0), colors.success, '✓');
  
  y += cardHeight + 8;
  
  const dividaColor = (resumo?.divida_foa_com_fof || 0) > 0 ? colors.danger : colors.success;
  drawKPICard(doc, 15, y, cardWidth, cardHeight, 'Dívida FOA ↔ FOF', formatCurrencyPDF(resumo?.divida_foa_com_fof || 0), dividaColor, '📊');
  
  y += cardHeight + 15;

  // Summary table
  y = drawSectionTitle(doc, 'Detalhamento', y);
  y = drawSummaryTable(doc, y + 5, [
    { label: 'FOF Financiamento (Saídas)', value: formatCurrencyPDF(resumo?.fof_financiamento || 0), color: colors.primary },
    { label: 'Total Amortizado', value: formatCurrencyPDF(resumo?.amortizacao || 0), color: colors.success },
    { label: 'Dívida FOA com FOF', value: formatCurrencyPDF(resumo?.divida_foa_com_fof || 0), color: dividaColor },
  ]);

  // Alerts section
  const alerts = generateFinancialAlerts(resumo);
  if (alerts.length > 0) {
    y = drawSectionTitle(doc, 'Alertas e Observações', y + 10);
    alerts.forEach(alert => {
      y = drawAlert(doc, 15, y, pageWidth - 30, alert);
    });
  }

  addPageNumbers(doc);
  doc.save(`Resumo_FOA_${projeto.nome}.pdf`);
}

// Re-export utilities
export { formatCurrencyPDF, formatDatePDF } from './pdfGenerator/pdfStyles';
