import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useCreateReembolso, useUpdateReembolso, type ReembolsoFOA } from "@/hooks/useReembolsosFOA";
import { useProjects } from "@/hooks/useProjects";
import { useFornecedores } from "@/hooks/useFornecedores";
import { FONTE_CREDITO_LABELS, TIPO_MOVIMENTO_LABELS, type FonteCredito, type TipoMovimentoDivida } from "@/types/dividas";
import { Separator } from "@/components/ui/separator";
import { Building2, Landmark, Users, HelpCircle, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReembolsoFOAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reembolso?: ReembolsoFOA;
  projectId?: number;
}

const fonteIcons = {
  FOF: Building2,
  BANCO: Landmark,
  FORNECEDOR: Users,
  OUTRO: HelpCircle,
};

export function ReembolsoFOAModal({ open, onOpenChange, reembolso, projectId }: ReembolsoFOAModalProps) {
  const { data: projects = [] } = useProjects();
  const { data: fornecedores = [] } = useFornecedores();
  
  const [formData, setFormData] = useState({
    projeto_id: reembolso?.projeto_id || projectId || 0,
    data_reembolso: reembolso?.data_reembolso || new Date().toISOString().split('T')[0],
    descricao: reembolso?.descricao || "",
    valor: reembolso?.valor || 0,
    tipo: (reembolso?.tipo || "credito") as TipoMovimentoDivida,
    fonte_credito: (reembolso?.fonte_credito || "FOF") as FonteCredito,
    credor_nome: reembolso?.credor_nome || "",
    fornecedor_id: reembolso?.fornecedor_id || "",
    taxa_juro: reembolso?.taxa_juro || undefined,
    data_vencimento: reembolso?.data_vencimento || "",
    numero_contrato: reembolso?.numero_contrato || "",
    status_divida: reembolso?.status_divida || "ativo" as const,
    meta_total: reembolso?.meta_total || undefined,
    observacoes: reembolso?.observacoes || "",
  });

  // Atualizar projeto_id quando projectId prop mudar
  useEffect(() => {
    if (projectId) {
      setFormData(prev => ({ ...prev, projeto_id: projectId }));
    }
  }, [projectId]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open && !reembolso) {
      setFormData({
        projeto_id: projectId || 0,
        data_reembolso: new Date().toISOString().split('T')[0],
        descricao: "",
        valor: 0,
        tipo: "credito",
        fonte_credito: "FOF",
        credor_nome: "",
        fornecedor_id: "",
        taxa_juro: undefined,
        data_vencimento: "",
        numero_contrato: "",
        status_divida: "ativo",
        meta_total: undefined,
        observacoes: "",
      });
    }
  }, [open, reembolso, projectId]);

  const createMutation = useCreateReembolso();
  const updateMutation = useUpdateReembolso();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projeto_id) {
      alert("Por favor, selecione um projeto");
      return;
    }

    // Validações específicas por fonte
    if (formData.fonte_credito === 'BANCO' && !formData.credor_nome) {
      alert("Por favor, informe o nome do banco");
      return;
    }

    if (formData.fonte_credito === 'FORNECEDOR' && !formData.fornecedor_id) {
      alert("Por favor, selecione um fornecedor");
      return;
    }

    if (formData.fonte_credito === 'OUTRO' && !formData.credor_nome) {
      alert("Por favor, informe o nome do credor");
      return;
    }
    
    try {
      const dataToSubmit = {
        ...formData,
        taxa_juro: formData.taxa_juro || null,
        data_vencimento: formData.data_vencimento || null,
        numero_contrato: formData.numero_contrato || null,
        meta_total: formData.meta_total || null,
        credor_nome: formData.fonte_credito === 'FOF' ? null : formData.credor_nome || null,
        fornecedor_id: formData.fonte_credito === 'FORNECEDOR' ? formData.fornecedor_id : null,
      };

      if (reembolso) {
        await updateMutation.mutateAsync({ id: reembolso.id, ...dataToSubmit });
      } else {
        await createMutation.mutateAsync(dataToSubmit as any);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar movimento:", error);
    }
  };

  const FonteIcon = fonteIcons[formData.fonte_credito];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FonteIcon className="h-5 w-5" />
            {reembolso ? "Editar Movimento de Crédito" : "Novo Movimento de Crédito"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fonte de Crédito */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Fonte de Crédito</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(FONTE_CREDITO_LABELS) as FonteCredito[]).map((fonte) => {
                const Icon = fonteIcons[fonte];
                const isSelected = formData.fonte_credito === fonte;
                return (
                  <button
                    key={fonte}
                    type="button"
                    onClick={() => setFormData({ ...formData, fonte_credito: fonte, credor_nome: "", fornecedor_id: "" })}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                      isSelected 
                        ? "border-primary bg-primary/10 text-primary" 
                        : "border-border hover:border-primary/50 hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium text-center">
                      {fonte === 'FOF' ? 'FOF' : fonte === 'BANCO' ? 'Banco' : fonte === 'FORNECEDOR' ? 'Fornecedor' : 'Outro'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Campos condicionais por fonte */}
          {formData.fonte_credito === 'BANCO' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="credor_nome">Nome do Banco*</Label>
                <Input
                  id="credor_nome"
                  value={formData.credor_nome}
                  onChange={(e) => setFormData({ ...formData, credor_nome: e.target.value })}
                  placeholder="Ex: BFA, BAI, BIC..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="numero_contrato">Nº Contrato/Referência</Label>
                <Input
                  id="numero_contrato"
                  value={formData.numero_contrato}
                  onChange={(e) => setFormData({ ...formData, numero_contrato: e.target.value })}
                  placeholder="Número do contrato"
                />
              </div>
            </div>
          )}

          {formData.fonte_credito === 'FORNECEDOR' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fornecedor_id">Fornecedor*</Label>
                <Select
                  value={formData.fornecedor_id}
                  onValueChange={(value) => setFormData({ ...formData, fornecedor_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {fornecedores.map((forn) => (
                      <SelectItem key={forn.id} value={forn.id}>
                        {forn.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="numero_contrato">Nº Factura/Referência</Label>
                <Input
                  id="numero_contrato"
                  value={formData.numero_contrato}
                  onChange={(e) => setFormData({ ...formData, numero_contrato: e.target.value })}
                  placeholder="Número da factura"
                />
              </div>
            </div>
          )}

          {formData.fonte_credito === 'OUTRO' && (
            <div>
              <Label htmlFor="credor_nome">Nome do Credor*</Label>
              <Input
                id="credor_nome"
                value={formData.credor_nome}
                onChange={(e) => setFormData({ ...formData, credor_nome: e.target.value })}
                placeholder="Nome da pessoa ou empresa"
                required
              />
            </div>
          )}

          <Separator />

          {/* Campo de seleção de projeto */}
          {!projectId && (
            <div>
              <Label htmlFor="projeto_id">Projeto*</Label>
              <Select
                value={formData.projeto_id.toString()}
                onValueChange={(value) => setFormData({ ...formData, projeto_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo de Movimento*</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: TipoMovimentoDivida) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credito">Crédito Recebido</SelectItem>
                  <SelectItem value="amortizacao">Amortização (Pagamento)</SelectItem>
                  <SelectItem value="juro">Pagamento de Juros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Data*</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.data_reembolso && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data_reembolso ? (
                      format(parseISO(formData.data_reembolso), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.data_reembolso ? parseISO(formData.data_reembolso) : undefined}
                    onSelect={(date) => setFormData({ ...formData, data_reembolso: date ? format(date, "yyyy-MM-dd") : "" })}
                    initialFocus
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div>
            <Label htmlFor="descricao">Descrição*</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva o movimento (ex: Empréstimo para capital de giro, Pagamento parcial, etc.)"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor (AOA)*</Label>
              <CurrencyInput
                value={formData.valor}
                onValueChange={(value) => setFormData({ ...formData, valor: value })}
                placeholder="0,00"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Data de Vencimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.data_vencimento && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data_vencimento ? (
                      format(parseISO(formData.data_vencimento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.data_vencimento ? parseISO(formData.data_vencimento) : undefined}
                    onSelect={(date) => setFormData({ ...formData, data_vencimento: date ? format(date, "yyyy-MM-dd") : "" })}
                    initialFocus
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {formData.fonte_credito === 'BANCO' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taxa_juro">Taxa de Juro Anual (%)</Label>
                <Input
                  id="taxa_juro"
                  type="number"
                  step="0.01"
                  value={formData.taxa_juro || ""}
                  onChange={(e) => setFormData({ ...formData, taxa_juro: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Ex: 15.5"
                />
              </div>
              <div>
                <Label htmlFor="meta_total">Meta de Amortização Total</Label>
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
          )}
          
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Informações adicionais, condições do crédito, etc."
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
