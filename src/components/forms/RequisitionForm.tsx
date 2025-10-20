import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateRequisition, useUpdateRequisition } from "@/hooks/useRequisitions";
import { useMaterials } from "@/hooks/useMaterials";
import { useToast } from "@/hooks/use-toast";
import { Calculator, Percent, DollarSign, Clock } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { useSubcategorias } from "@/hooks/useSubcategorias";
import { useCategoriaSecundaria } from "@/hooks/useCategoriaSecundaria";

// Categories and options
const categoriasPrincipais = [
  "Material",
  "Mão de Obra", 
  "Património",
  "Custos Indiretos",
  "Segurança e Higiene no Trabalho"
] as const;

const unidadesMedida = [
  "saco",
  "m³",
  "m",
  "kg",
  "litro",
  "unidade",
  "outro"
] as const;

const urgenciaPrioridade = [
  "Alta",
  "Média",
  "Baixa"
] as const;

const requisitionSchema = z.object({
  // Informações do requisitante
  requisitante: z.string().min(1, "Nome do requisitante é obrigatório"),
  
  // Detalhes do produto - 3 níveis hierárquicos
  categoria_principal: z.enum(categoriasPrincipais, {
    required_error: "Selecione uma categoria principal",
  }),
  categoria_secundaria: z.string().min(1, "Selecione uma categoria secundária"),
  subcategoria: z.string().min(1, "Selecione uma subcategoria"),
  subcategoria_especifica: z.string().optional(),
  codigo_produto: z.string().optional(),
  nome_comercial_produto: z.string().min(1, "Nome do produto é obrigatório"),
  descricao_tecnica: z.string().optional(),
  
  // Quantidade e valores
  quantidade_requisitada: z.coerce.number().min(0.01, "Quantidade deve ser maior que zero"),
  unidade_medida: z.enum(unidadesMedida, {
    required_error: "Selecione uma unidade de medida",
  }),
  valor_unitario: z.coerce.number().min(0, "Valor unitário deve ser positivo"),
  valor: z.coerce.number().min(0, "Valor total deve ser positivo"),
  
  // Impostos e descontos
  percentual_imposto: z.coerce.number().min(0).max(100).optional(),
  valor_imposto: z.coerce.number().min(0).optional(),
  percentual_desconto: z.coerce.number().min(0).max(100).optional(),
  valor_desconto: z.coerce.number().min(0).optional(),
  
  // Fornecedor e prazo
  fornecedor_preferencial: z.string().optional(),
  prazo_limite_dias: z.coerce.number().min(1, "Prazo deve ser pelo menos 1 dia").max(15, "Prazo não pode exceder 15 dias"),
  urgencia_prioridade: z.enum(urgenciaPrioridade, {
    required_error: "Selecione a urgência",
  }),
  
  // Observações
  observacoes: z.string().optional(),
  
  // Aprovação
  aprovacao_cliente_engenheiro: z.boolean().default(false),
}).refine((data) => {
  // Se a subcategoria for "Outros", então subcategoria_especifica é obrigatória
  if (data.subcategoria === "Outros" && (!data.subcategoria_especifica || data.subcategoria_especifica.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Especifique a subcategoria quando selecionar 'Outros'",
  path: ["subcategoria_especifica"],
});

type RequisitionFormData = z.infer<typeof requisitionSchema>;

interface RequisitionFormProps {
  projectId: number;
  requisition?: Tables<"requisicoes"> & { material?: Tables<"materiais"> };
  onSuccess: () => void;
}

export function RequisitionForm({ projectId, requisition, onSuccess }: RequisitionFormProps) {
  const { toast } = useToast();
  const { data: materials = [] } = useMaterials();
  const createMutation = useCreateRequisition();
  const updateMutation = useUpdateRequisition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [valorTotal, setValorTotal] = useState<number>(0);

  const form = useForm<RequisitionFormData>({
    resolver: zodResolver(requisitionSchema),
    defaultValues: {
      requisitante: requisition?.requisitante || "",
      categoria_principal: requisition?.categoria_principal || undefined,
      categoria_secundaria: "",
      subcategoria: "",
      subcategoria_especifica: "",
      codigo_produto: requisition?.codigo_produto || "",
      nome_comercial_produto: requisition?.nome_comercial_produto || "",
      descricao_tecnica: requisition?.descricao_tecnica || "",
      quantidade_requisitada: requisition?.quantidade_requisitada || 1,
      unidade_medida: requisition?.unidade_medida || undefined,
      valor_unitario: requisition?.valor_unitario || 0,
      valor: requisition?.valor || 0,
      percentual_imposto: requisition?.percentual_imposto || 0,
      valor_imposto: requisition?.valor_imposto || 0,
      percentual_desconto: requisition?.percentual_desconto || 0,
      valor_desconto: requisition?.valor_desconto || 0,
      fornecedor_preferencial: requisition?.fornecedor_preferencial || "",
      prazo_limite_dias: requisition?.prazo_limite_dias || 15,
      urgencia_prioridade: requisition?.urgencia_prioridade || "Média",
      observacoes: requisition?.observacoes || "",
      aprovacao_cliente_engenheiro: false,
    },
  });

  // Watch form values for calculations and cascading selects
  const categoriaPrincipal = form.watch("categoria_principal");
  const categoriaSecundaria = form.watch("categoria_secundaria");
  const subcategoria = form.watch("subcategoria");
  const quantidade = form.watch("quantidade_requisitada");
  const valorUnitario = form.watch("valor_unitario");
  const percentualImposto = form.watch("percentual_imposto") || 0;
  const valorImposto = form.watch("valor_imposto") || 0;
  const percentualDesconto = form.watch("percentual_desconto") || 0;
  const valorDesconto = form.watch("valor_desconto") || 0;

  // Fetch cascading data
  const { data: categoriasSecundarias, isLoading: loadingCategorias } = useCategoriaSecundaria(categoriaPrincipal);
  const { data: subcategorias, isLoading: loadingSubcategorias } = useSubcategorias(categoriaPrincipal, categoriaSecundaria);

  // Reset dependent fields when parent category changes
  useEffect(() => {
    if (categoriaPrincipal) {
      form.setValue("categoria_secundaria", "");
      form.setValue("subcategoria", "");
    }
  }, [categoriaPrincipal, form]);

  useEffect(() => {
    if (categoriaSecundaria) {
      form.setValue("subcategoria", "");
    }
  }, [categoriaSecundaria, form]);

  const [valorTotalState, setValorTotalState] = useState<number>(0);

  // Calculate total value automatically
  useEffect(() => {
    if (quantidade && valorUnitario) {
      const valorBase = quantidade * valorUnitario;
      // Apply taxes
      const valorComImposto = valorBase + (valorBase * percentualImposto / 100) + valorImposto;
      // Apply discounts
      const valorFinal = valorComImposto - (valorComImposto * percentualDesconto / 100) - valorDesconto;
      setValorTotalState(Math.max(0, valorFinal));
    } else {
      setValorTotalState(0);
    }
  }, [quantidade, valorUnitario, percentualImposto, valorImposto, percentualDesconto, valorDesconto]);

  // Generate automatic code based on category
  const gerarCodigoAutomatico = (categoria: string) => {
    const prefixos: { [key: string]: string } = {
      "Material": "MAT",
      "Mão de Obra": "MO",
      "Património": "PAT",
      "Custos Indiretos": "CI",
      "Segurança e Higiene no Trabalho": "SHT"
    };
    
    const prefixo = prefixos[categoria] || "GEN";
    const numero = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    return `${prefixo}-${numero}`;
  };

  const onSubmit = async (data: RequisitionFormData) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        requisitante: data.requisitante,
        categoria_principal: data.categoria_principal,
        subcategoria: data.subcategoria,
        codigo_produto: data.codigo_produto || null,
        nome_comercial_produto: data.nome_comercial_produto,
        descricao_tecnica: data.descricao_tecnica || null,
        quantidade_requisitada: data.quantidade_requisitada,
        unidade_medida: data.unidade_medida,
        valor_unitario: data.valor_unitario,
        valor: valorTotalState,
        percentual_imposto: data.percentual_imposto || 0,
        valor_imposto: data.valor_imposto || 0,
        percentual_desconto: data.percentual_desconto || 0,
        valor_desconto: data.valor_desconto || 0,
        fornecedor_preferencial: data.fornecedor_preferencial || null,
        prazo_limite_dias: data.prazo_limite_dias,
        urgencia_prioridade: data.urgencia_prioridade,
        observacoes: data.observacoes || null,
        id_projeto: projectId,
      };

      if (requisition) {
        await updateMutation.mutateAsync({
          id: requisition.id,
          ...submitData,
        });
        toast({
          title: "Sucesso",
          description: "Requisição atualizada com sucesso",
        });
      } else {
        await createMutation.mutateAsync(submitData);
        toast({
          title: "Sucesso",
          description: "Requisição criada com sucesso",
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar requisição:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar requisição",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Seção 1: Informações do Requisitante */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Informações do Requisitante</h3>
          
          <FormField
            control={form.control}
            name="requisitante"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Requisitante *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo do requisitante" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Seção 2: Detalhes do Produto - Seleção Hierárquica */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Categorização do Produto</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="categoria_principal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>1. Categoria Principal *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria principal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriasPrincipais.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoria_secundaria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>2. Categoria Secundária *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!categoriaPrincipal || loadingCategorias}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !categoriaPrincipal 
                            ? "Primeiro selecione a categoria principal" 
                            : loadingCategorias 
                            ? "Carregando..." 
                            : "Selecione a categoria secundária"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriasSecundarias?.map((categoria) => (
                        <SelectItem key={categoria.categoria_secundaria} value={categoria.categoria_secundaria}>
                          {categoria.categoria_secundaria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subcategoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>3. Subcategoria *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!categoriaSecundaria || loadingSubcategorias}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !categoriaSecundaria 
                            ? "Primeiro selecione a categoria secundária" 
                            : loadingSubcategorias 
                            ? "Carregando..." 
                            : "Selecione a subcategoria"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subcategorias?.map((subcategoria) => (
                        <SelectItem key={subcategoria.id} value={subcategoria.nome_subcategoria}>
                          {subcategoria.nome_subcategoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Campo de especificação quando "Outros" é selecionado */}
          {subcategoria === "Outros" && (
            <FormField
              control={form.control}
              name="subcategoria_especifica"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especifique a Subcategoria *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Descreva a subcategoria específica"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <Separator />

        {/* Seção 3: Informações do Produto */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Informações do Produto</h3>
          
          <FormField
            control={form.control}
            name="nome_comercial_produto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Comercial do Produto *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: Cimento Portland Cimangola 42.5R" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="codigo_produto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código do Produto</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        placeholder="Ex: MAT-001" 
                        {...field} 
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const categoria = form.getValues("categoria_principal");
                        if (categoria) {
                          form.setValue("codigo_produto", gerarCodigoAutomatico(categoria));
                        }
                      }}
                    >
                      Gerar
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao_tecnica"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição Técnica</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Especificações técnicas do produto"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Seção 4: Quantidade e Valores */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quantidade e Valores</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="quantidade_requisitada"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unidade_medida"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Unidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {unidadesMedida.map((unidade) => (
                        <SelectItem key={unidade} value={unidade}>
                          {unidade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valor_unitario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Unitário (Kz)</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      placeholder="0,00"
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Valor Total Estimado</label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono font-semibold">
                {valorTotalState.toLocaleString('pt-AO', { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2 
                }).replace(/\./g, '_').replace(/,/g, '.').replace(/_/g, ',')} Kz
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Seção 5: Prazo e Prioridade */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Prazo e Prioridade</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="prazo_limite_dias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prazo (dias) *</FormLabel>
                  <FormControl>
                     <Input
                       type="number"
                       min="1"
                       max="15"
                       placeholder="15"
                       {...field}
                       onChange={(e) => field.onChange(parseInt(e.target.value) || 15)}
                     />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="urgencia_prioridade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urgência *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Urgência" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {urgenciaPrioridade.map((urgencia) => (
                        <SelectItem key={urgencia} value={urgencia}>
                          {urgencia}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fornecedor_preferencial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fornecedor Preferencial</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nome do fornecedor" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="observacoes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Observações complementares sobre a requisição"
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Seção 6: Aprovação de Fatura */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Aprovação de Fatura</h3>
          
          <FormField
            control={form.control}
            name="aprovacao_cliente_engenheiro"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Aprovação do Cliente/Engenheiro
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : requisition ? "Atualizar Requisição" : "Criar Requisição"}
          </Button>
        </div>
      </form>
    </Form>
  );
}