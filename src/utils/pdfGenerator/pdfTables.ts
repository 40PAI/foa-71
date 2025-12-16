/**
 * Enhanced table styling for FOA PDF reports
 * Matches official FOA document format with blue headers
 */

import autoTable, { UserOptions } from 'jspdf-autotable';
import { colors, formatCurrencyPDF } from './pdfStyles';

export interface TableColumn {
  header: string;
  subHeader?: string; // For sub-columns like "entrada" / "saída"
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
  totalsLabel?: string;
  zebra?: boolean;
  title?: string;
  greenFooter?: boolean; // For DRE style green footer
}

/**
 * Draw a professional table with FOA styling
 */
export function drawProfessionalTable(doc: any, options: TableOptions): number {
  const { 
    startY, 
    columns, 
    data, 
    showTotals = false, 
    totalsRow, 
    totalsLabel = 'TOTAL',
    zebra = true, 
    title,
    greenFooter = false 
  } = options;
  let y = startY;

  // Draw title if provided
  if (title) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
    doc.text(title, 15, y);
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
    const totalsData = columns.map((col, index) => {
      if (index === 0) return totalsLabel;
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
      lineColor: [200, 200, 200],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [colors.tableHeader.r, colors.tableHeader.g, colors.tableHeader.b],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
    },
    bodyStyles: {
      textColor: [colors.dark.r, colors.dark.g, colors.dark.b],
    },
    alternateRowStyles: zebra ? {
      fillColor: [245, 245, 245],
    } : undefined,
    columnStyles: columns.reduce((acc, col, index) => {
      acc[index] = {
        halign: col.align || (col.isCurrency || col.isPercentage ? 'right' : 'left'),
        cellWidth: col.width || 'auto',
      };
      return acc;
    }, {} as any),
    didParseCell: (cellData: any) => {
      const { row, column, cell } = cellData;
      
      // Style totals row
      if (showTotals && row.index === tableData.length - 1 && row.section === 'body') {
        if (greenFooter) {
          cell.styles.fillColor = [39, 174, 96]; // Green
          cell.styles.textColor = [255, 255, 255];
        } else {
          cell.styles.fillColor = [230, 230, 230];
        }
        cell.styles.fontStyle = 'bold';
      }
      
      // Red text for negative values
      columns.forEach((col, colIndex) => {
        if (col.isNegativeRed && column.index === colIndex && row.section === 'body') {
          const originalData = data[row.index];
          if (originalData) {
            const originalValue = originalData[col.dataKey];
            if (typeof originalValue === 'number' && originalValue < 0) {
              cell.styles.textColor = [colors.danger.r, colors.danger.g, colors.danger.b];
            }
          }
        }
      });
    },
  };

  autoTable(doc, tableOptions);

  return (doc as any).lastAutoTable?.finalY || y + 50;
}

/**
 * Draw a simple summary table for KPIs
 */
export function drawSummaryTable(
  doc: any, 
  startY: number, 
  items: { label: string; value: string; color?: { r: number; g: number; b: number } }[]
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = startY;

  items.forEach((item, index) => {
    const isAlt = index % 2 === 1;
    
    // Background
    if (isAlt) {
      doc.setFillColor(245, 245, 245);
      doc.rect(15, y - 4, pageWidth - 30, 10, 'F');
    }
    
    // Label
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
    doc.text(item.label, 20, y + 2);
    
    // Value
    doc.setFont('helvetica', 'bold');
    if (item.color) {
      doc.setTextColor(item.color.r, item.color.g, item.color.b);
    }
    const valueWidth = doc.getTextWidth(item.value);
    doc.text(item.value, pageWidth - valueWidth - 20, y + 2);
    
    // Reset color
    doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
    
    y += 10;
  });

  return y + 5;
}

/**
 * Draw a DRE-style table with green totals footer
 */
export function drawDRETable(doc: any, options: TableOptions): number {
  return drawProfessionalTable(doc, { ...options, greenFooter: true, totalsLabel: 'DRE FOA - FOF' });
}

/**
 * Draw permissions/roles table (as in FOA document example)
 */
export function drawRolesTable(
  doc: any, 
  startY: number, 
  roles: { perfil: string; permissoes: string }[]
): number {
  const columns: TableColumn[] = [
    { header: 'Perfil / Cargo', dataKey: 'perfil', width: 40, align: 'left' },
    { header: 'Permissões Principais', dataKey: 'permissoes', align: 'left' },
  ];

  return drawProfessionalTable(doc, {
    startY,
    columns,
    data: roles,
    zebra: true,
  });
}
