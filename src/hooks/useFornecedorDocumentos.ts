import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FornecedorDocumento {
  id: string;
  fornecedor_id: string;
  nome_arquivo: string;
  tipo_documento?: string;
  tamanho_bytes?: number;
  storage_path: string;
  url_documento?: string;
  created_at: string;
}

export function useFornecedorDocumentos(fornecedorId?: string) {
  return useQuery({
    queryKey: ["fornecedor-documentos", fornecedorId],
    queryFn: async () => {
      if (!fornecedorId) return [];
      
      const { data, error } = await supabase
        .from("fornecedor_documentos")
        .select("*")
        .eq("fornecedor_id", fornecedorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FornecedorDocumento[];
    },
    enabled: !!fornecedorId,
  });
}

export function useUploadFornecedorDocumento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fornecedorId,
      file,
      tipoDocumento,
    }: {
      fornecedorId: string;
      file: File;
      tipoDocumento?: string;
    }) => {
      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${fornecedorId}/${Date.now()}.${fileExt}`;
      const filePath = `fornecedor-documentos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("fornecedor-documentos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("fornecedor-documentos")
        .getPublicUrl(filePath);

      // Create database record
      const { data, error } = await supabase
        .from("fornecedor_documentos")
        .insert({
          fornecedor_id: fornecedorId,
          nome_arquivo: file.name,
          tipo_documento: tipoDocumento,
          tamanho_bytes: file.size,
          storage_path: filePath,
          url_documento: urlData.publicUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["fornecedor-documentos", variables.fornecedorId],
      });
      toast.success("Documento enviado com sucesso");
    },
    onError: (error) => {
      console.error("Erro ao enviar documento:", error);
      toast.error("Erro ao enviar documento");
    },
  });
}

export function useDeleteFornecedorDocumento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentoId,
      storagePath,
      fornecedorId,
    }: {
      documentoId: string;
      storagePath: string;
      fornecedorId: string;
    }) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("fornecedor-documentos")
        .remove([storagePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error } = await supabase
        .from("fornecedor_documentos")
        .delete()
        .eq("id", documentoId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["fornecedor-documentos", variables.fornecedorId],
      });
      toast.success("Documento removido com sucesso");
    },
    onError: (error) => {
      console.error("Erro ao remover documento:", error);
      toast.error("Erro ao remover documento");
    },
  });
}
