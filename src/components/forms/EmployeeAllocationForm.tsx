
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmployeeAllocations } from "@/hooks/useEmployeeAllocations";
import { useEmployees } from "@/hooks/useEmployees";
import { useProjects } from "@/hooks/useProjects";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  colaborador_id: z.number({
    required_error: "Selecione um colaborador",
  }),
  projeto_id: z.number({
    required_error: "Selecione um projeto",
  }),
  funcao: z.string().min(1, "Função é obrigatória"),
  horario_tipo: z.string().min(1, "Tipo de horário é obrigatório"),
  data_alocacao: z.string().min(1, "Data de alocação é obrigatória"),
});

type FormData = z.infer<typeof formSchema>;

interface EmployeeAllocationFormProps {
  onSuccess?: () => void;
  employee?: any;
  preselectedProjectId?: number;
}

export function EmployeeAllocationForm({ onSuccess, employee, preselectedProjectId }: EmployeeAllocationFormProps) {
  const { toast } = useToast();
  const { create: createAllocation, getAllocations } = useEmployeeAllocations();
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: existingAllocations } = getAllocations;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      colaborador_id: employee?.id,
      projeto_id: preselectedProjectId,
      funcao: "",
      horario_tipo: "Integral",
      data_alocacao: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: FormData) => {
    // Ensure all required fields are present
    const allocationData = {
      colaborador_id: data.colaborador_id,
      projeto_id: data.projeto_id,
      funcao: data.funcao,
      horario_tipo: data.horario_tipo,
      data_alocacao: data.data_alocacao,
    };

    createAllocation.mutate(allocationData, {
      onSuccess: () => {
        toast({
          title: "Colaborador alocado",
          description: "Colaborador alocado ao projeto com sucesso.",
        });
        form.reset();
        onSuccess?.();
      },
      onError: (error: any) => {
        console.error('Error creating allocation:', error);
        
        let errorMessage = "Erro ao alocar colaborador. Tente novamente.";
        
        if (error.message === "Este colaborador já está alocado a este projeto") {
          errorMessage = "Este colaborador já está alocado a este projeto.";
        }
        
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });
      },
    });
  };

  // Filtrar colaboradores já alocados ao projeto selecionado
  const selectedProjectId = form.watch("projeto_id");
  const availableEmployees = employees?.filter(emp => {
    // Se há um colaborador pré-selecionado, incluí-lo sempre
    if (employee && emp.id === employee.id) return true;
    
    // Filtrar colaboradores já alocados ao projeto selecionado
    const isAllocated = existingAllocations?.some(
      allocation => allocation.colaborador_id === emp.id && allocation.projeto_id === selectedProjectId
    );
    return !isAllocated;
  }) || [];

  if (employeesLoading || projectsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="colaborador_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Colaborador</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString()}
                disabled={!!employee}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um colaborador" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.nome} - {emp.cargo}
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
          name="projeto_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Projeto</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString()}
                disabled={!!preselectedProjectId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um projeto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.nome}
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
          name="funcao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Função no Projeto</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Pedreiro, Eletricista, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="horario_tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Horário</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de horário" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Integral">Integral (8h)</SelectItem>
                  <SelectItem value="Meio Período">Meio Período (4h)</SelectItem>
                  <SelectItem value="Flexível">Flexível</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data_alocacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Alocação</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={createAllocation.isPending}>
          {createAllocation.isPending ? "Alocando..." : "Alocar Colaborador"}
        </Button>
      </form>
    </Form>
  );
}
