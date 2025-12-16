/**
 * PDF Footer component for FOA reports
 * Based on official FOA document formatting
 */

import { colors, fonts, setColor, drawLine, drawRect, foaCompanyInfo } from './pdfStyles';

export interface FooterOptions {
  showConfidential?: boolean;
  customText?: string;
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
  doc.text(foaCompanyInfo.shortAddress, pageWidth / 2, y + 4, { align: 'center' });
  
  // Line 2: Email and Phone
  doc.text(`${foaCompanyInfo.email} | ${foaCompanyInfo.phone}`, pageWidth / 2, y + 8, { align: 'center' });

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
export function addPageNumbers(doc: any, options: FooterOptions = {}): void {
  const totalPages = doc.internal.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, i, totalPages, options);
  }
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
