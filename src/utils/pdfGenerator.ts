/**
 * Professional PDF Generator for FOA Reports
 * Matches official FOA document formatting
 */

import jsPDF from 'jspdf';
import { drawHeader, drawSectionTitle, drawKPICard, drawDocumentTitle, loadLogoBase64 } from './pdfGenerator/pdfHeader';
import { addPageNumbers, drawConsideracoesFinais } from './pdfGenerator/pdfFooter';
import { drawCoverPage, loadCoverImages, drawInnerPageHeader } from './pdfGenerator/pdfCover';
import { drawProfessionalTable, drawSummaryTable, drawDRETable } from './pdfGenerator/pdfTables';
import { drawAlert, drawProgressBar, generateFinancialAlerts } from './pdfGenerator/pdfAlerts';
import { colors, formatCurrencyPDF, formatDatePDF, sanitizeForPDF } from './pdfGenerator/pdfStyles';

/**
 * Generate DRE (Demonstração de Resultados) PDF
 */
export async function generateDREPDF(projeto: any, mes: number, ano: number, linhasDRE: any[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Load logo
  const logoBase64 = await loadLogoBase64();
  
  // Header
  let y = drawHeader(doc, { logoBase64 });
  
  // Document title
  y = drawDocumentTitle(doc, 'DRE - Demonstracao de Resultados', y + 5);
  
  // Project info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.medium.r, colors.medium.g, colors.medium.b);
  doc.text(`Projeto: ${sanitizeForPDF(projeto.nome)} | Periodo: ${mes}/${ano}`, pageWidth / 2, y, { align: 'center' });
  y += 12;

  // Section title
  y = drawSectionTitle(doc, 'Resultados por Centro de Custo', y);

  // Calculate totals
  const totais = linhasDRE.reduce((acc, linha) => ({
    receita_cliente: (acc.receita_cliente || 0) + (linha.receita_cliente || 0),
    fof_financiamento: (acc.fof_financiamento || 0) + (linha.fof_financiamento || 0),
    foa_auto: (acc.foa_auto || 0) + (linha.foa_auto || 0),
    custos_totais: (acc.custos_totais || 0) + (linha.custos_totais || 0),
    resultado: (acc.resultado || 0) + (linha.resultado || 0),
  }), {});

  // Table with professional styling
  y = drawDRETable(doc, {
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
    greenFooter: true,
  });

  // Add consideracoes finais if space
  if (y < 240) {
    y = drawConsideracoesFinais(doc, y + 15,
      'A DRE apresenta os resultados financeiros do projeto por centro de custo, ' +
      'permitindo analise detalhada da performance financeira e tomada de decisoes estrategicas.'
    );
  }

  addPageNumbers(doc);
  doc.save(`DRE_${sanitizeForPDF(projeto.nome)}_${mes}_${ano}.pdf`);
}

/**
 * Generate Reembolsos FOA PDF
 */
export async function generateReembolsosPDF(projeto: any, reembolsos: any[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Load logo
  const logoBase64 = await loadLogoBase64();
  
  // Header
  let y = drawHeader(doc, { logoBase64 });
  
  // Document title - use sanitized text (no unicode arrows)
  y = drawDocumentTitle(doc, 'Historico de Reembolsos FOA - FOF', y + 5);
  
  // Project info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.medium.r, colors.medium.g, colors.medium.b);
  doc.text(`Projeto: ${sanitizeForPDF(projeto.nome)}`, pageWidth / 2, y, { align: 'center' });
  y += 12;

  y = drawSectionTitle(doc, 'Movimentacoes de Amortizacao', y);

  const totalAmortizacao = reembolsos
    .filter(r => r.tipo === 'amortizacao')
    .reduce((sum, r) => sum + (r.valor || 0), 0);

  y = drawProfessionalTable(doc, {
    startY: y,
    columns: [
      { header: 'Data', dataKey: 'data_reembolso', align: 'center' },
      { header: 'Descricao', dataKey: 'descricao', align: 'left' },
      { header: 'Tipo', dataKey: 'tipo_display', align: 'center' },
      { header: 'Valor', dataKey: 'valor', isCurrency: true },
      { header: '% Cumprido', dataKey: 'percentual_cumprido', isPercentage: true },
    ],
    data: reembolsos.map(r => ({
      ...r,
      data_reembolso: formatDatePDF(r.data_reembolso),
      descricao: sanitizeForPDF(r.descricao || ''),
      tipo_display: r.tipo === 'amortizacao' ? 'Amortizacao' : 'Aporte',
    })),
    showTotals: true,
    totalsRow: { 
      data_reembolso: '', 
      descricao: 'TOTAL AMORTIZADO', 
      tipo_display: '', 
      valor: totalAmortizacao, 
      percentual_cumprido: null 
    },
  });

  // Summary
  if (y < 240) {
    y = drawConsideracoesFinais(doc, y + 15,
      'Este relatorio apresenta o historico completo de reembolsos entre FOA e FOF, ' +
      'permitindo acompanhamento da evolucao das amortizacoes e controle da divida.'
    );
  }

  addPageNumbers(doc);
  doc.save(`Reembolsos_${sanitizeForPDF(projeto.nome)}.pdf`);
}

/**
 * Generate Resumo FOA PDF (with cover page)
 */
export async function generateResumoFOAPDF(projeto: any, resumo: any) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Load images
  const { logo: logoBase64, watermark: watermarkBase64 } = await loadCoverImages();
  
  // Cover page
  drawCoverPage(doc, {
    titulo: 'RESUMO EXECUTIVO FOA',
    subtitulo: 'Relatorio de Situacao Financeira',
    projeto: { nome: sanitizeForPDF(projeto.nome), cliente: sanitizeForPDF(projeto.cliente || '') },
    logoBase64,
    watermarkBase64,
  });

  // Second page with content
  doc.addPage();
  let y = drawInnerPageHeader(doc, 'Resumo Financeiro FOA', logoBase64);

  // KPI Cards section
  y = drawSectionTitle(doc, 'Indicadores Principais', y);
  
  const cardWidth = (pageWidth - 45) / 2;
  const cardHeight = 28;
  
  // Row 1: FOF Financiamento | Amortizacao (NO EMOJIS)
  drawKPICard(doc, 15, y, cardWidth, cardHeight, 'FOF Financiamento', formatCurrencyPDF(resumo?.fof_financiamento || 0), colors.primary);
  drawKPICard(doc, 25 + cardWidth, y, cardWidth, cardHeight, 'Amortizacao', formatCurrencyPDF(resumo?.amortizacao || 0), colors.success);
  
  y += cardHeight + 8;
  
  // Row 2: Divida FOA - FOF (NO EMOJIS, NO UNICODE ARROWS)
  const dividaColor = (resumo?.divida_foa_com_fof || 0) > 0 ? colors.danger : colors.success;
  drawKPICard(doc, 15, y, cardWidth, cardHeight, 'Divida FOA - FOF', formatCurrencyPDF(resumo?.divida_foa_com_fof || 0), dividaColor);
  
  y += cardHeight + 15;

  // Summary table section
  y = drawSectionTitle(doc, 'Detalhamento Financeiro', y);
  y = drawSummaryTable(doc, y + 5, [
    { label: 'FOF Financiamento (Custos financiados pela FOF)', value: formatCurrencyPDF(resumo?.fof_financiamento || 0), color: colors.primary },
    { label: 'Total Amortizado', value: formatCurrencyPDF(resumo?.amortizacao || 0), color: colors.success },
    { label: 'Divida FOA com FOF', value: formatCurrencyPDF(resumo?.divida_foa_com_fof || 0), color: dividaColor },
  ]);

  // Alerts section
  const alerts = generateFinancialAlerts(resumo);
  if (alerts.length > 0) {
    y = drawSectionTitle(doc, 'Alertas e Observacoes', y + 10);
    alerts.forEach(alert => {
      y = drawAlert(doc, 15, y, pageWidth - 30, alert);
    });
  }

  // Consideracoes finais
  if (y < 230) {
    y = drawConsideracoesFinais(doc, y + 10,
      'Este resumo apresenta a situacao financeira atual do projeto em relacao ao financiamento FOF, ' +
      'permitindo acompanhamento da divida e planejamento de amortizacoes futuras.'
    );
  }

  addPageNumbers(doc, true); // Exclude cover page from numbering
  doc.save(`Resumo_FOA_${sanitizeForPDF(projeto.nome)}.pdf`);
}

/**
 * Generate complete FOA report (multi-page with all sections)
 */
export async function generateRelatorioCompletoFOAPDF(
  projeto: any, 
  resumo: any, 
  linhasDRE: any[], 
  reembolsos: any[],
  mes: number,
  ano: number
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Load images
  const { logo: logoBase64, watermark: watermarkBase64 } = await loadCoverImages();
  
  // ==================== PAGE 1: Cover ====================
  drawCoverPage(doc, {
    titulo: 'RELATORIO FINANCEIRO COMPLETO',
    subtitulo: `Periodo: ${mes}/${ano}`,
    projeto: { nome: sanitizeForPDF(projeto.nome), cliente: sanitizeForPDF(projeto.cliente || '') },
    logoBase64,
    watermarkBase64,
  });

  // ==================== PAGE 2: Resumo Executivo ====================
  doc.addPage();
  let y = drawInnerPageHeader(doc, 'Resumo Executivo', logoBase64);
  
  // KPI Cards (NO EMOJIS)
  const cardWidth = (pageWidth - 50) / 3;
  const cardHeight = 28;
  
  drawKPICard(doc, 15, y, cardWidth, cardHeight, 'FOF Financiamento', formatCurrencyPDF(resumo?.fof_financiamento || 0), colors.primary);
  drawKPICard(doc, 20 + cardWidth, y, cardWidth, cardHeight, 'Amortizacao', formatCurrencyPDF(resumo?.amortizacao || 0), colors.success);
  drawKPICard(doc, 25 + cardWidth * 2, y, cardWidth, cardHeight, 'Divida FOA', formatCurrencyPDF(resumo?.divida_foa_com_fof || 0), 
    (resumo?.divida_foa_com_fof || 0) > 0 ? colors.danger : colors.success);
  
  y += cardHeight + 15;

  // Alerts
  const alerts = generateFinancialAlerts(resumo);
  if (alerts.length > 0) {
    y = drawSectionTitle(doc, 'Alertas', y);
    alerts.forEach(alert => {
      y = drawAlert(doc, 15, y, pageWidth - 30, alert);
    });
  }

  // ==================== PAGE 3: DRE ====================
  doc.addPage();
  y = drawInnerPageHeader(doc, 'DRE - Demonstracao de Resultados', logoBase64);
  
  const totais = linhasDRE.reduce((acc, linha) => ({
    receita_cliente: (acc.receita_cliente || 0) + (linha.receita_cliente || 0),
    fof_financiamento: (acc.fof_financiamento || 0) + (linha.fof_financiamento || 0),
    foa_auto: (acc.foa_auto || 0) + (linha.foa_auto || 0),
    custos_totais: (acc.custos_totais || 0) + (linha.custos_totais || 0),
    resultado: (acc.resultado || 0) + (linha.resultado || 0),
  }), {});

  y = drawDRETable(doc, {
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
    totalsRow: totais,
    greenFooter: true,
  });

  // ==================== PAGE 4: Reembolsos ====================
  if (reembolsos.length > 0) {
    doc.addPage();
    y = drawInnerPageHeader(doc, 'Historico de Reembolsos', logoBase64);
    
    const totalAmortizacao = reembolsos
      .filter(r => r.tipo === 'amortizacao')
      .reduce((sum, r) => sum + (r.valor || 0), 0);

    y = drawProfessionalTable(doc, {
      startY: y,
      columns: [
        { header: 'Data', dataKey: 'data_reembolso', align: 'center' },
        { header: 'Descricao', dataKey: 'descricao', align: 'left' },
        { header: 'Tipo', dataKey: 'tipo_display', align: 'center' },
        { header: 'Valor', dataKey: 'valor', isCurrency: true },
      ],
      data: reembolsos.map(r => ({
        ...r,
        data_reembolso: formatDatePDF(r.data_reembolso),
        descricao: sanitizeForPDF(r.descricao || ''),
        tipo_display: r.tipo === 'amortizacao' ? 'Amortizacao' : 'Aporte',
      })),
      showTotals: true,
      totalsRow: { data_reembolso: '', descricao: 'TOTAL', tipo_display: '', valor: totalAmortizacao },
    });
  }

  // ==================== Final Page: Consideracoes ====================
  doc.addPage();
  y = drawInnerPageHeader(doc, 'Consideracoes Finais', logoBase64);
  
  y = drawConsideracoesFinais(doc, y + 10,
    'Este relatorio apresenta uma visao consolidada e completa da situacao financeira do projeto, ' +
    'incluindo a Demonstracao de Resultados do Exercicio (DRE), o historico de reembolsos entre FOA e FOF, ' +
    'e os principais indicadores de desempenho financeiro. ' +
    'As informacoes aqui contidas permitem uma analise detalhada para tomada de decisoes estrategicas ' +
    'e acompanhamento da evolucao do projeto.'
  );

  addPageNumbers(doc, true);
  doc.save(`Relatorio_Completo_${sanitizeForPDF(projeto.nome)}_${mes}_${ano}.pdf`);
}

// Re-export utilities
export { formatCurrencyPDF, formatDatePDF, sanitizeForPDF } from './pdfGenerator/pdfStyles';
