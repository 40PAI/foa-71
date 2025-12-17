import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, PackagePlus } from "lucide-react";
import { useMaterialsArmazem } from "@/hooks/useMaterialsArmazem";
import { useMaterialEntry } from "@/hooks/useMaterialOperations";
import { format } from "date-fns";

interface MaterialEntryModalProps {
  trigger?: React.ReactNode;
  preSelectedMaterialId?: string;
}

export function MaterialEntryModal({ trigger, preSelectedMaterialId }: MaterialEntryModalProps) {
  const [open, setOpen] = useState(false);
  const [materialId, setMaterialId] = useState(preSelectedMaterialId || "");
  const [quantidade, setQuantidade] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [dataMovimentacao, setDataMovimentacao] = useState(format(new Date(), "yyyy-MM-dd"));
  const [documentoReferencia, setDocumentoReferencia] = useState("");
  const [custoUnitario, setCustoUnitario] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const { data: materials } = useMaterialsArmazem();
  const entryMutation = useMaterialEntry();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!materialId || !quantidade || !responsavel) {
      return;
    }

    await entryMutation.mutateAsync({
      material_id: materialId,
      quantidade: parseFloat(quantidade),
      responsavel,
      data_movimentacao: dataMovimentacao,
      documento_referencia: documentoReferencia || undefined,
      custo_unitario: custoUnitario ? parseFloat(custoUnitario) : undefined,
      observacoes: observacoes || undefined,
    });

    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    if (!preSelectedMaterialId) setMaterialId("");
    setQuantidade("");
    setResponsavel("");
    setDataMovimentacao(format(new Date(), "yyyy-MM-dd"));
    setDocumentoReferencia("");
    setCustoUnitario("");
    setObservacoes("");
  };

  const selectedMaterial = materials?.find((m) => m.id === materialId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <PackagePlus className="h-4 w-4" />
            Registar Entrada
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-500" />
            Registar Entrada de Material
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="material">Material *</Label>
            <Select value={materialId} onValueChange={setMaterialId} disabled={!!preSelectedMaterialId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar material" />
              </SelectTrigger>
              <SelectContent>
                {materials?.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.codigo_interno} - {m.nome_material}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedMaterial && (
              <p className="text-xs text-muted-foreground">
                Stock actual: {selectedMaterial.quantidade_stock} {selectedMaterial.unidade_medida}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                step="0.01"
                min="0.01"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="0"
                required
              />
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
            <Label htmlFor="responsavel">Responsável *</Label>
            <Input
              id="responsavel"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              placeholder="Nome do responsável"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="documento">Documento Ref.</Label>
              <Input
                id="documento"
                value={documentoReferencia}
                onChange={(e) => setDocumentoReferencia(e.target.value)}
                placeholder="NF, Factura, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custo">Custo Unitário</Label>
              <Input
                id="custo"
                type="number"
                step="0.01"
                min="0"
                value={custoUnitario}
                onChange={(e) => setCustoUnitario(e.target.value)}
                placeholder="0.00"
              />
            </div>
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
            <Button type="submit" disabled={entryMutation.isPending} className="bg-green-600 hover:bg-green-700">
              {entryMutation.isPending ? "A guardar..." : "Registar Entrada"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
