/**
 * Alert boxes and status indicators for FOA PDF reports
 */

import { colors, fonts, setColor, drawRoundedRect, formatCurrencyPDF } from './pdfStyles';

export type AlertType = 'success' | 'warning' | 'danger' | 'info';

export interface AlertOptions {
  type: AlertType;
  title: string;
  message: string;
  icon?: string;
}

const alertColors = {
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  info: colors.primary,
};

const alertIcons = {
  success: '✓',
  warning: '⚠',
  danger: '✕',
  info: 'ℹ',
};

export function drawAlert(doc: any, x: number, y: number, width: number, options: AlertOptions): number {
  const { type, title, message, icon } = options;
  const color = alertColors[type];
  const displayIcon = icon || alertIcons[type];
  const height = 25;

  // Background
  const bgColor = {
    r: Math.min(255, color.r + 180),
    g: Math.min(255, color.g + 180),
    b: Math.min(255, color.b + 180),
  };
  drawRoundedRect(doc, x, y, width, height, 3, bgColor);
  
  // Left color bar
  doc.setFillColor(color.r, color.g, color.b);
  doc.rect(x, y, 4, height, 'F');

  // Icon
  doc.setFontSize(14);
  setColor(doc, color);
  doc.text(displayIcon, x + 10, y + height / 2 + 2);

  // Title
  doc.setFontSize(fonts.body.size);
  doc.setFont('helvetica', 'bold');
  setColor(doc, color);
  doc.text(title, x + 25, y + 10);

  // Message
  doc.setFontSize(fonts.small.size);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.dark);
  doc.text(message, x + 25, y + 18);

  return y + height + 5;
}

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
  doc.setFillColor(colors.light.r, colors.light.g, colors.light.b);
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
    setColor(doc, colors.white);
    const percentText = `${cappedPercentage.toFixed(0)}%`;
    const textWidth = doc.getTextWidth(percentText);
    const textX = x + progressWidth / 2 - textWidth / 2;
    if (progressWidth > 25) {
      doc.text(percentText, textX, y + height - 2);
    } else {
      setColor(doc, colors.dark);
      doc.text(percentText, x + width + 3, y + height - 2);
    }
  }

  return y + height + 8;
}

export function generateFinancialAlerts(resumo: any): AlertOptions[] {
  const alerts: AlertOptions[] = [];

  // High debt alert
  if (resumo?.divida_foa_com_fof > 100000000) {
    alerts.push({
      type: 'danger',
      title: 'ALERTA: Dívida Elevada',
      message: `Dívida FOA ↔ FOF acima de 100M Kz: ${formatCurrencyPDF(resumo.divida_foa_com_fof)}`,
    });
  } else if (resumo?.divida_foa_com_fof > 50000000) {
    alerts.push({
      type: 'warning',
      title: 'Atenção: Dívida Significativa',
      message: `Dívida FOA ↔ FOF: ${formatCurrencyPDF(resumo.divida_foa_com_fof)}`,
    });
  }

  // No debt - positive
  if (resumo?.divida_foa_com_fof === 0 || resumo?.divida_foa_com_fof < 0) {
    alerts.push({
      type: 'success',
      title: 'Situação Financeira Saudável',
      message: 'Sem dívida pendente com FOF',
    });
  }

  // Budget exceeded
  if (resumo?.percentual_orcamento > 100) {
    alerts.push({
      type: 'danger',
      title: 'Orçamento Excedido',
      message: `Gastos ultrapassaram ${(resumo.percentual_orcamento - 100).toFixed(1)}% do orçamento`,
    });
  } else if (resumo?.percentual_orcamento > 80) {
    alerts.push({
      type: 'warning',
      title: 'Orçamento em Alerta',
      message: `${resumo.percentual_orcamento.toFixed(1)}% do orçamento já utilizado`,
    });
  }

  return alerts;
}
