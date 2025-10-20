import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, Search, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { usePagamentosRecebimentos, useDeletePagamentoRecebimento } from "@/hooks/usePagamentosRecebimentos";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PagamentosRecebimentosTableProps {
  projectId?: number;
  onEdit: (transacao: any) => void;
}

export function PagamentosRecebimentosTable({ projectId, onEdit }: PagamentosRecebimentosTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState<'pagamento' | 'recebimento' | undefined>(undefined);
  const { data: transacoes = [], isLoading } = usePagamentosRecebimentos(projectId, tipoFilter);
  const deleteMutation = useDeletePagamentoRecebimento();

  const filteredTransacoes = transacoes.filter((transacao: any) =>
    transacao.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transacao.numero_documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transacao.contrato_cliente?.cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transacao.contrato_fornecedor?.fornecedor?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTipoBadge = (tipo: string) => {
    return tipo === 'recebimento' ? (
      <Badge variant="default" className="flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        Recebimento
      </Badge>
    ) : (
      <Badge variant="destructive" className="flex items-center gap-1">
        <TrendingDown className="h-3 w-3" />
        Pagamento
      </Badge>
    );
  };

  if (isLoading) {
    return <LoadingSkeleton variant="card" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar transações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={tipoFilter || "todos"}
          onValueChange={(value) => setTipoFilter(value === "todos" ? undefined : value as any)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="recebimento">Recebimentos</SelectItem>
            <SelectItem value="pagamento">Pagamentos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Cliente/Fornecedor</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Doc.</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Nenhuma transação encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredTransacoes.map((transacao: any) => (
                <TableRow key={transacao.id}>
                  <TableCell>{getTipoBadge(transacao.tipo)}</TableCell>
                  <TableCell>{format(new Date(transacao.data_transacao), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="font-medium">
                    {transacao.contrato_cliente?.cliente?.nome || 
                     transacao.contrato_fornecedor?.fornecedor?.nome || "-"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{transacao.descricao || "-"}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(transacao.valor)}</TableCell>
                  <TableCell>{transacao.metodo || "-"}</TableCell>
                  <TableCell>
                    {transacao.comprovante_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(transacao.comprovante_url, "_blank")}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(transacao)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir esta transação?")) {
                            deleteMutation.mutate(transacao.id);
                          }
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
