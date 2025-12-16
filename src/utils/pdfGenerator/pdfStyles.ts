/**
 * Corporate styles for FOA PDF reports
 */

export const colors = {
  // Primary corporate colors
  primary: { r: 41, g: 128, b: 185 },      // FOA Blue
  primaryDark: { r: 26, g: 82, b: 118 },   // Dark Blue
  
  // Status colors
  success: { r: 39, g: 174, b: 96 },       // Green
  warning: { r: 243, g: 156, b: 18 },      // Orange/Amber
  danger: { r: 231, g: 76, b: 60 },        // Red
  
  // Neutral colors
  dark: { r: 44, g: 62, b: 80 },           // Dark gray
  medium: { r: 127, g: 140, b: 141 },      // Medium gray
  light: { r: 236, g: 240, b: 241 },       // Light gray
  white: { r: 255, g: 255, b: 255 },       // White
  
  // Table colors
  tableHeader: { r: 41, g: 128, b: 185 },
  tableRowAlt: { r: 245, g: 248, b: 250 },
  tableBorder: { r: 189, g: 195, b: 199 },
  tableTotal: { r: 236, g: 240, b: 241 },
};

export const fonts = {
  title: { size: 24, style: 'bold' as const },
  subtitle: { size: 16, style: 'bold' as const },
  sectionTitle: { size: 14, style: 'bold' as const },
  body: { size: 11, style: 'normal' as const },
  small: { size: 9, style: 'normal' as const },
  tiny: { size: 8, style: 'normal' as const },
};

export const margins = {
  page: { top: 20, right: 15, bottom: 25, left: 15 },
  section: 10,
  paragraph: 5,
};

export const pageSize = {
  width: 210,  // A4 width in mm
  height: 297, // A4 height in mm
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
