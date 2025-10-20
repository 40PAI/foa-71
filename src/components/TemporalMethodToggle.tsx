import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingUp, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUpdateProjectMetrics } from "@/hooks/useUpdateProjectMetrics";

interface TemporalMethodToggleProps {
  projectId: number;
  currentMethod: string;
  onMethodChange?: (method: string) => void;
}

export function TemporalMethodToggle({ 
  projectId, 
  currentMethod, 
  onMethodChange 
}: TemporalMethodToggleProps) {
  const [method, setMethod] = useState(currentMethod || "linear");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const updateMetrics = useUpdateProjectMetrics();

  const handleMethodChange = async (newMethod: string) => {
    setIsUpdating(true);
    try {
      // Update the project's temporal calculation method
      const { error } = await supabase
        .from("projetos")
        .update({ metodo_calculo_temporal: newMethod })
        .eq("id", projectId);

      if (error) throw error;

      setMethod(newMethod);
      onMethodChange?.(newMethod);

      // Recalculate metrics with new method
      updateMetrics.mutate(projectId);

      toast({
        title: "Método Atualizado",
        description: `Método de cálculo temporal alterado para ${newMethod === 'linear' ? 'Linear' : 'PPC'}.`,
      });
    } catch (error) {
      console.error("Error updating temporal method:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar método de cálculo temporal.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          Método de Cálculo Temporal
        </CardTitle>
        <CardDescription className="text-xs">
          Escolha como calcular o avanço temporal do projeto
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="method-select" className="text-xs">Método:</Label>
          <Select
            value={method}
            onValueChange={handleMethodChange}
            disabled={isUpdating}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Selecione o método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linear">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  Linear (Tempo Decorrido)
                </div>
              </SelectItem>
              <SelectItem value="ppc">
                <div className="flex items-center gap-2">
                  <Info className="h-3 w-3" />
                  PPC (Programação Cumprida)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          {method === "linear" ? (
            <div className="space-y-1">
              <p><strong>Método Linear:</strong></p>
              <p>• Calcula baseado no tempo decorrido vs total</p>
              <p>• Fórmula: (Dias passados / Total de dias) × 100</p>
              <p>• Simples, mas não considera execução real</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p><strong>Método PPC (Lean Construction):</strong></p>
              <p>• Média dos PPCs semanais do projeto</p>
              <p>• Cada semana: (Tarefas no prazo / Total tarefas) × 100</p>
              <p>• Reflete qualidade da programação e execução</p>
              <p>• Meta: ≥80% (Bom), 60-79% (Médio), &lt;60% (Crítico)</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}