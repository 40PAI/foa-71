/**
 * Cover page for FOA PDF reports
 */

import { colors, fonts, setColor, drawRect, formatDatePDF } from './pdfStyles';

// FOA Logo as base64
const FOA_LOGO_BASE64 = 'data:image/png;base64,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';

export interface CoverOptions {
  titulo: string;
  subtitulo?: string;
  projeto?: {
    nome?: string;
    cliente?: string;
    localizacao?: string;
    responsavel?: string;
  };
  periodo?: string;
  geradoPor?: string;
}

export function drawCoverPage(doc: any, options: CoverOptions): void {
  const { titulo, subtitulo, projeto, periodo, geradoPor } = options;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;

  // Background gradient effect (top section)
  drawRect(doc, 0, 0, pageWidth, pageHeight * 0.4, colors.primary);
  
  // Diagonal decorative element
  doc.setFillColor(colors.primaryDark.r, colors.primaryDark.g, colors.primaryDark.b);
  doc.triangle(0, pageHeight * 0.35, pageWidth, pageHeight * 0.25, pageWidth, pageHeight * 0.4, 'F');

  // Logo
  try {
    doc.addImage(FOA_LOGO_BASE64, 'PNG', centerX - 30, 40, 60, 60);
  } catch (e) {
    // Placeholder if logo fails
    doc.setFontSize(40);
    setColor(doc, colors.white);
    doc.text('FOA', centerX, 80, { align: 'center' });
  }

  // Main title
  doc.setFontSize(fonts.title.size + 8);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.white);
  doc.text(titulo, centerX, 130, { align: 'center' });

  // Subtitle
  if (subtitulo) {
    doc.setFontSize(fonts.subtitle.size);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitulo, centerX, 145, { align: 'center' });
  }

  // Project info section (below colored area)
  let y = pageHeight * 0.5;

  if (projeto) {
    // Project name
    if (projeto.nome) {
      doc.setFontSize(fonts.title.size);
      doc.setFont('helvetica', 'bold');
      setColor(doc, colors.dark);
      doc.text(projeto.nome, centerX, y, { align: 'center' });
      y += 15;
    }

    // Client
    if (projeto.cliente) {
      doc.setFontSize(fonts.subtitle.size);
      doc.setFont('helvetica', 'normal');
      setColor(doc, colors.medium);
      doc.text(`Cliente: ${projeto.cliente}`, centerX, y, { align: 'center' });
      y += 10;
    }

    // Location
    if (projeto.localizacao) {
      doc.text(`Localização: ${projeto.localizacao}`, centerX, y, { align: 'center' });
      y += 10;
    }
  }

  // Period
  if (periodo) {
    y += 10;
    doc.setFontSize(fonts.body.size);
    setColor(doc, colors.dark);
    doc.text(`Período: ${periodo}`, centerX, y, { align: 'center' });
  }

  // Footer info
  const footerY = pageHeight - 40;
  
  // Generation date
  doc.setFontSize(fonts.small.size);
  setColor(doc, colors.medium);
  doc.text(`Data de Geração: ${formatDatePDF(new Date())}`, centerX, footerY, { align: 'center' });

  // Generated by
  if (geradoPor) {
    doc.text(`Gerado por: ${geradoPor}`, centerX, footerY + 8, { align: 'center' });
  }

  // Decorative bottom line
  drawRect(doc, 0, pageHeight - 10, pageWidth, 10, colors.primary);
}
