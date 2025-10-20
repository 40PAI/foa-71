import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  minWidth?: string;
}

interface DataTableProps<T> {
  title?: string;
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  minWidth?: string;
  className?: string;
  renderRow?: (item: T, index: number) => React.ReactNode;
}

export function DataTable<T extends { id?: number | string }>({
  title,
  data,
  columns,
  isLoading,
  emptyMessage = "Nenhum dado disponível",
  emptyIcon,
  minWidth = "800px",
  className,
  renderRow
}: DataTableProps<T>) {
  const content = (
    <div className="overflow-x-auto">
      <div style={{ minWidth }} className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead 
                  key={index}
                  className={cn(
                    column.minWidth && `min-w-[${column.minWidth}]`,
                    column.className
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => {
              if (renderRow) {
                return renderRow(item, index);
              }
              
              return (
                <TableRow key={item.id || index}>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="p-2">
                      {typeof column.accessor === 'function' 
                        ? column.accessor(item)
                        : String(item[column.accessor] || '')
                      }
                    </td>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const emptyContent = (
    <div className="text-center p-8">
      {emptyIcon && <div className="mb-4">{emptyIcon}</div>}
      <h3 className="text-lg font-semibold mb-2">Sem Dados</h3>
      <p className="text-muted-foreground">{emptyMessage}</p>
    </div>
  );

  const loadingContent = (
    <div className="p-6">
      <LoadingSpinner />
    </div>
  );

  if (title) {
    return (
      <Card className={cn("min-w-0", className)}>
        <CardHeader>
          <CardTitle className="text-responsive-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? loadingContent : data.length === 0 ? emptyContent : content}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("min-w-0", className)}>
      {isLoading ? loadingContent : data.length === 0 ? emptyContent : content}
    </div>
  );
}