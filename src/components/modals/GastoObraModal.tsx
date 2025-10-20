import React, { useState } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { FormActions } from "@/components/shared/FormActions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useCentrosCusto } from "@/hooks/useCentrosCusto";
import { useProfiles } from "@/hooks/useProfiles";
import { useCreateGastoObra, useUpdateGastoObra, GastoObra } from "@/hooks/useGastosObra";
import { useAuth } from "@/contexts/AuthContext";

interface GastoObraModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  gasto?: GastoObra;
}

export function GastoObraModal({ open, onOpenChange, projectId, gasto }: GastoObraModalProps) {
  const { user } = useAuth();
  const { data: centrosCusto } = useCentrosCusto(projectId);
  const { data: profiles } = useProfiles();
  const createMutation = useCreateGastoObra();
  const updateMutation = useUpdateGastoObra();

  const [formData, setFormData] = useState({
    data_movimento: gasto?.data_movimento || new Date().toISOString().split("T")[0],
    descricao: gasto?.descricao || "",
    tipo_movimento: (gasto?.saida ? "saida" : "entrada") as "entrada" | "saida",
    fonte_financiamento: (gasto?.recebimento_foa ? "REC_FOA" : 
                          gasto?.fof_financiamento ? "FOF_FIN" : 
                          gasto?.foa_auto ? "FOA_AUTO" : "REC_FOA") as "REC_FOA" | "FOF_FIN" | "FOA_AUTO",
    valor: gasto?.recebimento_foa || gasto?.fof_financiamento || gasto?.foa_auto || gasto?.saida || 0,
    observacoes: gasto?.observacoes || "",
    centro_custo_id: gasto?.centro_custo_id || "",
    responsavel_id: gasto?.responsavel_id || user?.id || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const gastoData: any = {
        projeto_id: projectId,
        data_movimento: formData.data_movimento,
        descricao: formData.descricao,
        tipo_movimento: formData.tipo_movimento,
        valor: formData.valor,
      };

      // Adicionar fonte_financiamento apenas se for entrada
      if (formData.tipo_movimento === "entrada" && formData.fonte_financiamento) {
        gastoData.fonte_financiamento = formData.fonte_financiamento;
      }

      // Adicionar campos opcionais apenas se tiverem valor
      if (formData.observacoes?.trim()) {
        gastoData.observacoes = formData.observacoes;
      }
      if (formData.centro_custo_id) {
        gastoData.centro_custo_id = formData.centro_custo_id;
      }
      if (formData.responsavel_id) {
        gastoData.responsavel_id = formData.responsavel_id;
      }

      if (gasto?.id) {
        await updateMutation.mutateAsync({ id: gasto.id, ...gastoData });
      } else {
        await createMutation.mutateAsync(gastoData);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar despesa:", error);
    }
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={gasto ? "Editar Gasto da Obra" : "Novo Gasto da Obra"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="data_movimento">Data *</Label>
            <Input
              id="data_movimento"
              type="date"
              value={formData.data_movimento}
              onChange={(e) => setFormData({ ...formData, data_movimento: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_movimento">Tipo de Movimento *</Label>
            <Select
              value={formData.tipo_movimento}
              onValueChange={(value: "entrada" | "saida") => setFormData({ ...formData, tipo_movimento: value })}
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
        </div>

        {formData.tipo_movimento === "entrada" && (
          <div className="space-y-2">
            <Label htmlFor="fonte_financiamento">Fonte de Financiamento *</Label>
            <Select
              value={formData.fonte_financiamento}
              onValueChange={(value: "REC_FOA" | "FOF_FIN" | "FOA_AUTO") => 
                setFormData({ ...formData, fonte_financiamento: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REC_FOA">Recebimento FOA (Cliente)</SelectItem>
                <SelectItem value="FOF_FIN">FOF Financiamento</SelectItem>
                <SelectItem value="FOA_AUTO">FOA Auto-financiamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição *</Label>
          <Textarea
            id="descricao"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            placeholder="Ex: ALIMENTAÇÃO DO PESSOAL, ALUGUER BULLDOZER, etc."
            required
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor">Valor *</Label>
          <CurrencyInput
            id="valor"
            value={formData.valor}
            onValueChange={(value) => setFormData({ ...formData, valor: value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="centro_custo_id">Centro de Custo</Label>
            <Select
              value={formData.centro_custo_id}
              onValueChange={(value) => setFormData({ ...formData, centro_custo_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
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

          <div className="space-y-2">
            <Label htmlFor="responsavel_id">Responsável</Label>
            <Select
              value={formData.responsavel_id}
              onValueChange={(value) => setFormData({ ...formData, responsavel_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {profiles?.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            placeholder="Observações adicionais..."
            rows={2}
          />
        </div>

        <FormActions
          onCancel={() => onOpenChange(false)}
          submitLabel={gasto ? "Atualizar" : "Registrar Gasto"}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </form>
    </BaseModal>
  );
}
