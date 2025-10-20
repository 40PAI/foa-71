import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProjectDocument {
  id: number;
  projeto_id: number;
  nome_arquivo: string;
  url_arquivo: string;
  tipo_arquivo: string;
  tamanho_bytes: number;
  descricao?: string;
  created_at: string;
}

export const useProjectDocuments = (projectId: number) => {
  return useQuery({
    queryKey: ["project-documents", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documentos_projeto")
        .select("*")
        .eq("projeto_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProjectDocument[];
    },
    enabled: !!projectId,
  });
};

export const useCreateProjectDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (document: Omit<ProjectDocument, "id" | "created_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("documentos_projeto")
        .insert({
          ...document,
          uploaded_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-documents", variables.projeto_id] });
      toast.success("Documento adicionado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao adicionar documento");
    },
  });
};

export const useDeleteProjectDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, url, projectId }: { id: number; url: string; projectId: number }) => {
      const path = url.split('/').pop();
      if (path) {
        await supabase.storage
          .from("documentos-projetos")
          .remove([`projeto-${projectId}/${path}`]);
      }

      const { error } = await supabase
        .from("documentos_projeto")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-documents", variables.projectId] });
      toast.success("Documento removido com sucesso");
    },
    onError: () => {
      toast.error("Erro ao remover documento");
    },
  });
};
