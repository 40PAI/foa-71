
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Incident = Tables<"incidentes">;
type IncidentInsert = TablesInsert<"incidentes">;

export function useIncidents(projectId?: number) {
  return useQuery({
    queryKey: ["incidents", projectId],
    queryFn: async () => {
      let query = supabase
        .from("incidentes")
        .select("*")
        .order("data", { ascending: false });

      if (projectId) {
        query = query.eq("id_projeto", projectId);
      }
      
      const { data: incidents, error } = await query;
      if (error) throw error;
      
      // Buscar dados dos projetos separadamente
      const enrichedIncidents = await Promise.all(
        (incidents || []).map(async (incident) => {
          const projetoRes = incident.id_projeto 
            ? await supabase.from("projetos").select("nome").eq("id", incident.id_projeto).single()
            : null;

          return {
            ...incident,
            projeto: projetoRes?.data,
          };
        })
      );

      return enrichedIncidents;
    },
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (incident: IncidentInsert) => {
      const { data, error } = await supabase
        .from("incidentes")
        .insert(incident)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });
}
