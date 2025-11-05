import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { CashFlowMovement } from "@/types/cashflow";
import { useDeleteCashFlowMovement } from "@/hooks/useCashFlow";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FluxoCaixaTableProps {
  movements: CashFlowMovement[];
  onEdit: (movement: CashFlowMovement) => void;
  isLoading?: boolean;
}

export function FluxoCaixaTable({ movements, onEdit, isLoading }: FluxoCaixaTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [movementToDelete, setMovementToDelete] = useState<CashFlowMovement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const deleteMutation = useDeleteCashFlowMovement();

  // Calcular saldo acumulado
  const movementsWithBalance = useMemo(() => {
    let runningBalance = 0;
    return movements.map(movement => {
      if (movement.tipo_movimento === 'entrada') {
        runningBalance += Number(movement.valor);
      } else {
        runningBalance -= Number(movement.valor);
      }
      return {
        ...movement,
        saldo_acumulado: runningBalance
      };
    });
  }, [movements]);

  // Paginação
  const totalPages = Math.ceil(movementsWithBalance.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedMovements = movementsWithBalance.slice(startIndex, endIndex);

  const handleDelete = (movement: CashFlowMovement) => {
    setMovementToDelete(movement);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (movementToDelete?.id) {
      await deleteMutation.mutateAsync({
        id: movementToDelete.id,
        projeto_id: movementToDelete.projeto_id
      });
      setDeleteDialogOpen(false);
      setMovementToDelete(null);
    }
  };

  const handleViewReceipt = (url?: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum movimento encontrado no período selecionado
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Tabela com scroll controlado */}
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur-sm z-10">
                <TableRow>
                  <TableHead className="w-[100px]">Data</TableHead>
                  <TableHead className="w-[80px]">Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="w-[120px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMovements.map((movement) => {
                  const isEntrada = movement.tipo_movimento === 'entrada';
                  return (
                    <TableRow key={movement.id}>
                      <TableCell className="font-medium">
                        {formatDate(movement.data_movimento)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={isEntrada ? "default" : "destructive"}
                          className="flex items-center gap-1 w-fit"
                        >
                          {isEntrada ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )}
                          {isEntrada ? "Entrada" : "Saída"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {movement.descricao}
                      </TableCell>
                      <TableCell>{movement.categoria}</TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {movement.fornecedor_beneficiario || "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={isEntrada ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                          {isEntrada ? "+" : "-"} {formatCurrency(movement.valor)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        <span className={movement.saldo_acumulado >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}>
                          {formatCurrency(movement.saldo_acumulado)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {movement.comprovante_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewReceipt(movement.comprovante_url)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(movement)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(movement)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Exibindo {startIndex + 1}-{Math.min(endIndex, movements.length)} de {movements.length} registros
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Linhas por página:</span>
              <Select
                value={rowsPerPage.toString()}
                onValueChange={(value) => {
                  setRowsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Próximo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este movimento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
