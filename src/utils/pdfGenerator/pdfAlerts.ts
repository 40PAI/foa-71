/**
 * Alert boxes, status indicators, and progress bars for FOA PDF reports
 * Note: Avoids Unicode characters incompatible with jsPDF default fonts
 */

import { colors, fonts, setColor, drawRoundedRect, formatCurrencyPDF } from './pdfStyles';

export type AlertType = 'success' | 'warning' | 'danger' | 'info';

export interface AlertOptions {
  type: AlertType;
  title: string;
  message: string;
}

const alertColors = {
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  info: colors.primary,
};

/**
 * Draw an alert box with colored bar (no Unicode icons)
 */
export function drawAlert(doc: any, x: number, y: number, width: number, options: AlertOptions): number {
  const { type, title, message } = options;
  const color = alertColors[type];
  const height = 25;

  // Light background based on alert type
  const bgColor = {
    r: Math.min(255, color.r + 200),
    g: Math.min(255, color.g + 200),
    b: Math.min(255, color.b + 200),
  };
  drawRoundedRect(doc, x, y, width, height, 3, bgColor);
  
  // Left color bar (visual indicator instead of emoji)
  doc.setFillColor(color.r, color.g, color.b);
  doc.rect(x, y, 5, height, 'F');

  // Title
  doc.setFontSize(fonts.body.size);
  doc.setFont('helvetica', 'bold');
  setColor(doc, color);
  doc.text(title, x + 12, y + 10);

  // Message
  doc.setFontSize(fonts.small.size);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.dark);
  doc.text(message, x + 12, y + 18);

  return y + height + 5;
}

/**
 * Draw a colored status indicator (circle + label)
 */
export function drawStatusIndicator(
  doc: any,
  x: number,
  y: number,
  label: string,
  status: 'good' | 'warning' | 'critical'
): number {
  const statusColors = {
    good: colors.success,
    warning: colors.warning,
    critical: colors.danger,
  };
  const color = statusColors[status];

  // Circle indicator
  doc.setFillColor(color.r, color.g, color.b);
  doc.circle(x + 5, y + 3, 3, 'F');

  // Label
  doc.setFontSize(fonts.body.size);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.dark);
  doc.text(label, x + 15, y + 5);

  return y + 12;
}

/**
 * Draw a progress bar
 */
export function drawProgressBar(
  doc: any,
  x: number,
  y: number,
  width: number,
  percentage: number,
  label: string,
  showValue: boolean = true
): number {
  const height = 8;
  const cappedPercentage = Math.min(100, Math.max(0, percentage));
  
  // Determine color based on percentage
  let color = colors.success;
  if (cappedPercentage > 100) color = colors.danger;
  else if (cappedPercentage > 80) color = colors.warning;
  else if (cappedPercentage < 30) color = colors.primary;

  // Label
  doc.setFontSize(fonts.small.size);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.dark);
  doc.text(label, x, y - 2);

  // Background bar
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(x, y, width, height, 2, 2, 'F');

  // Progress bar
  const progressWidth = (width * cappedPercentage) / 100;
  if (progressWidth > 0) {
    doc.setFillColor(color.r, color.g, color.b);
    doc.roundedRect(x, y, progressWidth, height, 2, 2, 'F');
  }

  // Percentage text
  if (showValue) {
    doc.setFontSize(fonts.tiny.size);
    doc.setFont('helvetica', 'bold');
    const percentText = `${cappedPercentage.toFixed(0)}%`;
    if (progressWidth > 25) {
      setColor(doc, colors.white);
      const textWidth = doc.getTextWidth(percentText);
      doc.text(percentText, x + progressWidth / 2 - textWidth / 2, y + height - 2);
    } else {
      setColor(doc, colors.dark);
      doc.text(percentText, x + width + 3, y + height - 2);
    }
  }

  return y + height + 8;
}

/**
 * Generate financial alerts based on data (no Unicode characters)
 */
export function generateFinancialAlerts(resumo: any): AlertOptions[] {
  const alerts: AlertOptions[] = [];

  // High debt alert
  if (resumo?.divida_foa_com_fof > 100000000) {
    alerts.push({
      type: 'danger',
      title: 'ALERTA: Divida Elevada',
      message: `Divida FOA - FOF acima de 100M Kz: ${formatCurrencyPDF(resumo.divida_foa_com_fof)}`,
    });
  } else if (resumo?.divida_foa_com_fof > 50000000) {
    alerts.push({
      type: 'warning',
      title: 'Atencao: Divida Significativa',
      message: `Divida FOA - FOF: ${formatCurrencyPDF(resumo.divida_foa_com_fof)}`,
    });
  }

  // No debt - positive
  if (resumo?.divida_foa_com_fof === 0 || resumo?.divida_foa_com_fof < 0) {
    alerts.push({
      type: 'success',
      title: 'Situacao Financeira Saudavel',
      message: 'Sem divida pendente com FOF',
    });
  }

  // Budget exceeded
  if (resumo?.percentual_orcamento > 100) {
    alerts.push({
      type: 'danger',
      title: 'Orcamento Excedido',
      message: `Gastos ultrapassaram ${(resumo.percentual_orcamento - 100).toFixed(1)}% do orcamento`,
    });
  } else if (resumo?.percentual_orcamento > 80) {
    alerts.push({
      type: 'warning',
      title: 'Orcamento em Alerta',
      message: `${resumo.percentual_orcamento.toFixed(1)}% do orcamento ja utilizado`,
    });
  }

  return alerts;
}

