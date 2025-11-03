import { useState, useMemo, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, FileText, Search } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { GastoObra, useDeleteGastoObra } from "@/hooks/useGastosObra";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/common/TablePagination";
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

interface GastosObraTableProps {
  gastos: GastoObra[];
  onEdit: (gasto: GastoObra) => void;
}

export function GastosObraTable({ gastos, onEdit }: GastosObraTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteMutation = useDeleteGastoObra();

  const filteredGastos = useMemo(() => {
    return gastos.filter((gasto) =>
      gasto.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gasto.observacoes?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [gastos, searchTerm]);

  // Calculate accumulated balance
  const gastosComSaldo = useMemo(() => {
    let accumulatedBalance = 0;
    return filteredGastos.map((gasto) => {
      const movimento = gasto.recebimento_foa + gasto.fof_financiamento + gasto.foa_auto - gasto.saida;
      accumulatedBalance += movimento;
      return {
        ...gasto,
        saldoAcumulado: accumulatedBalance,
      };
    });
  }, [filteredGastos]);

  // Pagination
  const pagination = usePagination({
    totalItems: gastosComSaldo.length,
    initialItemsPerPage: 100,
    persistKey: 'gastos-obra',
  });

  const paginatedGastos = useMemo(() => {
    return gastosComSaldo.slice(pagination.startIndex, pagination.endIndex);
  }, [gastosComSaldo, pagination.startIndex, pagination.endIndex]);

  // Reset to first page when search changes
  useEffect(() => {
    pagination.resetToFirstPage();
  }, [searchTerm]);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição ou observação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="scrollable-table-container" style={{ maxHeight: '600px' }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right text-green-600">Rec. FOA</TableHead>
              <TableHead className="text-right text-blue-600">FOF Financ.</TableHead>
              <TableHead className="text-right text-orange-600">FOA Auto</TableHead>
              <TableHead className="text-right text-red-600">Saída</TableHead>
              <TableHead className="text-right font-bold">Saldo Acum.</TableHead>
              <TableHead>Centro Custo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gastosComSaldo.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  {searchTerm ? "Nenhum gasto encontrado" : "Nenhum gasto registrado"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedGastos.map((gasto) => (
                <TableRow key={gasto.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {format(new Date(gasto.data_movimento), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{gasto.descricao}</div>
                      {gasto.observacoes && (
                        <div className="text-xs text-muted-foreground mt-1">{gasto.observacoes}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-green-600 font-semibold">
                    {gasto.recebimento_foa > 0 ? formatCurrency(gasto.recebimento_foa) : "-"}
                  </TableCell>
                  <TableCell className="text-right text-blue-600 font-semibold">
                    {gasto.fof_financiamento > 0 ? formatCurrency(gasto.fof_financiamento) : "-"}
                  </TableCell>
                  <TableCell className="text-right text-orange-600 font-semibold">
                    {gasto.foa_auto > 0 ? formatCurrency(gasto.foa_auto) : "-"}
                  </TableCell>
                  <TableCell className="text-right text-red-600 font-semibold">
                    {gasto.saida > 0 ? formatCurrency(gasto.saida) : "-"}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    <span className={gasto.saldoAcumulado >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(gasto.saldoAcumulado)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {gasto.centro_custo_nome ? (
                      <Badge variant="outline" className="text-xs">
                        {gasto.centro_custo_nome}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {gasto.comprovante_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(gasto.comprovante_url, "_blank")}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => onEdit(gasto)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(gasto.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={gastosComSaldo.length}
        itemsPerPage={pagination.itemsPerPage}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
        onPageChange={pagination.goToPage}
        onItemsPerPageChange={pagination.setItemsPerPage}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este gasto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
