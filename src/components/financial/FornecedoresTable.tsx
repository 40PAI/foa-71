import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, Plus, Search, Eye, Star } from "lucide-react";
import { useFornecedores, useDeleteFornecedor } from "@/hooks/useFornecedores";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import type { Fornecedor } from "@/types/contasCorrentes";

interface FornecedoresTableProps {
  projectId?: number;
  onEdit: (fornecedor: Fornecedor) => void;
  onView: (fornecedor: Fornecedor) => void;
  onAdd: () => void;
}

export function FornecedoresTable({ projectId, onEdit, onView, onAdd }: FornecedoresTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: fornecedores = [], isLoading } = useFornecedores(projectId);
  const deleteMutation = useDeleteFornecedor();

  const filteredFornecedores = fornecedores.filter((fornecedor) =>
    fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.nif?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.tipo_fornecedor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: "default",
      inativo: "secondary",
      bloqueado: "destructive",
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  const renderStars = (rating?: number) => {
    if (!rating) return "-";
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
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
            placeholder="Buscar por nome, NIF ou tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      <div className="scrollable-table-container" style={{ maxHeight: '600px' }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>NIF</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Recorrência</TableHead>
              <TableHead>Avaliação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFornecedores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Nenhum fornecedor encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredFornecedores.map((fornecedor) => (
                <TableRow key={fornecedor.id}>
                  <TableCell className="font-medium">{fornecedor.nome}</TableCell>
                  <TableCell>{fornecedor.nif || "-"}</TableCell>
                  <TableCell>{fornecedor.tipo_fornecedor || "-"}</TableCell>
                  <TableCell>{fornecedor.recorrencia || "-"}</TableCell>
                  <TableCell>{renderStars(fornecedor.avaliacao_qualidade)}</TableCell>
                  <TableCell>{getStatusBadge(fornecedor.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(fornecedor)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(fornecedor)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir este fornecedor?")) {
                            deleteMutation.mutate(fornecedor.id!);
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
