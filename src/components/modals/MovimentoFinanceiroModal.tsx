import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMovimentoFinanceiro, useUpdateMovimentoFinanceiro } from "@/hooks/useMovimentosFinanceiros";
import { useCentrosCusto } from "@/hooks/useCentrosCusto";
import type { MovimentoFinanceiro, TipoMovimento, FonteFinanciamento, FormaPagamento } from "@/types/centroCusto";

interface MovimentoFinanceiroModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimento?: MovimentoFinanceiro;
  projectId: number;
}

export function MovimentoFinanceiroModal({ open, onOpenChange, movimento, projectId }: MovimentoFinanceiroModalProps) {
  const [formData, setFormData] = useState<Partial<MovimentoFinanceiro>>({
    projeto_id: movimento?.projeto_id || projectId,
    centro_custo_id: movimento?.centro_custo_id || "",
    data_movimento: movimento?.data_movimento || new Date().toISOString().split('T')[0],
    tipo_movimento: movimento?.tipo_movimento || "entrada",
    fonte_financiamento: movimento?.fonte_financiamento,
    categoria: movimento?.categoria || "",
    subcategoria: movimento?.subcategoria || "",
    descricao: movimento?.descricao || "",
    valor: movimento?.valor || 0,
    forma_pagamento: movimento?.forma_pagamento,
    banco: movimento?.banco || "",
    conta: movimento?.conta || "",
    numero_documento: movimento?.numero_documento || "",
    observacoes: movimento?.observacoes || "",
    status_aprovacao: movimento?.status_aprovacao || "pendente",
  });

  const { data: centrosCusto } = useCentrosCusto(projectId);
  const createMutation = useCreateMovimentoFinanceiro();
  const updateMutation = useUpdateMovimentoFinanceiro();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (movimento) {
        await updateMutation.mutateAsync({ id: movimento.id, ...formData });
      } else {
        await createMutation.mutateAsync(formData as Omit<MovimentoFinanceiro, "id" | "created_at" | "updated_at">);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar movimento:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {movimento ? "Editar Movimento Financeiro" : "Novo Movimento Financeiro"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo_movimento">Tipo*</Label>
              <Select
                value={formData.tipo_movimento}
                onValueChange={(value: TipoMovimento) => setFormData({ 
                  ...formData, 
                  tipo_movimento: value,
                  fonte_financiamento: undefined // Limpar fonte ao mudar tipo
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada (Recebimento)</SelectItem>
                  <SelectItem value="saida">Saída (Gasto)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="data_movimento">Data*</Label>
              <Input
                id="data_movimento"
                type="date"
                value={formData.data_movimento}
                onChange={(e) => setFormData({ ...formData, data_movimento: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="centro_custo_id">Centro de Custo</Label>
              <Select
                value={formData.centro_custo_id}
                onValueChange={(value) => setFormData({ ...formData, centro_custo_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um centro de custo" />
                </SelectTrigger>
                <SelectContent>
                  {centrosCusto?.map((cc) => (
                    <SelectItem key={cc.id} value={cc.id}>
                      {cc.codigo} - {cc.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="fonte_financiamento">
                Fonte de Financiamento{formData.tipo_movimento === "saida" && " *"}
              </Label>
              <Select
                value={formData.fonte_financiamento || ''}
                onValueChange={(value: FonteFinanciamento) => setFormData({ ...formData, fonte_financiamento: value })}
                required={formData.tipo_movimento === "saida"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {formData.tipo_movimento === "entrada" ? (
                    <SelectItem value="REC_FOA">Recebimento FOA (Cliente)</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="FOF_FIN">FOF Financiamento</SelectItem>
                      <SelectItem value="FOA_AUTO">FOA Auto Financiamento</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoria">Categoria*</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Material">Material</SelectItem>
                  <SelectItem value="Mão de Obra">Mão de Obra</SelectItem>
                  <SelectItem value="Patrimônio">Patrimônio</SelectItem>
                  <SelectItem value="Custos Indiretos">Custos Indiretos</SelectItem>
                  <SelectItem value="Segurança e Higiene no Trabalho">Segurança e Higiene no Trabalho</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="subcategoria">Subcategoria</Label>
              <Input
                id="subcategoria"
                value={formData.subcategoria}
                onChange={(e) => setFormData({ ...formData, subcategoria: e.target.value })}
                placeholder="Ex: Cimento"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="descricao">Descrição*</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva o movimento financeiro"
              required
            />
          </div>
          
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
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
              <Select
                value={formData.forma_pagamento}
                onValueChange={(value: FormaPagamento) => setFormData({ ...formData, forma_pagamento: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="banco">Banco</Label>
              <Input
                id="banco"
                value={formData.banco}
                onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                placeholder="Ex: BAI, BFA"
              />
            </div>
            
            <div>
              <Label htmlFor="conta">Conta</Label>
              <Input
                id="conta"
                value={formData.conta}
                onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                placeholder="Número da conta"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="numero_documento">Número do Documento</Label>
            <Input
              id="numero_documento"
              value={formData.numero_documento}
              onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
              placeholder="NF, recibo, etc."
            />
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
              {movimento ? "Atualizar" : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
