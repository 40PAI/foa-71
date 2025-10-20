import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateLancamento } from "@/hooks/useContasFornecedores";
import { toast } from "sonner";

interface LancamentoFornecedorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contaFornecedorId: string;
}

export function LancamentoFornecedorModal({
  open,
  onOpenChange,
  contaFornecedorId,
}: LancamentoFornecedorModalProps) {
  const [formData, setFormData] = useState({
    data_lancamento: new Date().toISOString().split("T")[0],
    descricao: "",
    tipo: "debito" as "credito" | "debito",
    valor: "",
    observacoes: "",
  });

  const createLancamento = useCreateLancamento();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.descricao || !formData.valor) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const valor = parseFloat(formData.valor);
    if (isNaN(valor) || valor <= 0) {
      toast.error("Valor inválido");
      return;
    }

    try {
      await createLancamento.mutateAsync({
        conta_fornecedor_id: contaFornecedorId,
        data_lancamento: formData.data_lancamento,
        descricao: formData.descricao,
        credito: formData.tipo === "credito" ? valor : 0,
        debito: formData.tipo === "debito" ? valor : 0,
        observacoes: formData.observacoes || undefined,
      });

      // Reset form
      setFormData({
        data_lancamento: new Date().toISOString().split("T")[0],
        descricao: "",
        tipo: "debito",
        valor: "",
        observacoes: "",
      });

      onOpenChange(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Novo Lançamento</DialogTitle>
            <DialogDescription>
              Registre um novo crédito ou débito na conta do fornecedor
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                type="date"
                value={formData.data_lancamento}
                onChange={(e) => setFormData({ ...formData, data_lancamento: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Ex: Pagamento nota fiscal 1234"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Lançamento *</Label>
              <RadioGroup
                value={formData.tipo}
                onValueChange={(v: "credito" | "debito") => setFormData({ ...formData, tipo: v })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credito" id="credito" />
                  <Label htmlFor="credito" className="font-normal cursor-pointer">
                    Crédito (recebido do fornecedor)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="debito" id="debito" />
                  <Label htmlFor="debito" className="font-normal cursor-pointer">
                    Débito (pago ao fornecedor)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor (Kz) *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Informações adicionais..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createLancamento.isPending}>
              {createLancamento.isPending ? "Salvando..." : "Salvar Lançamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
