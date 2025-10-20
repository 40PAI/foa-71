import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CategoriaSecundaria {
  categoria_secundaria: string;
}

export function useCategoriaSecundaria(categoriaPrincipal?: string) {
  return useQuery({
    queryKey: ["categoria-secundaria", categoriaPrincipal],
    queryFn: async () => {
      if (!categoriaPrincipal) return [];
      
      const { data, error } = await supabase
        .from("subcategorias_compras")
        .select("categoria_secundaria")
        .eq("categoria_principal", categoriaPrincipal as any)
        .order("categoria_secundaria");
      
      if (error) throw error;
      
      // Remove duplicates and return unique categories
      const uniqueCategories = Array.from(
        new Set(data.map(item => item.categoria_secundaria))
      ).map(categoria_secundaria => ({ categoria_secundaria }));
      
      return uniqueCategories;
    },
    enabled: !!categoriaPrincipal,
  });
}