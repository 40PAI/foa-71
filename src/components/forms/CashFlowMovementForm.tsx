import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { CashFlowMovement, CASHFLOW_CATEGORIES } from "@/types/cashflow";
import { useProjectStages, useProjectTasks } from "@/hooks/useProjectStagesAndTasks";
import { FormActions } from "@/components/shared/FormActions";
import { Separator } from "@/components/ui/separator";

// Categorias de tipo de gasto
const TIPO_GASTO_CATEGORIAS = [
  'Material',
  'Mão de Obra',
  'Patrimônio',
  'Custos Indiretos',
];

const cashFlowSchema = z.object({
  tipo_movimento: z.enum(['entrada', 'saida']),
  valor: z.coerce.number().positive("Valor deve ser maior que zero"),
  data_movimento: z.string().min(1, "Data é obrigatória"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  subcategoria: z.string().optional(),
  descricao: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  etapa_id: z.coerce.number().optional(),
  tarefa_id: z.coerce.number().optional(),
  fornecedor_beneficiario: z.string().optional(),
  forma_pagamento: z.enum(['dinheiro', 'transferencia', 'cheque', 'cartao', 'boleto', 'pix']).optional(),
  numero_documento: z.string().optional(),
  comprovante_url: z.string().optional(),
  observacoes: z.string().optional(),
});

type CashFlowFormData = z.infer<typeof cashFlowSchema>;

interface CashFlowMovementFormProps {
  projectId: number;
  movement?: CashFlowMovement;
  onSubmit: (data: CashFlowFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function CashFlowMovementForm({
  projectId,
  movement,
  onSubmit,
  onCancel,
  isSubmitting,
}: CashFlowMovementFormProps) {
  if (!projectId) {
    return (
      <div className="p-4 text-center text-destructive">
        Erro: Projeto não selecionado
      </div>
    );
  }
  
  const { data: stages = [] } = useProjectStages(projectId);
  
  const form = useForm<CashFlowFormData>({
    resolver: zodResolver(cashFlowSchema),
    defaultValues: movement ? {
      tipo_movimento: movement.tipo_movimento,
      valor: movement.valor,
      data_movimento: movement.data_movimento,
      categoria: movement.categoria,
      subcategoria: movement.subcategoria || '',
      descricao: movement.descricao,
      etapa_id: movement.etapa_id,
      tarefa_id: movement.tarefa_id,
      fornecedor_beneficiario: movement.fornecedor_beneficiario || '',
      forma_pagamento: movement.forma_pagamento,
      numero_documento: movement.numero_documento || '',
      comprovante_url: movement.comprovante_url || '',
      observacoes: movement.observacoes || '',
    } : {
      tipo_movimento: 'saida',
      data_movimento: new Date().toISOString().split('T')[0],
      categoria: '',
      descricao: '',
      valor: 0,
    },
  });

  const tipoMovimento = form.watch('tipo_movimento');
  const selectedEtapaId = form.watch('etapa_id');
  
  // Buscar tarefas filtradas por etapa selecionada
  const { data: tasks = [] } = useProjectTasks(projectId, selectedEtapaId);
  
  const categorias = tipoMovimento === 'entrada' ? CASHFLOW_CATEGORIES.entrada : CASHFLOW_CATEGORIES.saida;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Seção: Informações Básicas */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Informações Básicas</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tipo_movimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Movimento *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saida">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor *</FormLabel>
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="data_movimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Gasto *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de gasto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIPO_GASTO_CATEGORIAS.map((cat) => (
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
          </div>

          <FormField
            control={form.control}
            name="subcategoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria Específica</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria (opcional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categorias.map((cat) => (
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
            name="descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição *</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descreva o movimento de caixa..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Seção: Detalhes */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Detalhes</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="etapa_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etapa</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value ? Number(value) : undefined);
                      // Limpar tarefa quando mudar etapa
                      form.setValue('tarefa_id', undefined);
                    }}
                    value={field.value?.toString() || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a etapa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id.toString()}>
                          {stage.numero_etapa}. {stage.nome_etapa}
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
                  <FormLabel>Tarefa</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                    value={field.value?.toString() || ''}
                    disabled={!selectedEtapaId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={selectedEtapaId ? "Selecione a tarefa" : "Selecione uma etapa primeiro"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tasks.map((task) => (
                        <SelectItem key={task.id} value={task.id.toString()}>
                          {task.descricao}
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
            name="fornecedor_beneficiario"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fornecedor/Beneficiário</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do fornecedor ou beneficiário" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="forma_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="cartao">Cartão</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numero_documento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do Documento</FormLabel>
                  <FormControl>
                    <Input placeholder="NF, recibo, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Seção: Documentação */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Documentação</h3>
          
          <FormField
            control={form.control}
            name="comprovante_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comprovante (PDF ou Imagem)</FormLabel>
                <FormControl>
                  <FileUpload
                    value={field.value}
                    onValueChange={field.onChange}
                    accept="application/pdf,image/*"
                    maxSize={5 * 1024 * 1024}
                    bucket="comprovantes-caixa"
                    placeholder="Arraste ou clique para fazer upload do comprovante"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="observacoes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Informações adicionais sobre o movimento..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormActions
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          submitLabel={movement ? "Atualizar" : "Registrar"}
        />
      </form>
    </Form>
  );
}
