import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, Plus, Search, DollarSign } from "lucide-react";
import { useContratosClientesByProject, useDeleteContratoCliente } from "@/hooks/useClientes";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns";

interface ContratosClientesTableProps {
  projectId?: number;
  onEdit: (contrato: any) => void;
  onAdd: () => void;
  onRegistrarRecebimento: (contrato: any) => void;
}

export function ContratosClientesTable({ 
  projectId, 
  onEdit, 
  onAdd,
  onRegistrarRecebimento 
}: ContratosClientesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: contratos = [], isLoading } = useContratosClientesByProject(projectId);
  const deleteMutation = useDeleteContratoCliente();

  const filteredContratos = contratos.filter((contrato: any) =>
    contrato.numero_contrato?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.descricao_servicos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: "default",
      concluido: "secondary",
      cancelado: "destructive",
      suspenso: "warning",
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  if (isLoading) {
    return <LoadingSkeleton variant="card" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, nº contrato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Contrato
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Nº Contrato</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Contratado</TableHead>
              <TableHead>Recebido</TableHead>
              <TableHead>Saldo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContratos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Nenhum contrato encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredContratos.map((contrato: any) => (
                <TableRow key={contrato.id}>
                  <TableCell className="font-medium">{contrato.cliente?.nome || "-"}</TableCell>
                  <TableCell>{contrato.numero_contrato || "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{contrato.descricao_servicos}</TableCell>
                  <TableCell>{formatCurrency(contrato.valor_contratado)}</TableCell>
                  <TableCell>{formatCurrency(contrato.valor_recebido)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(contrato.saldo_receber || 0)}</TableCell>
                  <TableCell>{getStatusBadge(contrato.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRegistrarRecebimento(contrato)}
                        title="Registrar Recebimento"
                      >
                        <DollarSign className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(contrato)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir este contrato?")) {
                            deleteMutation.mutate(contrato.id);
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
