import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RotateCcw } from "lucide-react";
import { useMaterialAllocations, MaterialAllocationWithDetails } from "@/hooks/useMaterialAllocations";
import { useMaterialReturn } from "@/hooks/useMaterialOperations";
import { format } from "date-fns";

interface MaterialReturnModalProps {
  trigger?: React.ReactNode;
  allocation?: MaterialAllocationWithDetails;
  projectId?: number;
}

export function MaterialReturnModal({ trigger, allocation, projectId }: MaterialReturnModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedAllocationId, setSelectedAllocationId] = useState(allocation?.id || "");
  const [quantidade, setQuantidade] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [dataMovimentacao, setDataMovimentacao] = useState(format(new Date(), "yyyy-MM-dd"));
  const [motivoDevolucao, setMotivoDevolucao] = useState("");
  const [estadoMaterial, setEstadoMaterial] = useState("bom");
  const [observacoes, setObservacoes] = useState("");

  const { data: allocations } = useMaterialAllocations(projectId);
  const returnMutation = useMaterialReturn();

  const activeAllocations = allocations?.filter(
    (a) => a.quantidade_pendente > 0 && (a.status === "alocado" || a.status === "parcialmente_consumido")
  ) || [];

  const selectedAllocation = allocation || activeAllocations.find((a) => a.id === selectedAllocationId);
  const maxQuantidade = selectedAllocation?.quantidade_pendente || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allocationId = allocation?.id || selectedAllocationId;
    if (!allocationId || !quantidade || !responsavel) {
      return;
    }

    await returnMutation.mutateAsync({
      allocation_id: allocationId,
      quantidade: parseFloat(quantidade),
      responsavel,
      data_movimentacao: dataMovimentacao,
      motivo_devolucao: motivoDevolucao || undefined,
      estado_material: estadoMaterial,
      observacoes: observacoes || undefined,
    });

    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    if (!allocation) setSelectedAllocationId("");
    setQuantidade("");
    setResponsavel("");
    setDataMovimentacao(format(new Date(), "yyyy-MM-dd"));
    setMotivoDevolucao("");
    setEstadoMaterial("bom");
    setObservacoes("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Registar Devolução
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-blue-500" />
            Registar Devolução de Material
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!allocation && (
            <div className="space-y-2">
              <Label htmlFor="allocation">Material Alocado *</Label>
              <Select value={selectedAllocationId} onValueChange={setSelectedAllocationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar alocação" />
                </SelectTrigger>
                <SelectContent>
                  {activeAllocations.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.material_codigo} - {a.material_nome} | {a.projeto_nome} (Pend: {a.quantidade_pendente})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedAllocation && (
            <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
              <p className="text-sm font-medium">{selectedAllocation.material_nome}</p>
              <p className="text-xs text-muted-foreground">Projecto: {selectedAllocation.projeto_nome}</p>
              <div className="flex gap-4 text-xs mt-2">
                <span>Alocado: <strong>{selectedAllocation.quantidade_alocada}</strong></span>
                <span>Devolvido: <strong>{selectedAllocation.quantidade_devolvida}</strong></span>
                <span className="text-primary">Pendente: <strong>{selectedAllocation.quantidade_pendente}</strong></span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade a Devolver *</Label>
              <Input
                id="quantidade"
                type="number"
                step="0.01"
                min="0.01"
                max={maxQuantidade}
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="0"
                required
              />
              {parseFloat(quantidade) > maxQuantidade && (
                <p className="text-xs text-destructive">Excede a quantidade pendente</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={dataMovimentacao}
                onChange={(e) => setDataMovimentacao(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado do Material</Label>
            <Select value={estadoMaterial} onValueChange={setEstadoMaterial}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bom">Bom estado</SelectItem>
                <SelectItem value="danificado">Danificado</SelectItem>
                <SelectItem value="defeito">Com defeito</SelectItem>
                <SelectItem value="parcial">Parcialmente utilizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável pela Devolução *</Label>
            <Input
              id="responsavel"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              placeholder="Nome do responsável"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo da Devolução</Label>
            <Input
              id="motivo"
              value={motivoDevolucao}
              onChange={(e) => setMotivoDevolucao(e.target.value)}
              placeholder="Ex: Sobra de material, alteração de projecto..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Notas adicionais..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={returnMutation.isPending || parseFloat(quantidade) > maxQuantidade || !selectedAllocation}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {returnMutation.isPending ? "A guardar..." : "Registar Devolução"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
