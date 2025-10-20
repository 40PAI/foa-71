import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useFornecedores } from "@/hooks/useFornecedores";
import { ProjectSelector } from "@/components/ProjectSelector";
import { FormActions } from "@/components/shared/FormActions";

const contratoFornecedorSchema = z.object({
  fornecedor_id: z.string().uuid("Selecione um fornecedor válido"),
  projeto_id: z.number().optional().nullable(),
  numero_contrato: z.string().trim().optional(),
  descricao_produtos_servicos: z.string()
    .trim()
    .min(1, "Descrição obrigatória")
    .max(500, "Máximo 500 caracteres"),
  valor_contratado: z.number()
    .min(0.01, "Valor deve ser maior que zero"),
  data_inicio: z.string().min(1, "Data de início obrigatória"),
  data_termino: z.string().optional().or(z.literal("")),
  condicao_pagamento: z.string().optional(),
  metodo_pagamento: z.enum([
    "transferencia", 
    "cheque", 
    "dinheiro", 
    "cartao", 
    "boleto", 
    "pix"
  ]).optional(),
  status: z.enum(["ativo", "concluido", "cancelado", "suspenso"]),
  documento_contrato_url: z.string().optional(),
  observacoes: z.string().optional(),
});

type ContratoFornecedorFormData = z.infer<typeof contratoFornecedorSchema>;

interface ContratoFornecedorFormProps {
  contrato?: any;
  projectId?: number;
  onSubmit: (data: ContratoFornecedorFormData) => Promise<void>;
  onCancel: () => void;
}

export function ContratoFornecedorForm({
  contrato,
  projectId,
  onSubmit,
  onCancel,
}: ContratoFornecedorFormProps) {
  const { data: fornecedores = [] } = useFornecedores();
  const fornecedoresAtivos = fornecedores.filter(f => f.status === "ativo");

  const form = useForm<ContratoFornecedorFormData>({
    resolver: zodResolver(contratoFornecedorSchema),
    defaultValues: contrato ? {
      fornecedor_id: contrato.fornecedor_id,
      projeto_id: contrato.projeto_id || projectId,
      numero_contrato: contrato.numero_contrato || "",
      descricao_produtos_servicos: contrato.descricao_produtos_servicos,
      valor_contratado: contrato.valor_contratado,
      data_inicio: contrato.data_inicio,
      data_termino: contrato.data_termino || "",
      condicao_pagamento: contrato.condicao_pagamento || "",
      metodo_pagamento: contrato.metodo_pagamento || undefined,
      status: contrato.status,
      documento_contrato_url: contrato.documento_contrato_url || "",
      observacoes: contrato.observacoes || "",
    } : {
      projeto_id: projectId,
      status: "ativo" as const,
      valor_contratado: 0,
      data_inicio: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const valorPago = contrato?.valor_pago || 0;
  const valorContratado = form.watch("valor_contratado");
  const saldoPagar = valorContratado - valorPago;

  const handleSubmit = async (data: ContratoFornecedorFormData) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Informação Básica */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">📋 Informação Básica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fornecedor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fornecedor *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o fornecedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fornecedoresAtivos.map((fornecedor) => (
                        <SelectItem key={fornecedor.id} value={fornecedor.id}>
                          {fornecedor.nome}
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
              name="numero_contrato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do Contrato</FormLabel>
                  <FormControl>
                    <Input placeholder="CF-2025-001 (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="descricao_produtos_servicos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição de Produtos/Serviços *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva os produtos ou serviços contratados..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Valores Financeiros */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">💰 Valores Financeiros</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="valor_contratado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Contratado *</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Valor Pago</FormLabel>
              <FormControl>
                <CurrencyInput
                  value={valorPago}
                  onValueChange={() => {}}
                  disabled
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Saldo a Pagar</FormLabel>
              <FormControl>
                <CurrencyInput
                  value={saldoPagar}
                  onValueChange={() => {}}
                  disabled
                />
              </FormControl>
            </FormItem>
          </div>
        </div>

        {/* Datas */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">📅 Datas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="data_inicio"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Início *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Selecione a data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data_termino"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Término</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Selecione a data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem className="flex flex-col">
              <FormLabel>Último Pagamento</FormLabel>
              <FormControl>
                <Input
                  value={contrato?.data_ultimo_pagamento ? format(new Date(contrato.data_ultimo_pagamento), "dd/MM/yyyy") : "-"}
                  disabled
                />
              </FormControl>
            </FormItem>
          </div>
        </div>

        {/* Condições de Pagamento */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">💳 Condições de Pagamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="condicao_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condição de Pagamento</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: 30 dias após entrega, 50% antecipado..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metodo_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cartao">Cartão</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Associação */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">🏗️ Associação</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="projeto_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Projeto</FormLabel>
                  <FormControl>
                    <ProjectSelector
                      value={field.value?.toString() || undefined}
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      placeholder="Selecione o projeto (opcional)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                      <SelectItem value="suspenso">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Documentos */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">📎 Documentos</h3>
          <FormField
            control={form.control}
            name="documento_contrato_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL do Documento</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://exemplo.com/contrato.pdf"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Observações */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">📝 Observações</h3>
          <FormField
            control={form.control}
            name="observacoes"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Observações adicionais sobre o contrato..."
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
          submitLabel={contrato ? "Atualizar Contrato" : "Criar Contrato"}
          isSubmitting={form.formState.isSubmitting}
        />
      </form>
    </Form>
  );
}
