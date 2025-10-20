
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { CurrencyInput } from "@/components/ui/currency-input";
import { ProjectSelector } from "@/components/ProjectSelector";
import { StageSelector } from "@/components/StageSelector";
import { WeekSelector } from "@/components/WeekSelector";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatters";

const taskSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
  tipo: z.enum(["Residencial", "Comercial", "Industrial", "Infraestrutura", "Reforma"]),
  responsavel: z.string().min(1, "Responsável é obrigatório"),
  prazo: z.string().min(1, "Prazo é obrigatório"),
  id_projeto: z.string().min(1, "Projeto é obrigatório"),
  id_etapa: z.string().min(1, "Etapa é obrigatória"),
  semana_programada: z.string().optional(),
  percentual_conclusao: z.number().min(0).max(100).default(0),
  status: z.enum(["Pendente", "Em Andamento", "Concluído"]).default("Pendente"),
  gasto_real: z.number().min(0).default(0),
  tempo_real_dias: z.number().int().min(0).default(0),
  preco_unitario: z.number().min(0).default(0),
  custo_material: z.number().min(0).default(0),
  custo_mao_obra: z.number().min(0).default(0),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: any;
  onSuccess: () => void;
}

export function TaskForm({ task, onSuccess }: TaskFormProps) {
  const { toast } = useToast();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      descricao: task?.descricao || "",
      tipo: task?.tipo || "Residencial",
      responsavel: task?.responsavel || "",
      prazo: task?.prazo || "",
      id_projeto: task?.id_projeto?.toString() || "",
      id_etapa: task?.id_etapa?.toString() || "",
      semana_programada: task?.semana_programada?.toString() || "",
      percentual_conclusao: task?.percentual_conclusao || 0,
      status: task?.status || "Pendente",
      gasto_real: task?.gasto_real || 0,
      tempo_real_dias: task?.tempo_real_dias || 0,
      preco_unitario: task?.preco_unitario || 0,
      custo_material: task?.custo_material || 0,
      custo_mao_obra: task?.custo_mao_obra || 0,
    },
  });

  const watchedProjectId = form.watch("id_projeto");
  const watchedStageId = form.watch("id_etapa");

  const onSubmit = async (values: TaskFormValues) => {
    try {
      console.log("=== INÍCIO DO PROCESSO DE CRIAÇÃO DE TAREFA ===");
      console.log("Valores do formulário recebidos:", values);
      console.log("Validação de valores obrigatórios:");
      console.log("- Descrição:", values.descricao ? "✓" : "✗");
      console.log("- Tipo:", values.tipo ? "✓" : "✗");
      console.log("- Responsável:", values.responsavel ? "✓" : "✗");
      console.log("- Prazo:", values.prazo ? "✓" : "✗");
      console.log("- ID Projeto:", values.id_projeto ? "✓" : "✗");
      
      const taskData = {
        descricao: values.descricao,
        tipo: values.tipo,
        responsavel: values.responsavel,
        prazo: values.prazo,
        id_projeto: parseInt(values.id_projeto),
        id_etapa: values.id_etapa ? parseInt(values.id_etapa) : null,
        semana_programada: values.semana_programada ? parseInt(values.semana_programada) : null,
        percentual_conclusao: values.percentual_conclusao,
        status: values.status,
        gasto_real: values.gasto_real || 0,
        tempo_real_dias: values.tempo_real_dias || 0,
        preco_unitario: values.preco_unitario || 0,
        custo_material: values.custo_material || 0,
        custo_mao_obra: values.custo_mao_obra || 0,
      };

      console.log("Dados processados da tarefa (prontos para inserção):", taskData);
      console.log("Tipos de dados:");
      console.log("- descricao:", typeof taskData.descricao, taskData.descricao);
      console.log("- tipo:", typeof taskData.tipo, taskData.tipo);
      console.log("- responsavel:", typeof taskData.responsavel, taskData.responsavel);
      console.log("- prazo:", typeof taskData.prazo, taskData.prazo);
      console.log("- id_projeto:", typeof taskData.id_projeto, taskData.id_projeto);
      console.log("- id_etapa:", typeof taskData.id_etapa, taskData.id_etapa);
      console.log("- percentual_conclusao:", typeof taskData.percentual_conclusao, taskData.percentual_conclusao);
      console.log("- status:", typeof taskData.status, taskData.status);

      if (task) {
        console.log("=== ATUALIZANDO TAREFA EXISTENTE ===");
        await updateTaskMutation.mutateAsync({
          id: task.id,
          ...taskData,
        });
        toast({
          title: "Tarefa atualizada",
          description: "A tarefa foi atualizada com sucesso.",
        });
      } else {
        console.log("=== CRIANDO NOVA TAREFA ===");
        console.log("Chamando createTaskMutation.mutateAsync com:", taskData);
        const result = await createTaskMutation.mutateAsync(taskData);
        console.log("Resultado da criação:", result);
        toast({
          title: "Tarefa criada",
          description: "A tarefa foi criada com sucesso.",
        });
      }
      
      console.log("=== TAREFA SALVA COM SUCESSO ===");
      onSuccess();
    } catch (error) {
      console.error("=== ERRO AO SALVAR TAREFA ===");
      console.error("Erro completo:", error);
      console.error("Mensagem do erro:", error?.message || "Erro desconhecido");
      console.error("Stack trace:", error?.stack);
      
      // Verificar se é um erro do Supabase
      if (error?.code) {
        console.error("Código do erro Supabase:", error.code);
        console.error("Detalhes do erro Supabase:", error.details);
        console.error("Hint do erro Supabase:", error.hint);
      }
      
      toast({
        title: "Erro",
        description: task ? "Erro ao atualizar tarefa." : "Erro ao criar tarefa.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva a tarefa..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Residencial">Residencial</SelectItem>
                    <SelectItem value="Comercial">Comercial</SelectItem>
                    <SelectItem value="Industrial">Industrial</SelectItem>
                    <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                    <SelectItem value="Reforma">Reforma</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                    <SelectItem value="Concluído">Concluído</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="responsavel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável</FormLabel>
              <FormControl>
                <Input placeholder="Nome do responsável" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="prazo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prazo</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="percentual_conclusao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Progresso (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    max="100" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="id_projeto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Projeto</FormLabel>
              <FormControl>
                <ProjectSelector
                  value={field.value}
                  onValueChange={(value) => {
                    console.log("Projeto selecionado:", value);
                    field.onChange(value);
                    // Reset stage selection when project changes
                    form.setValue("id_etapa", "");
                  }}
                  placeholder="Selecionar projeto..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="id_etapa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Etapa *</FormLabel>
                <FormControl>
                   <StageSelector
                     projectId={watchedProjectId}
                     value={field.value}
                     onValueChange={(value) => {
                       console.log("Etapa selecionada:", value);
                       field.onChange(value);
                       // Resetar semana quando etapa mudar
                       form.setValue("semana_programada", "");
                     }}
                     placeholder="Selecionar etapa..."
                   />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="semana_programada"
            render={({ field }) => (
               <FormItem>
                 <FormLabel>Semana Programada</FormLabel>
                 <FormControl>
                   <WeekSelector
                     projectId={watchedProjectId || ""}
                     stageId={watchedStageId}
                     value={field.value}
                     onValueChange={(value) => {
                       console.log("Semana selecionada:", value);
                       field.onChange(value);
                     }}
                     placeholder={watchedStageId ? "Selecionar semana da etapa..." : "Selecione uma etapa primeiro"}
                   />
                 </FormControl>
                 <FormMessage />
               </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 border-t pt-4 mt-4">
          <div>
            <h3 className="text-lg font-semibold text-primary">Dados Reais de Execução</h3>
            <p className="text-sm text-muted-foreground">
              Preencha os valores reais após a conclusão da tarefa
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="gasto_real"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gasto Real</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="0,00"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Valor realmente gasto para executar esta tarefa
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tempo_real_dias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempo Real (dias)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Dias realmente gastos para executar esta tarefa
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4 border-t pt-4 mt-4">
          <div>
            <h3 className="text-lg font-semibold text-primary">Composição de Custos Orçamentários</h3>
            <p className="text-sm text-muted-foreground">
              Preencha os valores conforme orçamento (estrutura das planilhas)
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="preco_unitario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PREÇO / UN (AKZ)</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="0,00"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Preço unitário conforme orçamento
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="custo_material"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PREÇO MATERIAL (AKZ)</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="0,00"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Custo total de materiais
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="custo_mao_obra"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PREÇO MÃO DE OBRA (AKZ)</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="0,00"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Custo total de mão de obra
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg border">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal Material:</span>
                <span className="font-semibold">
                  {formatCurrency(form.watch("custo_material") || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal Mão de Obra:</span>
                <span className="font-semibold">
                  {formatCurrency(form.watch("custo_mao_obra") || 0)}
                </span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-base">TOTAL da Tarefa:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(
                      (form.watch("custo_material") || 0) + 
                      (form.watch("custo_mao_obra") || 0)
                    )}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Este valor será agregado automaticamente em Finanças
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="submit"
            disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
          >
            {task ? "Atualizar" : "Criar"} Tarefa
          </Button>
        </div>
      </form>
    </Form>
  );
}
