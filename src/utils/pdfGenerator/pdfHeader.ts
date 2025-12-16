/**
 * PDF Header component for FOA reports
 * Matches official FOA document format
 */

import { colors, fonts, setColor, foaCompanyInfo } from './pdfStyles';

// FOA Official Logo as base64 (blue logo)
// This should be replaced with actual FOA logo from assets
import foaLogoUrl from '@/assets/foa-logo-official.png';

export interface HeaderOptions {
  projeto?: {
    nome?: string;
    cliente?: string;
  };
  titulo?: string;
  subtitulo?: string;
  showDate?: boolean;
  logoBase64?: string;
}

// Function to convert image to base64 (called once and cached)
let cachedLogoBase64: string | null = null;

export async function loadLogoBase64(): Promise<string> {
  if (cachedLogoBase64) return cachedLogoBase64;
  
  try {
    const response = await fetch(foaLogoUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        cachedLogoBase64 = reader.result as string;
        resolve(cachedLogoBase64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('Could not load FOA logo:', e);
    return '';
  }
}

/**
 * Draw the official FOA header with logo on left and company info on right
 */
export function drawHeader(doc: any, options: HeaderOptions = {}): number {
  const { logoBase64 } = options;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 10;

  // Draw FOA logo on the left
  const logoSize = 25;
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 15, y, logoSize, logoSize);
    } catch (e) {
      // Fallback text logo
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      setColor(doc, colors.primary);
      doc.text('FOA', 15, y + 15);
    }
  } else {
    // Placeholder logo
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    setColor(doc, colors.primary);
    doc.text('FOA', 15, y + 15);
  }

  // Company information on the right (as in official document)
  const rightX = pageWidth - 15;
  doc.setFontSize(fonts.header.size);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.dark);
  doc.text(foaCompanyInfo.name, rightX, y + 4, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.medium);
  doc.text(foaCompanyInfo.address, rightX, y + 9, { align: 'right' });
  doc.text(foaCompanyInfo.nif, rightX, y + 14, { align: 'right' });
  doc.text(foaCompanyInfo.phone, rightX, y + 19, { align: 'right' });
  doc.text(foaCompanyInfo.email, rightX, y + 24, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.text(foaCompanyInfo.location, rightX, y + 29, { align: 'right' });

  // Blue separator line
  y = 42;
  doc.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
  doc.setLineWidth(1);
  doc.line(15, y, pageWidth - 15, y);

  return y + 8; // Return next Y position for content
}

/**
 * Draw a section title (numbered sections like in FOA docs)
 */
export function drawSectionTitle(doc: any, title: string, y: number, numbered?: number): number {
  doc.setFontSize(fonts.sectionTitle.size);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.dark);
  
  const displayTitle = numbered ? `${numbered}. ${title}` : title;
  doc.text(displayTitle, 15, y);
  
  return y + 8;
}

/**
 * Draw a subsection title
 */
export function drawSubsectionTitle(doc: any, title: string, y: number, bullet: boolean = true): number {
  doc.setFontSize(fonts.body.size);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.dark);
  
  const displayTitle = bullet ? `• ${title}` : title;
  doc.text(displayTitle, 15, y);
  
  return y + 6;
}

/**
 * Draw a KPI card with color bar
 */
export function drawKPICard(
  doc: any,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string,
  color: { r: number; g: number; b: number },
  icon?: string
): void {
  // Card background
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(colors.tableBorder.r, colors.tableBorder.g, colors.tableBorder.b);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, width, height, 2, 2, 'FD');
  
  // Left color bar
  doc.setFillColor(color.r, color.g, color.b);
  doc.rect(x, y, 3, height, 'F');
  
  // Icon (emoji or text)
  if (icon) {
    doc.setFontSize(12);
    setColor(doc, color);
    doc.text(icon, x + 8, y + height / 2 + 1);
  }
  
  // Label
  doc.setFontSize(fonts.small.size);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.medium);
  doc.text(label, x + (icon ? 18 : 8), y + 8);
  
  // Value
  doc.setFontSize(fonts.subtitle.size);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.dark);
  doc.text(value, x + (icon ? 18 : 8), y + height - 6);
}

/**
 * Draw document title (centered, bold)
 */
export function drawDocumentTitle(doc: any, title: string, y: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(fonts.title.size);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.dark);
  doc.text(title, pageWidth / 2, y, { align: 'center' });
  
  return y + 10;
}

/**
 * Draw paragraph text
 */
export function drawParagraph(doc: any, text: string, y: number, maxWidth?: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const width = maxWidth || pageWidth - 30;
  
  doc.setFontSize(fonts.body.size);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.dark);
  
  const lines = doc.splitTextToSize(text, width);
  doc.text(lines, 15, y);
  
  return y + (lines.length * 5) + 4;
}
