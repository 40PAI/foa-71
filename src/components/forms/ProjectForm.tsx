import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ProjectFormTabs } from "./project/ProjectFormTabs";
import { type ProjectCentroCusto } from "./project/ProjectCentrosCustoForm";
import { FormActions } from "@/components/shared/FormActions";
import { useCreateProject, useUpdateProject } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import { useCreateProjectStages, useUpdateProjectStages, useProjectStages } from "@/hooks/useProjectStages";
import { useCentrosCusto, useCreateCentroCusto } from "@/hooks/useCentrosCusto";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Tables } from "@/integrations/supabase/types";
import { projectSchema, type ProjectFormDataType, type ProjectStage } from "./project/types";

interface ProjectFormProps {
  project?: Tables<"projetos">;
  onSuccess: () => void;
}

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const [stages, setStages] = useState<ProjectStage[]>([]);
  const [centrosCusto, setCentrosCusto] = useState<ProjectCentroCusto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("geral");
  
  const { toast } = useToast();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const createStagesMutation = useCreateProjectStages();
  const updateStagesMutation = useUpdateProjectStages();
  const createCentroCustoMutation = useCreateCentroCusto();
  const { data: existingStages } = useProjectStages(project?.id);
  const { data: existingCentrosCusto } = useCentrosCusto(project?.id);

  const form = useForm<ProjectFormDataType>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      nome: "",
      cliente: "",
      encarregado: "",
      data_inicio: "",
      data_fim_prevista: "",
      orcamento: 0,
      limite_aprovacao: 0,
      limite_gastos: 0,
      status: "Em Andamento",
      provincia: "",
      municipio: "",
      zona_bairro: "",
      tipo_projeto: "Residencial",
      numero_etapas: 1,
    },
  });

  // Load existing project data
  useEffect(() => {
    if (project) {
      form.setValue("nome", project.nome);
      form.setValue("cliente", project.cliente);
      form.setValue("encarregado", project.encarregado);
      form.setValue("data_inicio", project.data_inicio);
      form.setValue("data_fim_prevista", project.data_fim_prevista);
      form.setValue("orcamento", project.orcamento);
      form.setValue("limite_aprovacao", project.limite_aprovacao);
      form.setValue("limite_gastos", project.limite_gastos || 0);
      form.setValue("status", project.status as any);
      form.setValue("provincia", project.provincia);
      form.setValue("municipio", project.municipio);
      form.setValue("zona_bairro", project.zona_bairro || "");
      form.setValue("tipo_projeto", project.tipo_projeto as any);
    }
  }, [project, form]);

  // Load existing stages
  useEffect(() => {
    if (existingStages && existingStages.length > 0) {
      const formattedStages: ProjectStage[] = existingStages.map((stage) => ({
        numero_etapa: stage.numero_etapa,
        nome_etapa: stage.nome_etapa,
        tipo_etapa: stage.tipo_etapa,
        responsavel_etapa: stage.responsavel_etapa,
        data_inicio_etapa: stage.data_inicio_etapa || "",
        data_fim_prevista_etapa: stage.data_fim_prevista_etapa || "",
        status_etapa: stage.status_etapa,
        observacoes: stage.observacoes || "",
        orcamento_etapa: stage.orcamento_etapa || 0,
        gasto_etapa: stage.gasto_etapa || 0,
        tempo_previsto_dias: stage.tempo_previsto_dias || 0,
        tempo_real_dias: stage.tempo_real_dias || 0,
      }));
      setStages(formattedStages);
      form.setValue("numero_etapas", formattedStages.length);
    }
  }, [existingStages, form]);

  // Load existing centros de custo
  useEffect(() => {
    if (existingCentrosCusto && existingCentrosCusto.length > 0 && existingStages) {
      const formattedCentros: ProjectCentroCusto[] = existingCentrosCusto.map((centro) => {
        // Encontrar etapa correspondente
        const etapa = existingStages.find(s => s.id === centro.etapa_id);
        return {
          codigo: centro.codigo,
          nome: centro.nome,
          tipo: centro.tipo,
          etapa_numero: etapa?.numero_etapa,
          departamento: centro.departamento || "",
          orcamento_mensal: centro.orcamento_mensal || 0,
        };
      });
      setCentrosCusto(formattedCentros);
    }
  }, [existingCentrosCusto, existingStages]);

  const validateStages = (stages: ProjectStage[]) => {
    if (stages.length === 0) {
      toast({
        title: "❌ Erro de Validação",
        description: "É necessário definir pelo menos uma etapa para o projeto.",
        variant: "destructive",
      });
      setActiveTab("etapas");
      return false;
    }

    const etapasComErro: number[] = [];
    stages.forEach((stage, index) => {
      if (!stage.nome_etapa?.trim()) {
        etapasComErro.push(index + 1);
      }
    });

    if (etapasComErro.length > 0) {
      toast({
        title: "❌ Etapas Incompletas",
        description: `As seguintes etapas precisam de um nome: ${etapasComErro.join(", ")}`,
        variant: "destructive",
        duration: 5000,
      });
      setActiveTab("etapas");
      return false;
    }

    return true;
  };

  const validateCentrosCusto = (centros: ProjectCentroCusto[]) => {
    const centrosComErro: number[] = [];
    centros.forEach((centro, index) => {
      if (!centro.codigo.trim() || !centro.nome.trim() || !centro.tipo) {
        centrosComErro.push(index + 1);
      }
    });

    if (centrosComErro.length > 0) {
      toast({
        title: "❌ Centros de Custo Incompletos",
        description: `Os seguintes centros precisam de código, nome e tipo: ${centrosComErro.join(", ")}`,
        variant: "destructive",
        duration: 5000,
      });
      setActiveTab("financeiro");
      return false;
    }

    return true;
  };

  const onSubmit = async (data: ProjectFormDataType) => {
    setIsSubmitting(true);
    try {
      console.log("=== INÍCIO DA SUBMISSÃO DO PROJETO ===");
      console.log("Dados do formulário:", data);
      console.log("Número de etapas:", stages.length);
      console.log("Etapas:", stages);
      
      logger.formSubmit("ProjectForm", { ...data, stages });
      
      if (!validateStages(stages)) {
        console.log("❌ Validação de etapas falhou");
        setIsSubmitting(false);
        return;
      }

      if (centrosCusto.length > 0 && !validateCentrosCusto(centrosCusto)) {
        console.log("❌ Validação de centros de custo falhou");
        setIsSubmitting(false);
        return;
      }
      
      console.log("✅ Validação OK, prosseguindo com criação/atualização...");
      
      const projectData = {
        nome: data.nome,
        cliente: data.cliente,
        encarregado: data.encarregado,
        data_inicio: data.data_inicio,
        data_fim_prevista: data.data_fim_prevista,
        orcamento: Math.round(data.orcamento),
        limite_aprovacao: Math.round(data.limite_aprovacao),
        limite_gastos: Math.round(data.limite_gastos),
        status: data.status as any,
        provincia: data.provincia,
        municipio: data.municipio,
        zona_bairro: data.zona_bairro || null,
        tipo_projeto: data.tipo_projeto as any,
        numero_etapas: stages.length,
      };

      let savedProject;

      if (project) {
        logger.mutation("UpdateProject", projectData);
        savedProject = await updateMutation.mutateAsync({
          ...projectData,
          id: project.id,
        });

        const stagesData = stages.map(stage => ({
          projeto_id: project.id,
          numero_etapa: stage.numero_etapa,
          nome_etapa: stage.nome_etapa,
          tipo_etapa: stage.tipo_etapa,
          responsavel_etapa: stage.responsavel_etapa,
          data_inicio_etapa: stage.data_inicio_etapa || null,
          data_fim_prevista_etapa: stage.data_fim_prevista_etapa || null,
          status_etapa: stage.status_etapa,
          observacoes: stage.observacoes || null,
          orcamento_etapa: Math.round(stage.orcamento_etapa || 0),
          gasto_etapa: Math.round(stage.gasto_etapa || 0),
          tempo_previsto_dias: stage.tempo_previsto_dias || 0,
          tempo_real_dias: stage.tempo_real_dias || 0,
        }));

        const updatedStages = await updateStagesMutation.mutateAsync({
          projectId: project.id,
          stages: stagesData,
        });

        // Atualizar centros de custo se houver
        if (centrosCusto.length > 0) {
          // Buscar centros existentes
          const { data: existingCentros } = await supabase
            .from("centros_custo")
            .select("*")
            .eq("projeto_id", project.id)
            .eq("ativo", true);

          // Atualizar ou criar centros de custo
          for (const centro of centrosCusto) {
            // Encontrar o ID da etapa correspondente (usar etapas atualizadas)
            const etapaCorrespondente = updatedStages?.find(
              (s: any) => s.numero_etapa === centro.etapa_numero
            );

            // Verificar se centro já existe (por código)
            const centroExistente = existingCentros?.find(
              (ec: any) => ec.codigo === centro.codigo
            );

            if (centroExistente) {
              // Atualizar centro existente
              await supabase
                .from("centros_custo")
                .update({
                  nome: centro.nome,
                  tipo: centro.tipo,
                  etapa_id: etapaCorrespondente?.id,
                  departamento: centro.departamento || null,
                  orcamento_mensal: centro.orcamento_mensal,
                })
                .eq("id", centroExistente.id);
            } else {
              // Criar novo centro
              await createCentroCustoMutation.mutateAsync({
                codigo: centro.codigo,
                nome: centro.nome,
                tipo: centro.tipo,
                projeto_id: project.id,
                etapa_id: etapaCorrespondente?.id,
                departamento: centro.departamento || null,
                orcamento_mensal: centro.orcamento_mensal,
                ativo: true,
              });
            }
          }

          // Desativar centros que foram removidos
          const codigosAtuais = centrosCusto.map(c => c.codigo);
          const centrosParaDesativar = existingCentros?.filter(
            (ec: any) => !codigosAtuais.includes(ec.codigo)
          );

          if (centrosParaDesativar && centrosParaDesativar.length > 0) {
            for (const centro of centrosParaDesativar) {
              await supabase
                .from("centros_custo")
                .update({ ativo: false })
                .eq("id", centro.id);
            }
          }
        }

        toast({
          title: "Sucesso",
          description: `Projeto, ${stages.length} etapa(s) e ${centrosCusto.length} centro(s) de custo atualizados com sucesso`,
        });
      } else {
        logger.mutation("CreateProject", projectData);
        savedProject = await createMutation.mutateAsync(projectData);

        const stagesData = stages.map(stage => ({
          projeto_id: savedProject.id,
          numero_etapa: stage.numero_etapa,
          nome_etapa: stage.nome_etapa,
          tipo_etapa: stage.tipo_etapa,
          responsavel_etapa: stage.responsavel_etapa,
          data_inicio_etapa: stage.data_inicio_etapa || null,
          data_fim_prevista_etapa: stage.data_fim_prevista_etapa || null,
          status_etapa: stage.status_etapa,
          observacoes: stage.observacoes || null,
          orcamento_etapa: Math.round(stage.orcamento_etapa || 0),
          gasto_etapa: Math.round(stage.gasto_etapa || 0),
          tempo_previsto_dias: stage.tempo_previsto_dias || 0,
          tempo_real_dias: stage.tempo_real_dias || 0,
        }));

        const createdStages = await createStagesMutation.mutateAsync({
          projectId: savedProject.id,
          stages: stagesData,
        });

        // Criar centros de custo se houver
        if (centrosCusto.length > 0) {
          for (const centro of centrosCusto) {
            // Encontrar o ID da etapa correspondente
            const etapaCorrespondente = createdStages.find(
              (s: any) => s.numero_etapa === centro.etapa_numero
            );

            await createCentroCustoMutation.mutateAsync({
              codigo: centro.codigo,
              nome: centro.nome,
              tipo: centro.tipo,
              projeto_id: savedProject.id,
              etapa_id: etapaCorrespondente?.id,
              departamento: centro.departamento || null,
              orcamento_mensal: centro.orcamento_mensal,
              ativo: true,
            });
          }
        }

        toast({
          title: "Sucesso",
          description: `Projeto, ${stages.length} etapa(s) e ${centrosCusto.length} centro(s) de custo criados com sucesso`,
        });
      }

      logger.mutationSuccess(project ? "UpdateProject" : "CreateProject", savedProject);
      onSuccess();
    } catch (error) {
      logger.mutationError(project ? "UpdateProject" : "CreateProject", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar projeto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabNavigation = (direction: 'next' | 'prev') => {
    const tabs = ["geral", "etapas", "financeiro", "localizacao"];
    const currentIndex = tabs.indexOf(activeTab);
    
    if (direction === 'next' && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ProjectFormTabs
          form={form}
          stages={stages}
          onStagesChange={setStages}
          centrosCusto={centrosCusto}
          onCentrosCustoChange={setCentrosCusto}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="flex justify-between">
          <div className="flex gap-2">
            {activeTab !== "geral" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleTabNavigation('prev')}
              >
                Anterior
              </Button>
            )}
            
            {activeTab !== "localizacao" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleTabNavigation('next')}
              >
                Próximo
              </Button>
            )}
          </div>

          <FormActions
            submitLabel={project ? "Atualizar" : "Criar"}
            isSubmitting={isSubmitting}
            showCancel={false}
          />
        </div>
      </form>
    </Form>
  );
}