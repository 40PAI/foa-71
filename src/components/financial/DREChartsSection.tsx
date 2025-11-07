import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DREMonthlyEvolutionChart } from "./DREMonthlyEvolutionChart";
import { DRECustomPeriodView } from "./DRECustomPeriodView";
import { BarChart3, Calendar } from "lucide-react";

interface DREChartsSectionProps {
  projectId: number;
}

export function DREChartsSection({ projectId }: DREChartsSectionProps) {
  return (
    <Tabs defaultValue="evolucao" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="evolucao" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Evolução Mensal
        </TabsTrigger>
        <TabsTrigger value="periodo" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Período Customizado
        </TabsTrigger>
      </TabsList>

      <TabsContent value="evolucao" className="space-y-4 mt-6">
        <DREMonthlyEvolutionChart projectId={projectId} />
      </TabsContent>

      <TabsContent value="periodo" className="space-y-4 mt-6">
        <DRECustomPeriodView projectId={projectId} />
      </TabsContent>
    </Tabs>
  );
}
