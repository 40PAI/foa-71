/**
 * PDF Header component for FOA reports
 */

import { colors, fonts, setColor, drawRect, drawLine, formatDatePDF } from './pdfStyles';

// Load logo as base64 - we'll use a placeholder or embedded logo
const FOA_LOGO_BASE64 = 'data:image/png;base64,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';

export interface HeaderOptions {
  projeto?: {
    nome?: string;
    cliente?: string;
  };
  titulo?: string;
  subtitulo?: string;
  showDate?: boolean;
}

export function drawHeader(doc: any, options: HeaderOptions = {}): number {
  const { titulo = 'RELATÓRIO FOA', subtitulo, showDate = true, projeto } = options;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 10;

  // Background header bar
  drawRect(doc, 0, 0, pageWidth, 35, colors.primary);
  
  // Add logo
  try {
    doc.addImage(FOA_LOGO_BASE64, 'PNG', 10, 5, 25, 25);
  } catch (e) {
    // If logo fails, draw placeholder
    drawRect(doc, 10, 5, 25, 25, colors.white);
    doc.setFontSize(8);
    setColor(doc, colors.primary);
    doc.text('FOA', 15, 20);
  }

  // Title
  doc.setFontSize(fonts.title.size);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.white);
  doc.text(titulo, 45, 18);

  // Subtitle or project name
  if (subtitulo || projeto?.nome) {
    doc.setFontSize(fonts.body.size);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitulo || projeto?.nome || '', 45, 26);
  }

  // Date on the right
  if (showDate) {
    doc.setFontSize(fonts.small.size);
    doc.setFont('helvetica', 'normal');
    const dateText = `Gerado em: ${formatDatePDF(new Date())}`;
    const dateWidth = doc.getTextWidth(dateText);
    doc.text(dateText, pageWidth - dateWidth - 10, 18);
  }

  // Decorative line under header
  y = 38;
  drawLine(doc, 10, y, pageWidth - 10, y, colors.primaryDark, 1);

  return y + 5; // Return next Y position
}

export function drawSectionTitle(doc: any, title: string, y: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Section background
  drawRect(doc, 10, y, pageWidth - 20, 8, colors.light);
  
  // Section title
  doc.setFontSize(fonts.sectionTitle.size);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.primaryDark);
  doc.text(title, 15, y + 6);
  
  return y + 12;
}

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
  drawRect(doc, x, y, width, height, colors.white);
  
  // Left color bar
  drawRect(doc, x, y, 3, height, color);
  
  // Border
  drawRect(doc, x, y, width, height, colors.tableBorder, false);
  
  // Icon or indicator
  if (icon) {
    doc.setFontSize(14);
    setColor(doc, color);
    doc.text(icon, x + 8, y + height / 2 + 2);
  }
  
  // Label
  doc.setFontSize(fonts.small.size);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.medium);
  doc.text(label, x + (icon ? 20 : 8), y + 8);
  
  // Value
  doc.setFontSize(fonts.subtitle.size);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.dark);
  doc.text(value, x + (icon ? 20 : 8), y + height - 6);
}
