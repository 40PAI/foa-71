import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReembolso, useUpdateReembolso, type ReembolsoFOA } from "@/hooks/useReembolsosFOA";

interface ReembolsoFOAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reembolso?: ReembolsoFOA;
  projectId: number;
}

export function ReembolsoFOAModal({ open, onOpenChange, reembolso, projectId }: ReembolsoFOAModalProps) {
  const [formData, setFormData] = useState({
    projeto_id: reembolso?.projeto_id || projectId,
    data_reembolso: reembolso?.data_reembolso || new Date().toISOString().split('T')[0],
    descricao: reembolso?.descricao || "",
    valor: reembolso?.valor || 0,
    tipo: reembolso?.tipo || "amortizacao" as 'amortizacao' | 'aporte',
    meta_total: reembolso?.meta_total || undefined,
    observacoes: reembolso?.observacoes || "",
  });

  const createMutation = useCreateReembolso();
  const updateMutation = useUpdateReembolso();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (reembolso) {
        await updateMutation.mutateAsync({ id: reembolso.id, ...formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar reembolso:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {reembolso ? "Editar Reembolso FOA ↔ FOF" : "Novo Reembolso FOA ↔ FOF"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo*</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: 'amortizacao' | 'aporte') => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amortizacao">Amortização (FOA → FOF)</SelectItem>
                  <SelectItem value="aporte">Aporte (FOF → FOA)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="data_reembolso">Data*</Label>
              <Input
                id="data_reembolso"
                type="date"
                value={formData.data_reembolso}
                onChange={(e) => setFormData({ ...formData, data_reembolso: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="descricao">Descrição*</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva o reembolso/aporte"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valor">Valor (AOA)*</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                placeholder="0.00"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="meta_total">Meta Total (opcional)</Label>
              <Input
                id="meta_total"
                type="number"
                step="0.01"
                value={formData.meta_total || ""}
                onChange={(e) => setFormData({ ...formData, meta_total: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="Meta de amortização"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Informações adicionais"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {reembolso ? "Atualizar" : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
