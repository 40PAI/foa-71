import React, { useState, useEffect } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { FormActions } from "@/components/shared/FormActions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useCentrosCusto } from "@/hooks/useCentrosCusto";
import { useProfiles } from "@/hooks/useProfiles";
import { useCreateGastoObra, useUpdateGastoObra, GastoObra, SubtipoEntrada } from "@/hooks/useGastosObra";
import { useAuth } from "@/contexts/AuthContext";

interface GastoObraModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  gasto?: GastoObra;
  defaultCentroCustoId?: string; // Centro de custo pré-selecionado
}

export function GastoObraModal({ open, onOpenChange, projectId, gasto, defaultCentroCustoId }: GastoObraModalProps) {
  const { user } = useAuth();
  const { data: centrosCusto } = useCentrosCusto(projectId);
  const { data: profiles } = useProfiles();
  const createMutation = useCreateGastoObra();
  const updateMutation = useUpdateGastoObra();

  // Encontrar nome do centro de custo selecionado
  const selectedCentroCusto = centrosCusto?.find(cc => cc.id === defaultCentroCustoId);

  const tipoMovimento = gasto?.saida ? "saida" : "entrada";
  const [formData, setFormData] = useState({
    data_movimento: gasto?.data_movimento || new Date().toISOString().split("T")[0],
    descricao: gasto?.descricao || "",
    tipo_movimento: tipoMovimento as "entrada" | "saida",
    fonte_financiamento: (gasto?.recebimento_foa ? "REC_FOA" : 
                          gasto?.fof_financiamento ? "FOF_FIN" : 
                          gasto?.foa_auto ? "FOA_AUTO" : 
                          tipoMovimento === "entrada" ? "REC_FOA" : "FOF_FIN") as "REC_FOA" | "FOF_FIN" | "FOA_AUTO",
    subtipo_entrada: (gasto?.subtipo_entrada || "recebimento_cliente") as SubtipoEntrada,
    valor: gasto?.recebimento_foa || gasto?.fof_financiamento || gasto?.foa_auto || gasto?.saida || 0,
    observacoes: gasto?.observacoes || "",
    categoria: gasto?.categoria || "",
    centro_custo_id: gasto?.centro_custo_id || defaultCentroCustoId || "",
    responsavel_id: gasto?.responsavel_id || user?.id || "",
    responsavel_nome: "",
  });

  // Resetar formulário quando o modal abre/fecha ou quando muda o centro de custo default
  useEffect(() => {
    if (open) {
      const tipoMovimento = gasto?.saida ? "saida" : "entrada";
      setFormData({
        data_movimento: gasto?.data_movimento || new Date().toISOString().split("T")[0],
        descricao: gasto?.descricao || "",
        tipo_movimento: tipoMovimento as "entrada" | "saida",
        fonte_financiamento: (gasto?.recebimento_foa ? "REC_FOA" : 
                              gasto?.fof_financiamento ? "FOF_FIN" : 
                              gasto?.foa_auto ? "FOA_AUTO" : 
                              tipoMovimento === "entrada" ? "REC_FOA" : "FOF_FIN") as "REC_FOA" | "FOF_FIN" | "FOA_AUTO",
        subtipo_entrada: (gasto?.subtipo_entrada || "recebimento_cliente") as SubtipoEntrada,
        valor: gasto?.recebimento_foa || gasto?.fof_financiamento || gasto?.foa_auto || gasto?.saida || 0,
        observacoes: gasto?.observacoes || "",
        categoria: gasto?.categoria || "",
        centro_custo_id: gasto?.centro_custo_id || defaultCentroCustoId || "",
        responsavel_id: gasto?.responsavel_id || user?.id || "",
        responsavel_nome: "",
      });
    }
  }, [open, gasto, defaultCentroCustoId, user?.id]);

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

      // Adicionar fonte_financiamento para ambos tipos de movimento
      if (formData.fonte_financiamento) {
        gastoData.fonte_financiamento = formData.fonte_financiamento;
      }

      // Adicionar subtipo_entrada apenas para movimentos de entrada
      if (formData.tipo_movimento === "entrada" && formData.subtipo_entrada) {
        gastoData.subtipo_entrada = formData.subtipo_entrada;
      }

      // Adicionar campos opcionais apenas se tiverem valor
      if (formData.observacoes?.trim()) {
        gastoData.observacoes = formData.observacoes;
      }
      if (formData.categoria) {
        gastoData.categoria = formData.categoria;
      }
      if (formData.centro_custo_id) {
        gastoData.centro_custo_id = formData.centro_custo_id;
      }
      if (formData.responsavel_id) {
        gastoData.responsavel_id = formData.responsavel_id;
      }
      if (formData.responsavel_nome?.trim()) {
        gastoData.responsavel_nome = formData.responsavel_nome;
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
      title={
        gasto 
          ? "Editar Movimento" 
          : selectedCentroCusto 
            ? `Novo Movimento - ${selectedCentroCusto.codigo} - ${selectedCentroCusto.nome}`
            : "Novo Movimento"
      }
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
              onValueChange={(value: "entrada" | "saida") => {
                const newFonte = value === "entrada" ? "REC_FOA" : "FOF_FIN";
                setFormData({ 
                  ...formData, 
                  tipo_movimento: value,
                  fonte_financiamento: newFonte as "REC_FOA" | "FOF_FIN" | "FOA_AUTO"
                });
              }}
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

        <div className="space-y-2">
          <Label htmlFor="fonte_financiamento">Fonte de Financiamento *</Label>
          <Select
            value={formData.fonte_financiamento}
            onValueChange={(value: "REC_FOA" | "FOF_FIN" | "FOA_AUTO") => 
              setFormData({ ...formData, fonte_financiamento: value })
            }
            required
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {formData.tipo_movimento === "entrada" && (
                <SelectItem value="REC_FOA">Recebimento FOA (Cliente)</SelectItem>
              )}
              <SelectItem value="FOF_FIN">FOF Financiamento</SelectItem>
              <SelectItem value="FOA_AUTO">FOA Auto-financiamento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Campo Subtipo de Entrada - apenas para movimentos de entrada */}
        {formData.tipo_movimento === "entrada" && (
          <div className="space-y-2">
            <Label htmlFor="subtipo_entrada">Tipo de Entrada *</Label>
            <Select
              value={formData.subtipo_entrada}
              onValueChange={(value: SubtipoEntrada) => 
                setFormData({ ...formData, subtipo_entrada: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de entrada..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="valor_inicial">
                  <div className="flex flex-col">
                    <span className="font-medium">Valor Inicial</span>
                    <span className="text-xs text-muted-foreground">Capital de arranque do projeto</span>
                  </div>
                </SelectItem>
                <SelectItem value="recebimento_cliente">
                  <div className="flex flex-col">
                    <span className="font-medium">Recebimento de Cliente</span>
                    <span className="text-xs text-muted-foreground">Pagamento durante execução</span>
                  </div>
                </SelectItem>
                <SelectItem value="financiamento_adicional">
                  <div className="flex flex-col">
                    <span className="font-medium">Financiamento Adicional</span>
                    <span className="text-xs text-muted-foreground">Injeção de capital extra</span>
                  </div>
                </SelectItem>
                <SelectItem value="reembolso">
                  <div className="flex flex-col">
                    <span className="font-medium">Reembolso</span>
                    <span className="text-xs text-muted-foreground">Devolução/estorno</span>
                  </div>
                </SelectItem>
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

        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria</Label>
          <Select
            value={formData.categoria}
            onValueChange={(value) => setFormData({ ...formData, categoria: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mao_de_obra">Mão de obra</SelectItem>
              <SelectItem value="materiais_construcao">Materiais de construção</SelectItem>
              <SelectItem value="equipamentos_ferramentas">Equipamentos e ferramentas</SelectItem>
              <SelectItem value="transporte_combustivel">Transporte e combustível</SelectItem>
              <SelectItem value="servicos_subcontratados">Serviços subcontratados</SelectItem>
              <SelectItem value="licencas_taxas">Licenças e taxas</SelectItem>
              <SelectItem value="imprevistos">Imprevistos</SelectItem>
              <SelectItem value="seguranca_epi">Segurança e EPI</SelectItem>
              <SelectItem value="manutencao_equipamentos">Manutenção de equipamentos</SelectItem>
              <SelectItem value="despesas_admin_ti">Despesas administrativas e comunicação/TI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className={defaultCentroCustoId ? "space-y-2" : "grid grid-cols-2 gap-4"}>
          {/* Mostrar campo Centro de Custo apenas se NÃO houver filtro ativo */}
          {!defaultCentroCustoId && (
            <div className="space-y-2">
              <Label htmlFor="centro_custo_id">Centro de Custo Polo</Label>
              <Select
                value={formData.centro_custo_id}
                onValueChange={(value) => setFormData({ ...formData, centro_custo_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {centrosCusto?.map((cc) => (
                    <SelectItem key={cc.id} value={cc.id}>
                      {cc.codigo} - {cc.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável</Label>
            <div className="space-y-2">
              <Select
                value={formData.responsavel_id}
                onValueChange={(value) => setFormData({ ...formData, responsavel_id: value, responsavel_nome: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione da lista..." />
                </SelectTrigger>
                <SelectContent>
                  {profiles?.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="responsavel_nome"
                placeholder="Ou digite o nome manualmente..."
                value={formData.responsavel_nome}
                onChange={(e) => setFormData({ ...formData, responsavel_nome: e.target.value, responsavel_id: "" })}
              />
            </div>
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
          submitLabel={gasto ? "Atualizar" : "Registrar Movimento"}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </form>
    </BaseModal>
  );
}
