import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Trash2, CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
interface ProjectStage {
  numero_etapa: number;
  nome_etapa: string;
  tipo_etapa: string;
  responsavel_etapa: string;
  data_inicio_etapa: string;
  data_fim_prevista_etapa: string;
  status_etapa: string;
  observacoes: string;
  orcamento_etapa: number;
  gasto_etapa: number;
  tempo_previsto_dias: number;
  tempo_real_dias: number;
}
interface ProjectStagesFormProps {
  form: UseFormReturn<any>;
  stages: ProjectStage[];
  onStagesChange: (stages: ProjectStage[]) => void;
}
export function ProjectStagesForm({
  form,
  stages,
  onStagesChange
}: ProjectStagesFormProps) {
  const numeroEtapas = form.watch("numero_etapas") || 1;
  const addStage = () => {
    const newStage: ProjectStage = {
      numero_etapa: stages.length + 1,
      nome_etapa: "",
      tipo_etapa: "Fundação",
      responsavel_etapa: "",
      data_inicio_etapa: "",
      data_fim_prevista_etapa: "",
      status_etapa: "Não Iniciada",
      observacoes: "",
      orcamento_etapa: 0,
      gasto_etapa: 0,
      tempo_previsto_dias: 0,
      tempo_real_dias: 0
    };
    const newStages = [...stages, newStage];
    onStagesChange(newStages);
    form.setValue("numero_etapas", newStages.length);
  };
  const removeStage = (index: number) => {
    const newStages = stages.filter((_, i) => i !== index).map((stage, i) => ({
      ...stage,
      numero_etapa: i + 1
    }));
    onStagesChange(newStages);
    form.setValue("numero_etapas", newStages.length);
  };
  const updateStage = (index: number, field: keyof ProjectStage, value: string | number) => {
    const newStages = [...stages];
    newStages[index] = {
      ...newStages[index],
      [field]: value
    };
    onStagesChange(newStages);
  };
  return <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField control={form.control} name="numero_etapas" render={({
        field
      }) => <FormItem>
              <FormLabel>Número de Etapas</FormLabel>
              <FormControl>
                <Input type="number" min="1" max="150" {...field} onChange={e => {
            const value = parseInt(e.target.value) || 1;
            field.onChange(value);
          }} />
              </FormControl>
              <FormMessage />
            </FormItem>} />

        <div className="flex items-end">
          <Button type="button" variant="outline" onClick={addStage} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Etapa
          </Button>
        </div>
      </div>

      {stages.map((stage, index) => <div key={index} className="border rounded-lg p-4 space-y-4 bg-card">
          <div className="flex justify-between items-center pb-3 border-l-4 border-accent pl-3 bg-accent/10 rounded-sm">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">Etapa {stage.numero_etapa}</h4>
              {stage.nome_etapa.trim() ? <Badge variant="default" className="bg-green-500">✓ Válida</Badge> : <Badge variant="destructive">✗ Nome obrigatório</Badge>}
            </div>
            {stages.length > 1 && <Button type="button" variant="outline" size="sm" onClick={() => removeStage(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nome da Etapa</label>
              <Input value={stage.nome_etapa} onChange={e => updateStage(index, "nome_etapa", e.target.value)} placeholder="Nome da etapa" className={!stage.nome_etapa.trim() ? "border-red-500 focus-visible:ring-red-500" : ""} />
            </div>

            <div>
              <label className="text-sm font-medium">Tipo de Etapa</label>
              <Select value={stage.tipo_etapa} onValueChange={value => updateStage(index, "tipo_etapa", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mobilização">Mobilização</SelectItem>
                  <SelectItem value="Fundação">Fundação</SelectItem>
                  <SelectItem value="Estrutura">Estrutura</SelectItem>
                  <SelectItem value="Alvenaria">Alvenaria</SelectItem>
                  <SelectItem value="Acabamento">Acabamento</SelectItem>
                  <SelectItem value="Instalações">Instalações</SelectItem>
                  <SelectItem value="Entrega">Entrega</SelectItem>
                  <SelectItem value="Desmobilização">Desmobilização</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Responsável</label>
              <Input value={stage.responsavel_etapa} onChange={e => updateStage(index, "responsavel_etapa", e.target.value)} placeholder="Nome do responsável" />
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={stage.status_etapa} onValueChange={value => updateStage(index, "status_etapa", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Não Iniciada">Não Iniciada</SelectItem>
                  <SelectItem value="Em Curso">Em Curso</SelectItem>
                  <SelectItem value="Concluída">Concluída</SelectItem>
                  <SelectItem value="Atrasada">Atrasada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Data de Início</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !stage.data_inicio_etapa && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {stage.data_inicio_etapa ? (
                      format(parseISO(stage.data_inicio_etapa), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={stage.data_inicio_etapa ? parseISO(stage.data_inicio_etapa) : undefined}
                    onSelect={(date) => updateStage(index, "data_inicio_etapa", date ? format(date, "yyyy-MM-dd") : "")}
                    initialFocus
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Data Fim Prevista</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !stage.data_fim_prevista_etapa && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {stage.data_fim_prevista_etapa ? (
                      format(parseISO(stage.data_fim_prevista_etapa), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={stage.data_fim_prevista_etapa ? parseISO(stage.data_fim_prevista_etapa) : undefined}
                    onSelect={(date) => updateStage(index, "data_fim_prevista_etapa", date ? format(date, "yyyy-MM-dd") : "")}
                    initialFocus
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Observações</label>
            <Input value={stage.observacoes} onChange={e => updateStage(index, "observacoes", e.target.value)} placeholder="Observações sobre a etapa" />
          </div>

          {/* Seção Financeira */}
          <div className="border-t pt-4 mt-4">
            <h5 className="font-medium text-sm mb-3 text-primary">Dados Financeiros</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Orçamento da Etapa</label>
                <CurrencyInput value={stage.orcamento_etapa} onValueChange={value => updateStage(index, "orcamento_etapa", value)} placeholder="0,00" />
                <p className="text-xs text-muted-foreground mt-1">Valor orçado para esta etapa</p>
              </div>

              <div>
                <label className="text-sm font-medium">Gasto Real da Etapa</label>
                <CurrencyInput 
                  value={stage.gasto_etapa} 
                  onValueChange={value => updateStage(index, "gasto_etapa", value)} 
                  placeholder="0,00"
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">Valor realmente gasto (calculado automaticamente)</p>
              </div>
            </div>
          </div>

          {/* Seção Temporal */}
          <div className="border-t pt-4 mt-4">
            <h5 className="font-medium text-sm mb-3 text-primary">Dados Temporais</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tempo Previsto (dias)</label>
                <Input type="number" min="0" value={stage.tempo_previsto_dias} onChange={e => updateStage(index, "tempo_previsto_dias", parseInt(e.target.value) || 0)} placeholder="0" />
                <p className="text-xs text-muted-foreground mt-1">Duração prevista em dias</p>
              </div>

              <div>
                <label className="text-sm font-medium">Tempo Real (dias)</label>
                <Input 
                  type="number" 
                  min="0" 
                  value={stage.tempo_real_dias} 
                  onChange={e => updateStage(index, "tempo_real_dias", parseInt(e.target.value) || 0)} 
                  placeholder="0"
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">Duração real em dias (calculado automaticamente)</p>
              </div>
            </div>
          </div>
        </div>)}

      {stages.length === 0 && <div className="text-center py-8 text-muted-foreground">
          <p>Nenhuma etapa definida. Clique em "Adicionar Etapa" para começar.</p>
        </div>}
    </div>;
}