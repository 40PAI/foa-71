/**
 * Enhanced table styling for FOA PDF reports
 */

import autoTable, { UserOptions } from 'jspdf-autotable';
import { colors, formatCurrencyPDF } from './pdfStyles';

export interface TableColumn {
  header: string;
  dataKey: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  isCurrency?: boolean;
  isPercentage?: boolean;
  isNegativeRed?: boolean;
}

export interface TableOptions {
  startY: number;
  columns: TableColumn[];
  data: any[];
  showTotals?: boolean;
  totalsRow?: any;
  zebra?: boolean;
  title?: string;
}

export function drawProfessionalTable(doc: any, options: TableOptions): number {
  const { startY, columns, data, showTotals = false, totalsRow, zebra = true, title } = options;
  let y = startY;

  // Draw title if provided
  if (title) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
    doc.text(title, 10, y);
    y += 8;
  }

  // Prepare table data
  const tableData = data.map(row => {
    return columns.map(col => {
      let value = row[col.dataKey];
      if (col.isCurrency && typeof value === 'number') {
        return formatCurrencyPDF(value);
      }
      if (col.isPercentage && typeof value === 'number') {
        return `${value.toFixed(1)}%`;
      }
      return value ?? '-';
    });
  });

  // Add totals row if needed
  if (showTotals && totalsRow) {
    const totalsData = columns.map(col => {
      let value = totalsRow[col.dataKey];
      if (col.isCurrency && typeof value === 'number') {
        return formatCurrencyPDF(value);
      }
      if (col.isPercentage && typeof value === 'number') {
        return `${value.toFixed(1)}%`;
      }
      return value ?? '';
    });
    tableData.push(totalsData);
  }

  const tableOptions: UserOptions = {
    startY: y,
    head: [columns.map(col => col.header)],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineColor: [colors.tableBorder.r, colors.tableBorder.g, colors.tableBorder.b],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [colors.tableHeader.r, colors.tableHeader.g, colors.tableHeader.b],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      textColor: [colors.dark.r, colors.dark.g, colors.dark.b],
    },
    alternateRowStyles: zebra ? {
      fillColor: [colors.tableRowAlt.r, colors.tableRowAlt.g, colors.tableRowAlt.b],
    } : undefined,
    columnStyles: columns.reduce((acc, col, index) => {
      acc[index] = {
        halign: col.align || (col.isCurrency || col.isPercentage ? 'right' : 'left'),
        cellWidth: col.width || 'auto',
      };
      return acc;
    }, {} as any),
    didParseCell: (data: any) => {
      // Highlight totals row
      if (showTotals && data.row.index === tableData.length - 1) {
        data.cell.styles.fillColor = [colors.tableTotal.r, colors.tableTotal.g, colors.tableTotal.b];
        data.cell.styles.fontStyle = 'bold';
      }
      
      // Red text for negative values in currency columns
      columns.forEach((col, colIndex) => {
        if (col.isNegativeRed && data.column.index === colIndex) {
          const originalValue = data.row.index < data.table.body.length - (showTotals ? 1 : 0)
            ? data.table.body[data.row.index]?.[col.dataKey]
            : totalsRow?.[col.dataKey];
          
          if (typeof originalValue === 'number' && originalValue < 0) {
            data.cell.styles.textColor = [colors.danger.r, colors.danger.g, colors.danger.b];
          }
        }
      });
    },
  };

  autoTable(doc, tableOptions);

  return (doc as any).lastAutoTable?.finalY || y + 50;
}

// Simple summary table for KPIs
export function drawSummaryTable(doc: any, startY: number, items: { label: string; value: string; color?: { r: number; g: number; b: number } }[]): number {
  let y = startY;

  items.forEach((item, index) => {
    const isAlt = index % 2 === 1;
    
    // Background
    if (isAlt) {
      doc.setFillColor(colors.tableRowAlt.r, colors.tableRowAlt.g, colors.tableRowAlt.b);
      doc.rect(10, y - 4, doc.internal.pageSize.getWidth() - 20, 10, 'F');
    }
    
    // Label
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
    doc.text(item.label, 15, y + 2);
    
    // Value
    doc.setFont('helvetica', 'bold');
    if (item.color) {
      doc.setTextColor(item.color.r, item.color.g, item.color.b);
    }
    const valueWidth = doc.getTextWidth(item.value);
    doc.text(item.value, doc.internal.pageSize.getWidth() - valueWidth - 15, y + 2);
    
    // Reset color
    doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
    
    y += 10;
  });

  return y + 5;
}
