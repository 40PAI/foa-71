import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PackageMinus, ArrowRight } from "lucide-react";
import { useMaterialsArmazem } from "@/hooks/useMaterialsArmazem";
import { useProjects } from "@/hooks/useProjects";
import { useProjectStages } from "@/hooks/useProjectStages";
import { useMaterialExit } from "@/hooks/useMaterialOperations";
import { format } from "date-fns";

interface MaterialExitModalProps {
  trigger?: React.ReactNode;
  preSelectedMaterialId?: string;
}

export function MaterialExitModal({ trigger, preSelectedMaterialId }: MaterialExitModalProps) {
  const [open, setOpen] = useState(false);
  const [materialId, setMaterialId] = useState(preSelectedMaterialId || "");
  const [projetoId, setProjetoId] = useState("");
  const [etapaId, setEtapaId] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [dataMovimentacao, setDataMovimentacao] = useState(format(new Date(), "yyyy-MM-dd"));
  const [observacoes, setObservacoes] = useState("");

  const { data: materials } = useMaterialsArmazem();
  const { data: projects } = useProjects();
  const { data: stages } = useProjectStages(projetoId ? parseInt(projetoId) : undefined);
  const exitMutation = useMaterialExit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!materialId || !projetoId || !quantidade || !responsavel) {
      return;
    }

    await exitMutation.mutateAsync({
      material_id: materialId,
      projeto_id: parseInt(projetoId),
      quantidade: parseFloat(quantidade),
      responsavel,
      data_movimentacao: dataMovimentacao,
      etapa_id: etapaId ? parseInt(etapaId) : undefined,
      observacoes: observacoes || undefined,
    });

    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    if (!preSelectedMaterialId) setMaterialId("");
    setProjetoId("");
    setEtapaId("");
    setQuantidade("");
    setResponsavel("");
    setDataMovimentacao(format(new Date(), "yyyy-MM-dd"));
    setObservacoes("");
  };

  const selectedMaterial = materials?.find((m) => m.id === materialId);
  const maxQuantidade = selectedMaterial?.quantidade_stock || 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <PackageMinus className="h-4 w-4" />
            Registar Saída
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-orange-500" />
            Alocar Material para Obra
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
                {materials?.filter((m) => m.quantidade_stock > 0).map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.codigo_interno} - {m.nome_material} ({m.quantidade_stock} {m.unidade_medida})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedMaterial && (
              <p className="text-xs text-muted-foreground">
                Stock disponível: <span className="font-semibold text-foreground">{selectedMaterial.quantidade_stock} {selectedMaterial.unidade_medida}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="projeto">Projecto Destino *</Label>
            <Select value={projetoId} onValueChange={(v) => { setProjetoId(v); setEtapaId(""); }}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar projecto" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {projetoId && stages && stages.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="etapa">Etapa (opcional)</Label>
              <Select value={etapaId} onValueChange={setEtapaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar etapa" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((e) => (
                    <SelectItem key={e.id} value={e.id.toString()}>
                      {e.nome_etapa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade *</Label>
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
                <p className="text-xs text-destructive">Excede o stock disponível</p>
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
            <Label htmlFor="responsavel">Responsável pela Retirada *</Label>
            <Input
              id="responsavel"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              placeholder="Nome do responsável"
              required
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
              disabled={exitMutation.isPending || parseFloat(quantidade) > maxQuantidade}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {exitMutation.isPending ? "A guardar..." : "Registar Saída"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
