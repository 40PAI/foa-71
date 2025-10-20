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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ProjectSelector } from "@/components/ProjectSelector";
import { useClientes } from "@/hooks/useClientes";
import { formatCurrency } from "@/utils/formatters";
import type { ContratoCliente } from "@/types/contasCorrentes";

const contratoClienteSchema = z.object({
  cliente_id: z.string().uuid("Selecione um cliente válido"),
  projeto_id: z.number().optional().nullable(),
  numero_contrato: z.string().trim().max(50).optional(),
  descricao_servicos: z.string().trim().min(1, "Descrição obrigatória").max(500, "Máximo 500 caracteres"),
  valor_contratado: z.number().min(0.01, "Valor deve ser maior que zero"),
  data_inicio: z.string().min(1, "Data de início obrigatória"),
  data_termino: z.string().optional().or(z.literal("")),
  frequencia_faturacao: z.enum(["unico", "mensal", "trimestral", "semestral", "anual"]).optional().nullable(),
  metodo_pagamento: z.enum(["transferencia", "cheque", "dinheiro", "cartao", "boleto", "pix"]).optional().nullable(),
  prazo_pagamento_dias: z.number().min(0).optional().nullable(),
  status: z.enum(["ativo", "concluido", "cancelado", "suspenso"]),
  documento_contrato_url: z.string().url().optional().or(z.literal("")),
  observacoes: z.string().trim().max(1000).optional(),
});

type ContratoClienteFormData = z.infer<typeof contratoClienteSchema>;

interface ContratoClienteFormProps {
  contrato?: ContratoCliente;
  projectId?: number;
  onSubmit: (data: ContratoClienteFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ContratoClienteForm({
  contrato,
  projectId,
  onSubmit,
  onCancel,
  isLoading,
}: ContratoClienteFormProps) {
  const { data: clientes = [] } = useClientes();
  
  const form = useForm<ContratoClienteFormData>({
    resolver: zodResolver(contratoClienteSchema),
    defaultValues: {
      cliente_id: contrato?.cliente_id || "",
      projeto_id: contrato?.projeto_id || projectId || null,
      numero_contrato: contrato?.numero_contrato || "",
      descricao_servicos: contrato?.descricao_servicos || "",
      valor_contratado: contrato?.valor_contratado ? Number(contrato.valor_contratado) : 0,
      data_inicio: contrato?.data_inicio || "",
      data_termino: contrato?.data_termino || "",
      frequencia_faturacao: contrato?.frequencia_faturacao || null,
      metodo_pagamento: contrato?.metodo_pagamento || null,
      prazo_pagamento_dias: contrato?.prazo_pagamento_dias || null,
      status: contrato?.status || "ativo",
      documento_contrato_url: contrato?.documento_contrato_url || "",
      observacoes: contrato?.observacoes || "",
    },
  });

  const handleProjectChange = (value: string) => {
    form.setValue("projeto_id", value ? parseInt(value) : null);
  };

  // Valores calculados (readonly)
  const valorRecebido = contrato?.valor_recebido ? Number(contrato.valor_recebido) : 0;
  const saldoReceber = contrato?.saldo_receber ? Number(contrato.saldo_receber) : 
    (form.watch("valor_contratado") || 0) - valorRecebido;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informação Básica */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            📋 Informação Básica
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cliente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientes
                        .filter((c) => c.status === "ativo")
                        .map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.nome}
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
                    <Input placeholder="Auto-gerado se vazio" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="descricao_servicos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição dos Serviços *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva os serviços contratados..."
                    className="min-h-[100px]"
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
          <h3 className="text-sm font-semibold flex items-center gap-2">
            💰 Valores Financeiros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="valor_contratado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Contratado *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Valor Recebido</FormLabel>
              <Input
                value={formatCurrency(valorRecebido)}
                disabled
                className="bg-muted"
              />
            </FormItem>

            <FormItem>
              <FormLabel>Saldo a Receber</FormLabel>
              <Input
                value={formatCurrency(saldoReceber)}
                disabled
                className="bg-muted"
              />
            </FormItem>
          </div>
        </div>

        {/* Datas */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            📅 Datas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "dd/MM/yyyy")
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
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "dd/MM/yyyy")
                          ) : (
                            <span>Opcional</span>
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
              <FormLabel>Último Recebimento</FormLabel>
              <Input
                value={contrato?.data_ultimo_recebimento ? format(new Date(contrato.data_ultimo_recebimento), "dd/MM/yyyy") : "—"}
                disabled
                className="bg-muted"
              />
            </FormItem>
          </div>
        </div>

        {/* Condições de Pagamento */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            💳 Condições de Pagamento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="frequencia_faturacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequência de Faturação</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unico">Único</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="trimestral">Trimestral</SelectItem>
                      <SelectItem value="semestral">Semestral</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="transferencia">Transferência</SelectItem>
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

            <FormField
              control={form.control}
              name="prazo_pagamento_dias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prazo de Pagamento (dias)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Ex: 30"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Associação */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            🏗️ Associação
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="projeto_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Projeto (Opcional)</FormLabel>
                  <ProjectSelector
                    value={field.value?.toString() || ""}
                    onValueChange={handleProjectChange}
                    placeholder="Selecione um projeto"
                  />
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
          <h3 className="text-sm font-semibold flex items-center gap-2">
            📎 Documentos
          </h3>
          <FormField
            control={form.control}
            name="documento_contrato_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL do Documento do Contrato</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Observações */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            📝 Observações
          </h3>
          <FormField
            control={form.control}
            name="observacoes"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Notas adicionais sobre o contrato..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : contrato ? "Atualizar Contrato" : "Criar Contrato"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
