/**
 * Corporate styles for FOA PDF reports
 * Based on official FOA document formatting
 */

export const colors = {
  // FOA Corporate colors (from official documents)
  primary: { r: 0, g: 112, b: 192 },        // FOA Blue (header bars)
  primaryDark: { r: 0, g: 76, b: 153 },     // Dark Blue
  accent: { r: 139, g: 90, b: 43 },         // FOA Brown (logo accent)
  
  // Status colors
  success: { r: 39, g: 174, b: 96 },        // Green
  warning: { r: 243, g: 156, b: 18 },       // Orange/Amber
  danger: { r: 231, g: 76, b: 60 },         // Red
  
  // Neutral colors
  dark: { r: 44, g: 62, b: 80 },            // Dark gray
  medium: { r: 127, g: 140, b: 141 },       // Medium gray
  light: { r: 236, g: 240, b: 241 },        // Light gray
  white: { r: 255, g: 255, b: 255 },        // White
  black: { r: 0, g: 0, b: 0 },              // Black
  
  // Table colors
  tableHeader: { r: 0, g: 112, b: 192 },    // Blue header
  tableRowAlt: { r: 217, g: 217, b: 217 },  // Gray alternating rows
  tableBorder: { r: 189, g: 195, b: 199 },
  tableTotal: { r: 236, g: 240, b: 241 },
  
  // Watermark color (subtle beige/tan for FOA logo)
  watermark: { r: 220, g: 210, b: 195 },
};

export const fonts = {
  title: { size: 14, style: 'bold' as const },
  subtitle: { size: 11, style: 'bold' as const },
  sectionTitle: { size: 11, style: 'bold' as const },
  body: { size: 10, style: 'normal' as const },
  small: { size: 9, style: 'normal' as const },
  tiny: { size: 8, style: 'normal' as const },
  header: { size: 8, style: 'normal' as const },
};

export const margins = {
  page: { top: 45, right: 15, bottom: 30, left: 15 },
  section: 8,
  paragraph: 4,
};

export const pageSize = {
  width: 210,  // A4 width in mm
  height: 297, // A4 height in mm
};

// FOA Company Information (from official document)
export const foaCompanyInfo = {
  name: 'FOA – INOVAÇÃO E NEGÓCIOS, (SU) S.A',
  address: 'Morada: Golfe 2, defronte ao Tribunal',
  nif: 'Nº Id. Fiscal: 5001942697',
  phone: 'Telefones: (+244) 941 654 173',
  email: 'E-mail: geral@foa-ao.com',
  location: 'Luanda - Angola',
  // Footer format
  footerAddress: 'Morada: Golfe 2 defronte ao Tribunal – Luanda - Angola',
  footerEmail: 'E-mail: geral@foa-ao.com',
  footerPhone: 'Tel: 941 654 173',
};

// Helper to set color
export function setColor(doc: any, color: { r: number; g: number; b: number }) {
  doc.setTextColor(color.r, color.g, color.b);
}

export function setFillColor(doc: any, color: { r: number; g: number; b: number }) {
  doc.setFillColor(color.r, color.g, color.b);
}

export function setDrawColor(doc: any, color: { r: number; g: number; b: number }) {
  doc.setDrawColor(color.r, color.g, color.b);
}

// Draw a colored rectangle
export function drawRect(
  doc: any, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  color: { r: number; g: number; b: number },
  fill: boolean = true
) {
  setFillColor(doc, color);
  if (fill) {
    doc.rect(x, y, width, height, 'F');
  } else {
    setDrawColor(doc, color);
    doc.rect(x, y, width, height, 'S');
  }
}

// Draw a rounded rectangle
export function drawRoundedRect(
  doc: any,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: { r: number; g: number; b: number },
  fill: boolean = true
) {
  setFillColor(doc, color);
  if (fill) {
    doc.roundedRect(x, y, width, height, radius, radius, 'F');
  } else {
    setDrawColor(doc, color);
    doc.roundedRect(x, y, width, height, radius, radius, 'S');
  }
}

// Draw a line
export function drawLine(
  doc: any,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: { r: number; g: number; b: number },
  lineWidth: number = 0.5
) {
  setDrawColor(doc, color);
  doc.setLineWidth(lineWidth);
  doc.line(x1, y1, x2, y2);
}

// Format currency for Angola (Kwanzas)
export function formatCurrencyPDF(value: number): string {
  const formatted = new Intl.NumberFormat('pt-AO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${formatted} Kz`;
}

// Format date
export function formatDatePDF(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Format percentage
export function formatPercentagePDF(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Draw watermark pattern (centered FOA logo)
export function drawWatermark(doc: any, logoBase64?: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;
  
  // Draw subtle watermark in center of page
  if (logoBase64) {
    try {
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.08 }));
      doc.addImage(logoBase64, 'PNG', centerX - 40, centerY - 40, 80, 80);
      doc.restoreGraphicsState();
    } catch (e) {
      // Fallback: draw text watermark
      doc.setFontSize(60);
      doc.setTextColor(230, 220, 210);
      doc.text('FOA', centerX, centerY, { align: 'center', angle: 45 });
    }
  }
}
