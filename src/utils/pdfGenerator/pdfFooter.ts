/**
 * PDF Footer component for FOA reports
 */

import { colors, fonts, setColor, drawLine } from './pdfStyles';

export interface FooterOptions {
  showConfidential?: boolean;
  customText?: string;
}

export function drawFooter(
  doc: any,
  pageNumber: number,
  totalPages: number,
  options: FooterOptions = {}
): void {
  const { showConfidential = false, customText } = options;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const y = pageHeight - 15;

  // Line above footer
  drawLine(doc, 10, y, pageWidth - 10, y, colors.light, 0.5);

  // Footer text
  doc.setFontSize(fonts.tiny.size);
  doc.setFont('helvetica', 'normal');

  // Left: Auto-generated text
  setColor(doc, colors.medium);
  doc.text(customText || 'Documento gerado automaticamente pelo Sistema FOA', 10, y + 5);

  // Center: Page number
  const pageText = `Página ${pageNumber} de ${totalPages}`;
  const pageTextWidth = doc.getTextWidth(pageText);
  doc.text(pageText, (pageWidth - pageTextWidth) / 2, y + 5);

  // Right: Confidential or company name
  if (showConfidential) {
    setColor(doc, colors.danger);
    const confText = 'CONFIDENCIAL';
    const confWidth = doc.getTextWidth(confText);
    doc.text(confText, pageWidth - confWidth - 10, y + 5);
  } else {
    setColor(doc, colors.medium);
    const companyText = 'FOA - Gestão de Projetos';
    const companyWidth = doc.getTextWidth(companyText);
    doc.text(companyText, pageWidth - companyWidth - 10, y + 5);
  }
}

export function addPageNumbers(doc: any, options: FooterOptions = {}): void {
  const totalPages = doc.internal.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, i, totalPages, options);
  }
}
