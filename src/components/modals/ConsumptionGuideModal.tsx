import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { useCreateConsumptionGuide, useConsumptionGuides } from "@/hooks/useConsumptionGuides";
import { useMaterialsArmazem } from "@/hooks/useMaterialsArmazem";
import { useProjects } from "@/hooks/useProjects";
import { useProjectStages } from "@/hooks/useProjectStages";
import { useTasks } from "@/hooks/useTasks";

interface ConsumptionGuideFormData {
  projetoId: string;
  etapaId?: string;
  tarefaRelacionada?: string;
  numeroGuia: string;
  dataConsumo: string;
  responsavel: string;
  frenteServico?: string;
  observacoes?: string;
  itens: Array<{
    materialId: string;
    quantidadeConsumida: number;
    observacoes?: string;
  }>;
}

export function ConsumptionGuideModal() {
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>();
  
  const { register, handleSubmit, control, setValue, reset, watch } = useForm<ConsumptionGuideFormData>({
    defaultValues: {
      itens: [{ materialId: "", quantidadeConsumida: 0, observacoes: "" }],
      dataConsumo: new Date().toISOString().split('T')[0],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "itens",
  });
  
  const createGuide = useCreateConsumptionGuide();
  const { data: materials } = useMaterialsArmazem();
  const { data: projects } = useProjects();
  const { data: stages } = useProjectStages(selectedProjectId);
  const { data: tasks } = useTasks(selectedProjectId);
  const { data: guides } = useConsumptionGuides();

  // Gerar próximo número de guia automaticamente quando o modal abrir
  useEffect(() => {
    if (open) {
      const generateNextGuideNumber = () => {
        if (!guides || guides.length === 0) {
          return "GC-001";
        }
        
        // Encontrar o maior número de guia
        const numbers = guides
          .map(g => {
            const match = g.numero_guia.match(/GC-(\d+)/);
            return match ? parseInt(match[1]) : 0;
          })
          .filter(n => !isNaN(n));
        
        const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
        const nextNumber = maxNumber + 1;
        
        return `GC-${nextNumber.toString().padStart(3, '0')}`;
      };
      
      setValue("numeroGuia", generateNextGuideNumber());
    }
  }, [open, guides, setValue]);

  const onSubmit = async (data: ConsumptionGuideFormData) => {
    await createGuide.mutateAsync({
      ...data,
      projetoId: parseInt(data.projetoId),
      etapaId: data.etapaId ? parseInt(data.etapaId) : undefined,
    });
    setOpen(false);
    reset();
    setSelectedProjectId(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <ClipboardList className="h-4 w-4 mr-2" />
          Nova Guia de Consumo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Guia de Consumo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projetoId">Projeto *</Label>
            <Select 
              onValueChange={(value) => {
                setValue("projetoId", value);
                setSelectedProjectId(parseInt(value));
                // Reset etapa e tarefa quando mudar de projeto
                setValue("etapaId", "");
                setValue("tarefaRelacionada", "");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar projeto" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.nome} - {project.cliente}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProjectId && (
            <>
              <div className="space-y-2">
                <Label htmlFor="etapaId">Etapa</Label>
                <Select onValueChange={(value) => setValue("etapaId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages?.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id.toString()}>
                        {stage.numero_etapa} - {stage.nome_etapa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tarefaRelacionada">Tarefa Relacionada</Label>
                <Select onValueChange={(value) => setValue("tarefaRelacionada", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar tarefa" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks?.map((task) => (
                      <SelectItem key={task.id} value={task.id.toString()}>
                        {task.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numeroGuia">Número da Guia</Label>
              <Input
                id="numeroGuia"
                {...register("numeroGuia", { required: true })}
                placeholder="GC-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataConsumo">Data de Consumo</Label>
              <Input
                id="dataConsumo"
                type="date"
                {...register("dataConsumo", { required: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável *</Label>
              <Input
                id="responsavel"
                {...register("responsavel", { required: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frenteServico">Frente de Serviço</Label>
              <Input
                id="frenteServico"
                {...register("frenteServico")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações Gerais</Label>
            <Textarea
              id="observacoes"
              {...register("observacoes")}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Materiais a Consumir</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ materialId: "", quantidadeConsumida: 0, observacoes: "" })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Item
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Material</Label>
                    <Select onValueChange={(value) => setValue(`itens.${index}.materialId`, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials?.map((material) => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.nome_material} - Stock: {material.quantidade_stock}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`itens.${index}.quantidadeConsumida`, { 
                        required: true, 
                        valueAsNumber: true 
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observações do Item</Label>
                  <Input
                    {...register(`itens.${index}.observacoes`)}
                    placeholder="Observações específicas deste item..."
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createGuide.isPending}>
              {createGuide.isPending ? "Criando..." : "Criar Guia"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}