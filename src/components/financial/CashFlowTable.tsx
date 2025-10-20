import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, FileText, Search, Plus, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useCashFlowMovements, useDeleteCashFlowMovement } from "@/hooks/useCashFlow";
import { CashFlowMovementModal } from "@/components/modals/CashFlowMovementModal";
import { CashFlowMovement } from "@/types/cashflow";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CashFlowTableProps {
  projectId: number;
}

export function CashFlowTable({ projectId }: CashFlowTableProps) {
  const { data: movements = [], isLoading } = useCashFlowMovements(projectId);
  const deleteMutation = useDeleteCashFlowMovement();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<CashFlowMovement | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const handleEdit = (movement: CashFlowMovement) => {
    setEditingMovement(movement);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este movimento?")) {
      deleteMutation.mutate({ id, projeto_id: projectId });
    }
  };

  const handleNewMovement = () => {
    setEditingMovement(undefined);
    setModalOpen(true);
  };

  // Filter and search movements
  const filteredMovements = movements.filter((movement) => {
    const matchesSearch = movement.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || movement.tipo_movimento === filterType;
    return matchesSearch && matchesType;
  });

  // Calculate accumulated balance
  let accumulatedBalance = 0;
  const movementsWithBalance = filteredMovements.map((movement) => {
    if (movement.tipo_movimento === 'entrada') {
      accumulatedBalance += Number(movement.valor);
    } else {
      accumulatedBalance -= Number(movement.valor);
    }
    return { ...movement, saldo_acumulado: accumulatedBalance };
  });

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Movimentações de Caixa
            </CardTitle>
            <Button onClick={handleNewMovement} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Movimento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por descrição ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="entrada">Entradas</SelectItem>
                <SelectItem value="saida">Saídas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : movementsWithBalance.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum Movimento Registrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterType !== "all" 
                  ? "Nenhum movimento encontrado com os filtros aplicados."
                  : "Comece registrando entradas e saídas de caixa."}
              </p>
              <Button onClick={handleNewMovement} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Primeiro Movimento
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Entrada</TableHead>
                    <TableHead className="text-right">Saída</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movementsWithBalance.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(movement.data_movimento), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={movement.tipo_movimento === 'entrada' ? 'default' : 'destructive'}
                          className="gap-1"
                        >
                          {movement.tipo_movimento === 'entrada' ? (
                            <ArrowUpCircle className="h-3 w-3" />
                          ) : (
                            <ArrowDownCircle className="h-3 w-3" />
                          )}
                          {movement.tipo_movimento === 'entrada' ? 'Entrada' : 'Saída'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={movement.descricao}>
                        {movement.descricao}
                      </TableCell>
                      <TableCell>{movement.categoria}</TableCell>
                      <TableCell className="text-right text-green-600 dark:text-green-400 font-medium">
                        {movement.tipo_movimento === 'entrada' ? formatCurrency(movement.valor) : '-'}
                      </TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400 font-medium">
                        {movement.tipo_movimento === 'saida' ? formatCurrency(movement.valor) : '-'}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${
                        movement.saldo_acumulado >= 0 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(movement.saldo_acumulado)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {movement.comprovante_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(movement.comprovante_url, '_blank')}
                              title="Ver comprovante"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(movement)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(movement.id!)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CashFlowMovementModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        projectId={projectId}
        movement={editingMovement}
      />
    </>
  );
}
