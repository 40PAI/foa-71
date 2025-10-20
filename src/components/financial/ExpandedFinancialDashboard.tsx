import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IntegratedFinancialDashboard } from "@/components/IntegratedFinancialDashboard";
import { FinancialChartsSection } from "@/components/financial/FinancialChartsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, PieChart } from "lucide-react";

interface ExpandedFinancialDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
}

export function ExpandedFinancialDashboard({
  open,
  onOpenChange,
  projectId,
}: ExpandedFinancialDashboardProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Visão Financeira Detalhada
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Gráficos Detalhados
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 mt-4">
            <IntegratedFinancialDashboard projectId={projectId} />
          </TabsContent>
          
          <TabsContent value="charts" className="space-y-4 mt-4">
            <FinancialChartsSection projectId={projectId} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
