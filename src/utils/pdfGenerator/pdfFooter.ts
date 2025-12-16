/**
 * PDF Footer component for FOA reports
 * Based on official FOA document formatting
 */

import { colors, fonts, setColor, drawLine, drawRect, foaCompanyInfo } from './pdfStyles';

export interface FooterOptions {
  showConfidential?: boolean;
  customText?: string;
  excludeFirstPage?: boolean;
}

/**
 * Draw the official FOA document footer
 * Includes contact information and page number
 */
export function drawFooter(
  doc: any,
  pageNumber: number,
  totalPages: number,
  options: FooterOptions = {}
): void {
  const { showConfidential = false } = options;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const y = pageHeight - 20;

  // Blue footer bar
  drawRect(doc, 15, y, pageWidth - 30, 12, colors.primary);

  // Contact info centered in footer
  doc.setFontSize(fonts.tiny.size);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.white);
  
  // Line 1: Address
  doc.text(foaCompanyInfo.footerAddress, pageWidth / 2, y + 4, { align: 'center' });
  
  // Line 2: Email and Phone
  doc.text(`${foaCompanyInfo.footerEmail} | ${foaCompanyInfo.footerPhone}`, pageWidth / 2, y + 8, { align: 'center' });

  // Page number below footer bar
  doc.setFontSize(fonts.tiny.size);
  setColor(doc, colors.medium);
  const pageText = `Página ${pageNumber} de ${totalPages}`;
  doc.text(pageText, pageWidth / 2, y + 16, { align: 'center' });

  // Confidential marker (if enabled)
  if (showConfidential) {
    setColor(doc, colors.danger);
    doc.text('CONFIDENCIAL', pageWidth - 15, y + 16, { align: 'right' });
  }
}

/**
 * Add page numbers and footers to all pages
 */
export function addPageNumbers(doc: any, excludeFirstPage: boolean = false): void {
  const totalPages = doc.internal.getNumberOfPages();
  const actualTotalPages = excludeFirstPage ? totalPages - 1 : totalPages;
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Skip first page if it's a cover
    if (excludeFirstPage && i === 1) continue;
    
    const displayNumber = excludeFirstPage ? i - 1 : i;
    drawFooter(doc, displayNumber, actualTotalPages);
  }
}

/**
 * Draw "Considerações Finais" section (as in official FOA docs)
 */
export function drawConsideracoesFinais(doc: any, y: number, text?: string): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Section title
  doc.setFontSize(fonts.sectionTitle.size);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.dark);
  doc.text('Considerações Finais', 15, y);
  
  y += 8;
  
  // Default text if not provided
  const finalText = text || 
    'Este relatório apresenta uma visão consolidada da situação financeira do projeto, ' +
    'permitindo uma melhor rastreabilidade das operações, aumento da produtividade ' +
    'e maior controle de materiais, tarefas e custos.';
  
  doc.setFontSize(fonts.body.size);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.dark);
  
  const lines = doc.splitTextToSize(finalText, pageWidth - 30);
  doc.text(lines, 15, y);
  
  return y + (lines.length * 5) + 10;
}

/**
 * Draw simple footer without contact info (for cover pages)
 */
export function drawSimpleFooter(doc: any): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Just a thin blue line
  drawLine(doc, 15, pageHeight - 15, pageWidth - 15, pageHeight - 15, colors.primary, 1);
}
