import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Search } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/formatters";
import { TablePagination } from "@/components/common/TablePagination";
import { MovimentoPorFonte } from "@/hooks/useMovimentosPorFonte";

interface MovimentosPorFonteTableProps {
  movimentos: MovimentoPorFonte[];
  onEdit?: (movimento: MovimentoPorFonte) => void;
}

export function MovimentosPorFonteTable({
  movimentos,
  onEdit,
}: MovimentosPorFonteTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Filtrar por busca
  const filteredMovimentos = useMemo(() => {
    if (!searchTerm) return movimentos;
    
    const term = searchTerm.toLowerCase();
    return movimentos.filter(
      (m) =>
        m.descricao?.toLowerCase().includes(term) ||
        m.categoria?.toLowerCase().includes(term) ||
        m.observacoes?.toLowerCase().includes(term) ||
        m.centro_custo_nome?.toLowerCase().includes(term)
    );
  }, [movimentos, searchTerm]);

  // Paginação
  const totalPages = Math.ceil(filteredMovimentos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredMovimentos.length);
  const paginatedMovimentos = filteredMovimentos.slice(startIndex, endIndex);

  const getFonteBadgeColor = (fonte?: string) => {
    switch (fonte) {
      case "REC_FOA":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "FOF_FIN":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "FOA_AUTO":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getFonteLabel = (fonte?: string) => {
    switch (fonte) {
      case "REC_FOA":
        return "REC FOA";
      case "FOF_FIN":
        return "FOF FIN";
      case "FOA_AUTO":
        return "FOA AUTO";
      default:
        return "—";
    }
  };

  if (movimentos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhum movimento financeiro registrado ainda.</p>
        <p className="text-sm mt-2">
          Clique em "Novo Movimento" ou importe um arquivo Excel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar movimentos..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredMovimentos.length} movimento(s)
        </div>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Data</TableHead>
                <TableHead className="min-w-[200px]">Descrição</TableHead>
                <TableHead className="text-right text-green-700 dark:text-green-400">
                  Rec. FOA
                </TableHead>
                <TableHead className="text-right text-blue-700 dark:text-blue-400">
                  FOF Financ.
                </TableHead>
                <TableHead className="text-right text-purple-700 dark:text-purple-400">
                  FOA Auto
                </TableHead>
                <TableHead className="text-right text-red-700 dark:text-red-400">
                  Saída
                </TableHead>
                <TableHead>Fonte Saída</TableHead>
                <TableHead className="text-right">Saldo Total</TableHead>
                <TableHead className="text-right text-xs">Sld FOA</TableHead>
                <TableHead className="text-right text-xs">Sld FOF</TableHead>
                <TableHead className="text-right text-xs">Sld AUTO</TableHead>
                <TableHead>Centro</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMovimentos.map((movimento) => (
                <TableRow key={movimento.id}>
                  <TableCell className="font-mono text-xs">
                    {formatDate(movimento.data_movimento)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{movimento.descricao}</div>
                      <div className="text-xs text-muted-foreground">
                        {movimento.categoria}
                        {movimento.subcategoria && ` • ${movimento.subcategoria}`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-green-700 dark:text-green-400">
                    {movimento.recebimento_foa > 0
                      ? formatCurrency(movimento.recebimento_foa)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-blue-700 dark:text-blue-400">
                    {movimento.fof_financiamento > 0
                      ? formatCurrency(movimento.fof_financiamento)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-purple-700 dark:text-purple-400">
                    {movimento.foa_auto > 0
                      ? formatCurrency(movimento.foa_auto)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-red-700 dark:text-red-400">
                    {movimento.saida > 0
                      ? formatCurrency(movimento.saida)
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {movimento.fonte_saida ? (
                      <Badge
                        variant="outline"
                        className={getFonteBadgeColor(movimento.fonte_saida)}
                      >
                        {getFonteLabel(movimento.fonte_saida)}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatCurrency(movimento.saldo_total)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-green-600 dark:text-green-400">
                    {formatCurrency(movimento.saldo_rec_foa)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-blue-600 dark:text-blue-400">
                    {formatCurrency(movimento.saldo_fof_fin)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-purple-600 dark:text-purple-400">
                    {formatCurrency(movimento.saldo_foa_auto)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {movimento.centro_custo_nome || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(movimento)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredMovimentos.length}
          itemsPerPage={itemsPerPage}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage);
            setCurrentPage(1);
          }}
          itemsPerPageOptions={[10, 20, 50, 100]}
        />
      )}
    </div>
  );
}
