/**
 * Cover page for FOA PDF reports
 * Professional cover with FOA branding
 */

import { colors, fonts, setColor, drawRect, formatDatePDF, foaCompanyInfo } from './pdfStyles';

// Import watermark image
import foaWatermarkUrl from '@/assets/foa-watermark.png';
import foaLogoUrl from '@/assets/foa-logo-official.png';

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
  logoBase64?: string;
  watermarkBase64?: string;
}

// Function to convert image to base64
export async function loadImageBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('Could not load image:', e);
    return '';
  }
}

// Load both images
export async function loadCoverImages(): Promise<{ logo: string; watermark: string }> {
  const [logo, watermark] = await Promise.all([
    loadImageBase64(foaLogoUrl),
    loadImageBase64(foaWatermarkUrl),
  ]);
  return { logo, watermark };
}

/**
 * Draw professional cover page with FOA branding
 */
export function drawCoverPage(doc: any, options: CoverOptions): void {
  const { titulo, subtitulo, projeto, periodo, geradoPor, logoBase64, watermarkBase64 } = options;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;

  // Draw subtle watermark in center (if available)
  if (watermarkBase64) {
    try {
      // Draw watermark with low opacity in center
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.06 }));
      doc.addImage(watermarkBase64, 'PNG', centerX - 50, pageHeight / 2 - 50, 100, 100);
      doc.restoreGraphicsState();
    } catch (e) {
      // Silently fail if watermark can't be drawn
    }
  }

  // Top blue bar
  drawRect(doc, 0, 0, pageWidth, 60, colors.primary);
  
  // Company info in header bar
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.white);
  doc.text(foaCompanyInfo.name, centerX, 15, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(foaCompanyInfo.address, centerX, 22, { align: 'center' });
  doc.text(`${foaCompanyInfo.nif} | ${foaCompanyInfo.phone}`, centerX, 28, { align: 'center' });
  doc.text(`${foaCompanyInfo.email} | ${foaCompanyInfo.location}`, centerX, 34, { align: 'center' });

  // Logo below header bar
  let logoY = 75;
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', centerX - 30, logoY, 60, 60);
      logoY = 145;
    } catch (e) {
      // Fallback text logo
      doc.setFontSize(36);
      doc.setFont('helvetica', 'bold');
      setColor(doc, colors.primary);
      doc.text('FOA', centerX, logoY + 30, { align: 'center' });
      logoY = 120;
    }
  } else {
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    setColor(doc, colors.primary);
    doc.text('FOA', centerX, logoY + 30, { align: 'center' });
    logoY = 120;
  }

  // Main document title
  let y = logoY + 20;
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.dark);
  
  // Split title if too long
  const titleLines = doc.splitTextToSize(titulo, pageWidth - 40);
  doc.text(titleLines, centerX, y, { align: 'center' });
  y += (titleLines.length * 8) + 10;

  // Subtitle
  if (subtitulo) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    setColor(doc, colors.medium);
    doc.text(subtitulo, centerX, y, { align: 'center' });
    y += 15;
  }

  // Decorative line
  doc.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
  doc.setLineWidth(1);
  doc.line(centerX - 40, y, centerX + 40, y);
  y += 20;

  // Project details section
  if (projeto) {
    // Project name
    if (projeto.nome) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      setColor(doc, colors.primary);
      doc.text(`Projeto: ${projeto.nome}`, centerX, y, { align: 'center' });
      y += 12;
    }

    // Client
    if (projeto.cliente) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      setColor(doc, colors.dark);
      doc.text(`Cliente: ${projeto.cliente}`, centerX, y, { align: 'center' });
      y += 8;
    }

    // Location
    if (projeto.localizacao) {
      doc.text(`Localização: ${projeto.localizacao}`, centerX, y, { align: 'center' });
      y += 8;
    }

    // Responsible
    if (projeto.responsavel) {
      doc.text(`Responsável: ${projeto.responsavel}`, centerX, y, { align: 'center' });
      y += 8;
    }
  }

  // Period
  if (periodo) {
    y += 5;
    doc.setFontSize(10);
    setColor(doc, colors.medium);
    doc.text(`Período: ${periodo}`, centerX, y, { align: 'center' });
    y += 8;
  }

  // Bottom section with generation info
  const bottomY = pageHeight - 50;
  
  // Generation date
  doc.setFontSize(10);
  setColor(doc, colors.medium);
  doc.text(`Data de Geração: ${formatDatePDF(new Date())}`, centerX, bottomY, { align: 'center' });

  // Generated by
  if (geradoPor) {
    doc.text(`Gerado por: ${geradoPor}`, centerX, bottomY + 8, { align: 'center' });
  }

  // Bottom blue bar
  drawRect(doc, 0, pageHeight - 15, pageWidth, 15, colors.primary);
  
  // Footer text in bottom bar
  doc.setFontSize(8);
  setColor(doc, colors.white);
  doc.text(foaCompanyInfo.footerAddress, centerX, pageHeight - 8, { align: 'center' });
}

/**
 * Draw a simple inner page header (for non-cover pages)
 */
export function drawInnerPageHeader(doc: any, titulo: string, logoBase64?: string): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;
  
  // Small logo on left
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 15, 8, 20, 20);
    } catch (e) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      setColor(doc, colors.primary);
      doc.text('FOA', 15, 20);
    }
  }
  
  // Title on right of logo
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.dark);
  doc.text(titulo, 40, 20);
  
  // Blue line separator
  y = 32;
  doc.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
  doc.setLineWidth(0.5);
  doc.line(15, y, pageWidth - 15, y);
  
  return y + 8;
}
