import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StageComparisonChart } from '@/components/charts/StageComparisonChart';
import { TimelineComparisonChart } from '@/components/charts/TimelineComparisonChart';
import { StageCostsPieChart } from '@/components/charts/StageCostsPieChart';
import { BarChart3, Clock, PieChart } from 'lucide-react';

interface FinancialChartsSectionProps {
  projectId: number | null;
}

export function FinancialChartsSection({ projectId }: FinancialChartsSectionProps) {
  return (
    <Tabs defaultValue="custos" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="custos" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Análise de Custos
        </TabsTrigger>
        <TabsTrigger value="prazos" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Análise Temporal
        </TabsTrigger>
        <TabsTrigger value="distribuicao" className="flex items-center gap-2">
          <PieChart className="h-4 w-4" />
          Distribuição por Etapa
        </TabsTrigger>
      </TabsList>

      <TabsContent value="custos" className="space-y-4 mt-6">
        <StageComparisonChart projectId={projectId} />
      </TabsContent>

      <TabsContent value="prazos" className="space-y-4 mt-6">
        <TimelineComparisonChart projectId={projectId} />
      </TabsContent>

      <TabsContent value="distribuicao" className="space-y-4 mt-6">
        <StageCostsPieChart projectId={projectId} />
      </TabsContent>
    </Tabs>
  );
}
