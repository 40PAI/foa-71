import React, { useState, useEffect } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { FormActions } from "@/components/shared/FormActions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCentrosCusto } from "@/hooks/useCentrosCusto";
import { useProfiles } from "@/hooks/useProfiles";
import { useProjectStages } from "@/hooks/useProjectStages";
import { useTasks } from "@/hooks/useTasks";
import { useCreateGastoObra, useUpdateGastoObra, GastoObra, SubtipoEntrada } from "@/hooks/useGastosObra";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Receipt, Wallet, ClipboardList } from "lucide-react";

interface GastoObraModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  gasto?: GastoObra;
  defaultCentroCustoId?: string;
}

interface FormDataType {
  data_movimento: string;
  descricao: string;
  tipo_movimento: "entrada" | "saida";
  fonte_financiamento: "REC_FOA" | "FOF_FIN" | "FOA_AUTO";
  subtipo_entrada: SubtipoEntrada;
  valor: number;
  observacoes: string;
  categoria: string;
  subcategoria: string;
  centro_custo_id: string;
  responsavel_id: string;
  responsavel_nome: string;
  etapa_id: string;
  tarefa_id: string;
  fornecedor: string;
  forma_pagamento: string;
  numero_documento: string;
}

const CATEGORIAS = [
  { value: "Material", label: "Material" },
  { value: "Mão de Obra", label: "Mão de Obra" },
  { value: "Patrimônio", label: "Patrimônio" },
  { value: "Custos Indiretos", label: "Custos Indiretos" },
  { value: "Segurança e Higiene no Trabalho", label: "Segurança e Higiene no Trabalho" },
  { value: "Transporte", label: "Transporte" },
  { value: "Serviços Subcontratados", label: "Serviços Subcontratados" },
  { value: "Licenças e Taxas", label: "Licenças e Taxas" },
  { value: "Administrativo", label: "Administrativo" },
  { value: "Imprevistos", label: "Imprevistos" },
];

const FORMAS_PAGAMENTO = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "transferencia", label: "Transferência Bancária" },
  { value: "cheque", label: "Cheque" },
  { value: "cartao", label: "Cartão" },
  { value: "boleto", label: "Boleto" },
  { value: "pix", label: "PIX" },
];

export function GastoObraModal({ open, onOpenChange, projectId, gasto, defaultCentroCustoId }: GastoObraModalProps) {
  const { user } = useAuth();
  const { data: centrosCusto } = useCentrosCusto(projectId);
  const { data: profiles } = useProfiles();
  const { data: etapas } = useProjectStages(projectId);
  const { data: tarefas } = useTasks(projectId);
  const createMutation = useCreateGastoObra();
  const updateMutation = useUpdateGastoObra();

  const selectedCentroCusto = centrosCusto?.find(cc => cc.id === defaultCentroCustoId);
  const tipoMovimento = gasto?.saida ? "saida" : "entrada";

  const getInitialFormData = (): FormDataType => ({
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
    subcategoria: "",
    centro_custo_id: gasto?.centro_custo_id || defaultCentroCustoId || "",
    responsavel_id: gasto?.responsavel_id || user?.id || "",
    responsavel_nome: gasto?.responsavel_nome || "",
    etapa_id: "",
    tarefa_id: "",
    fornecedor: "",
    forma_pagamento: "",
    numero_documento: "",
  });

  const [formData, setFormData] = useState<FormDataType>(getInitialFormData);
  const [activeTab, setActiveTab] = useState("basico");

  // Filtrar tarefas pela etapa selecionada
  const tarefasFiltradas = formData.etapa_id 
    ? tarefas?.filter(t => t.id_etapa === Number(formData.etapa_id))
    : tarefas;

  useEffect(() => {
    if (open) {
      setFormData(getInitialFormData());
      setActiveTab("basico");
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
        categoria: formData.categoria || "Gastos da Obra",
      };

      if (formData.fonte_financiamento) {
        gastoData.fonte_financiamento = formData.fonte_financiamento;
      }

      if (formData.tipo_movimento === "entrada" && formData.subtipo_entrada) {
        gastoData.subtipo_entrada = formData.subtipo_entrada;
      }

      if (formData.observacoes?.trim()) {
        gastoData.observacoes = formData.observacoes;
      }
      if (formData.subcategoria?.trim()) {
        gastoData.subcategoria = formData.subcategoria;
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
      if (formData.etapa_id) {
        gastoData.etapa_id = Number(formData.etapa_id);
      }
      if (formData.tarefa_id) {
        gastoData.tarefa_id = Number(formData.tarefa_id);
      }
      if (formData.forma_pagamento) {
        gastoData.forma_pagamento = formData.forma_pagamento;
      }
      if (formData.numero_documento?.trim()) {
        gastoData.numero_documento = formData.numero_documento;
      }
      // Guardar fornecedor no metadata
      if (formData.fornecedor?.trim()) {
        gastoData.metadata = { fornecedor: formData.fornecedor };
      }

      if (gasto?.id) {
        await updateMutation.mutateAsync({ id: gasto.id, ...gastoData });
      } else {
        await createMutation.mutateAsync(gastoData);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar movimento:", error);
    }
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={
        gasto 
          ? "Editar Movimento Financeiro" 
          : selectedCentroCusto 
            ? `Novo Movimento - ${selectedCentroCusto.codigo}`
            : "Novo Movimento Financeiro"
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basico" className="gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Básico</span>
            </TabsTrigger>
            <TabsTrigger value="detalhes" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Detalhes</span>
            </TabsTrigger>
            <TabsTrigger value="pagamento" className="gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Pagamento</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Básico */}
          <TabsContent value="basico" className="space-y-4 mt-4">
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
                    <SelectItem value="valor_inicial">Valor Inicial</SelectItem>
                    <SelectItem value="recebimento_cliente">Recebimento de Cliente</SelectItem>
                    <SelectItem value="financiamento_adicional">Financiamento Adicional</SelectItem>
                    <SelectItem value="reembolso">Reembolso</SelectItem>
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
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor (Kz) *</Label>
              <CurrencyInput
                id="valor"
                value={formData.valor}
                onValueChange={(value) => setFormData({ ...formData, valor: value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategoria">Subcategoria</Label>
                <Input
                  id="subcategoria"
                  value={formData.subcategoria}
                  onChange={(e) => setFormData({ ...formData, subcategoria: e.target.value })}
                  placeholder="Ex: Cimento, Ferro..."
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab Detalhes */}
          <TabsContent value="detalhes" className="space-y-4 mt-4">
            {!defaultCentroCustoId && (
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
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="etapa_id">Etapa</Label>
                <Select
                  value={formData.etapa_id}
                  onValueChange={(value) => setFormData({ ...formData, etapa_id: value, tarefa_id: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a etapa..." />
                  </SelectTrigger>
                  <SelectContent>
                    {etapas?.map((etapa) => (
                      <SelectItem key={etapa.id} value={String(etapa.id)}>
                        {etapa.numero_etapa}. {etapa.nome_etapa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tarefa_id">Tarefa</Label>
                <Select
                  value={formData.tarefa_id}
                  onValueChange={(value) => setFormData({ ...formData, tarefa_id: value })}
                  disabled={!formData.etapa_id && !tarefas?.length}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a tarefa..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tarefasFiltradas?.map((tarefa) => (
                      <SelectItem key={tarefa.id} value={String(tarefa.id)}>
                        {tarefa.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor / Beneficiário</Label>
              <Input
                id="fornecedor"
                value={formData.fornecedor}
                onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                placeholder="Nome do fornecedor ou beneficiário"
              />
            </div>

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
          </TabsContent>

          {/* Tab Pagamento */}
          <TabsContent value="pagamento" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
                <Select
                  value={formData.forma_pagamento}
                  onValueChange={(value) => setFormData({ ...formData, forma_pagamento: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMAS_PAGAMENTO.map((fp) => (
                      <SelectItem key={fp.value} value={fp.value}>
                        {fp.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero_documento">Nº Documento / NF</Label>
                <Input
                  id="numero_documento"
                  value={formData.numero_documento}
                  onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
                  placeholder="Ex: NF-001, REC-123"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Informações adicionais sobre o movimento..."
                rows={3}
              />
            </div>

            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                Upload de Comprovante
              </div>
              <p className="text-xs text-muted-foreground">
                Funcionalidade de upload será adicionada em breve. 
                Por agora, pode adicionar o link do documento nas observações.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <FormActions
          onCancel={() => onOpenChange(false)}
          submitLabel={gasto ? "Atualizar" : "Registrar Movimento"}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </form>
    </BaseModal>
  );
}
