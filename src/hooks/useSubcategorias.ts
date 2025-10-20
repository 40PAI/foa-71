import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Subcategoria {
  id: number;
  categoria_principal: string;
  categoria_secundaria: string;
  nome_subcategoria: string;
  categoria_financeira: string;
  descricao: string | null;
  limite_aprovacao_automatica: number;
}

export function useSubcategorias(
  categoriaPrincipal?: string,
  categoriaSecundaria?: string
) {
  return useQuery({
    queryKey: ["subcategorias", categoriaPrincipal, categoriaSecundaria],
    queryFn: async () => {
      if (!categoriaPrincipal || !categoriaSecundaria) return [];
      
      const { data, error } = await supabase
        .from("subcategorias_compras")
        .select("*")
        .eq("categoria_principal", categoriaPrincipal as any)
        .eq("categoria_secundaria", categoriaSecundaria);
      
      if (error) throw error;
      return data as Subcategoria[];
    },
    enabled: !!categoriaPrincipal && !!categoriaSecundaria,
  });
}