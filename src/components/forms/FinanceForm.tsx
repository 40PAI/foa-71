import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, AlertCircle, TrendingUp, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useCreateFinance, useUpdateFinance } from "@/hooks/useFinances";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { useFinanceSubcategorias } from "@/hooks/useFinanceSubcategorias";
import { useProjectStages, useProjectTasks } from "@/hooks/useProjectStagesAndTasks";
import { FileUpload } from "@/components/ui/file-upload";
import { useState, useEffect } from "react";

const financeSchema = z.object({
  categoria: z.string().min(1, "Categoria obrigatória"),
  subcategoria: z.string().optional(),
  orcamentado: z.number().min(0, "Valor deve ser positivo"),
  gasto: z.number().min(0, "Valor deve ser positivo"),
  tipo_despesa: z.enum(["fixa", "variavel", "emergencial", "planejada"]).optional(),
  prioridade: z.enum(["baixa", "media", "alta", "critica"]).optional(),
  etapa_id: z.number().optional().nullable(),
  tarefa_id: z.number().optional().nullable(),
  centro_custo: z.string().optional(),
  justificativa: z.string().min(20, "Mínimo 20 caracteres").max(500, "Máximo 500 caracteres").optional(),
  fornecedor: z.string().optional(),
  forma_pagamento: z.enum(["dinheiro", "transferencia", "cheque", "cartao", "boleto", "pix", "oc"]).optional(),
  numero_nf: z.string().optional(),
  prazo_pagamento: z.date().optional().nullable(),
  data_despesa: z.date().optional(),
  data_pagamento: z.date().optional().nullable(),
  requer_aprovacao_direcao: z.boolean().default(false),
  observacoes: z.string().optional(),
  numero_parcelas: z.number().min(1).optional(),
});

type FinanceFormData = z.infer<typeof financeSchema>;

interface FinanceFormProps {
  projectId: number;
  finance?: Tables<"financas">;
  onSuccess?: () => void;
}

const CATEGORIAS = [
  "Materiais de Construção",
  "Mão de Obra",
  "Equipamentos",
  "Custos Indiretos",
  "Outros"
];

const CENTROS_CUSTO = [
  "Administrativo",
  "Operacional",
  "Logística",
  "Qualidade/Segurança"
];

export function FinanceForm({ projectId, finance, onSuccess }: FinanceFormProps) {
  const createFinance = useCreateFinance();
  const updateFinance = useUpdateFinance();
  const [comprovantes, setComprovantes] = useState<string[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState(finance?.categoria || "");
  const [selectedEtapa, setSelectedEtapa] = useState<number | undefined>(finance?.etapa_id || undefined);

  const subcategorias = useFinanceSubcategorias(selectedCategoria);
  const { data: etapas = [] } = useProjectStages(projectId);
  const { data: tarefas = [] } = useProjectTasks(projectId, selectedEtapa);

  const form = useForm<FinanceFormData>({
    resolver: zodResolver(financeSchema),
    defaultValues: {
      categoria: finance?.categoria || "",
      subcategoria: finance?.subcategoria || "",
      orcamentado: finance?.orcamentado || 0,
      gasto: finance?.gasto || 0,
      tipo_despesa: (finance?.tipo_despesa as any) || undefined,
      prioridade: (finance?.prioridade as any) || "media",
      etapa_id: finance?.etapa_id || null,
      tarefa_id: finance?.tarefa_id || null,
      centro_custo: finance?.centro_custo || "",
      justificativa: finance?.justificativa || "",
      fornecedor: finance?.fornecedor || "",
      forma_pagamento: (finance?.forma_pagamento as any) || undefined,
      numero_nf: finance?.numero_nf || "",
      prazo_pagamento: finance?.prazo_pagamento ? new Date(finance.prazo_pagamento) : null,
      data_despesa: finance?.data_despesa ? new Date(finance.data_despesa) : new Date(),
      data_pagamento: finance?.data_pagamento ? new Date(finance.data_pagamento) : null,
      requer_aprovacao_direcao: finance?.requer_aprovacao_direcao || false,
      observacoes: finance?.observacoes || "",
      numero_parcelas: finance?.numero_parcelas || 1,
    },
  });

  useEffect(() => {
    if (finance?.comprovantes) {
      setComprovantes(finance.comprovantes as string[]);
    }
  }, [finance]);

  const onSubmit = async (data: FinanceFormData) => {
    try {
      const financeData = {
        id_projeto: projectId,
        ...data,
        prazo_pagamento: data.prazo_pagamento?.toISOString().split('T')[0],
        data_despesa: data.data_despesa?.toISOString().split('T')[0],
        data_pagamento: data.data_pagamento?.toISOString().split('T')[0],
        comprovantes: comprovantes,
        valor_parcela: data.numero_parcelas && data.numero_parcelas > 1 
          ? data.gasto / data.numero_parcelas 
          : null,
      };

      if (finance?.id) {
        await updateFinance.mutateAsync({
          id: finance.id,
          ...financeData,
        });
        toast.success("Despesa atualizada com sucesso");
      } else {
        await createFinance.mutateAsync(financeData as any);
        toast.success("Despesa registrada com sucesso");
      }

      onSuccess?.();
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar a despesa");
    }
  };

  const orcamentado = form.watch("orcamentado");
  const gasto = form.watch("gasto");
  const impacto = orcamentado > 0 ? (gasto / orcamentado) * 100 : 0;
  const desvio = gasto - orcamentado;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basico" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basico">Básico</TabsTrigger>
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            <TabsTrigger value="pagamento">Pagamento</TabsTrigger>
            <TabsTrigger value="documentacao">Documentação</TabsTrigger>
          </TabsList>

          <TabsContent value="basico" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedCategoria(value);
                        form.setValue("subcategoria", "");
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIAS.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
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
                    <FormLabel>Subcategoria</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedCategoria}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a subcategoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subcategorias.map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo_despesa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Despesa</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fixa">Fixa (Recorrente)</SelectItem>
                        <SelectItem value="variavel">Variável (Esporádica)</SelectItem>
                        <SelectItem value="emergencial">Emergencial</SelectItem>
                        <SelectItem value="planejada">Planejada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prioridade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="critica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="orcamentado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Orçamentado *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
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
                name="gasto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Gasto *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
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
                name="data_despesa"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data da Despesa</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Selecione</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="justificativa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justificativa *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Compra de materiais para execução da fundação conforme cronograma..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/500 caracteres (mínimo 20)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="detalhes" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="etapa_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etapa Relacionada</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const id = value === "none" ? null : parseInt(value);
                        field.onChange(id);
                        setSelectedEtapa(id || undefined);
                        form.setValue("tarefa_id", null);
                      }}
                      value={field.value?.toString() || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a etapa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {etapas.map((etapa) => (
                          <SelectItem key={etapa.id} value={etapa.id.toString()}>
                            {etapa.numero_etapa}. {etapa.nome_etapa}
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
                name="tarefa_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarefa Relacionada</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}
                      value={field.value?.toString() || "none"}
                      disabled={!selectedEtapa}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a tarefa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {tarefas.map((tarefa) => (
                          <SelectItem key={tarefa.id} value={tarefa.id.toString()}>
                            {tarefa.descricao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="centro_custo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Centro de Custo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o centro de custo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CENTROS_CUSTO.map((cc) => (
                        <SelectItem key={cc} value={cc}>
                          {cc}
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
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações Adicionais</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações complementares..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="pagamento" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fornecedor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor/Prestador</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do fornecedor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="forma_pagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="cartao">Cartão</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="oc">Ordem de Compra</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="numero_nf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número da Nota Fiscal/Recibo</FormLabel>
                    <FormControl>
                      <Input placeholder="NF-00000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numero_parcelas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Parcelas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value && field.value > 1 && gasto > 0 && (
                        <span>Valor por parcela: {(gasto / field.value).toLocaleString('pt-AO')} Kz</span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="prazo_pagamento"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Prazo de Pagamento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Selecione</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_pagamento"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Pagamento Efetivo</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Selecione</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="documentacao" className="space-y-4 mt-4">
            <div>
              <FormLabel>Comprovantes</FormLabel>
              <div className="space-y-2 mt-2">
                {comprovantes.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <span className="flex-1 truncate text-sm">{url.split('/').pop()}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setComprovantes(comprovantes.filter((_, i) => i !== index))}
                    >
                      Remover
                    </Button>
                  </div>
                ))}
                <FileUpload
                  value=""
                  onValueChange={(url) => {
                    if (url) setComprovantes([...comprovantes, url]);
                  }}
                  label="Adicionar Comprovante"
                  accept="image/*,.pdf"
                  bucket="project-documents"
                  placeholder="Clique ou arraste para fazer upload"
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="requer_aprovacao_direcao"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Requer aprovação da direção
                    </FormLabel>
                    <FormDescription>
                      Marque se esta despesa precisa de aprovação especial
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {finance?.status_aprovacao && (
              <div className="p-4 border rounded-lg">
                <FormLabel>Status de Aprovação</FormLabel>
                <div className="mt-2">
                  <Badge
                    variant={
                      finance.status_aprovacao === "aprovado"
                        ? "default"
                        : finance.status_aprovacao === "rejeitado"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {finance.status_aprovacao === "aprovado" && "Aprovado"}
                    {finance.status_aprovacao === "rejeitado" && "Rejeitado"}
                    {finance.status_aprovacao === "pendente" && "Pendente"}
                    {finance.status_aprovacao === "em_analise" && "Em Análise"}
                  </Badge>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Indicadores Financeiros */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Impacto no Orçamento
            </div>
            <div className="text-2xl font-bold">
              {impacto.toFixed(1)}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Desvio Orçamentário
            </div>
            <div className={cn(
              "text-2xl font-bold",
              desvio > 0 ? "text-destructive" : "text-green-600"
            )}>
              {desvio > 0 ? "+" : ""}{desvio.toLocaleString('pt-AO')} Kz
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Status
            </div>
            <Badge variant={impacto > 80 ? "destructive" : impacto > 60 ? "secondary" : "default"}>
              {impacto > 80 ? "Crítico" : impacto > 60 ? "Atenção" : "Normal"}
            </Badge>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={createFinance.isPending || updateFinance.isPending}
          >
            {createFinance.isPending || updateFinance.isPending
              ? "Salvando..."
              : finance
              ? "Atualizar Despesa"
              : "Registrar Despesa"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
