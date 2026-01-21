import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaterialFlowChart } from "@/components/charts/MaterialFlowChart";
import { TopMaterialsChart } from "@/components/charts/TopMaterialsChart";
import { ConsumptionByProjectChart } from "@/components/charts/ConsumptionByProjectChart";
import { CriticalStockChart } from "@/components/charts/CriticalStockChart";
import { Package, TrendingUp, PieChart, AlertTriangle } from "lucide-react";

interface WarehouseAnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WarehouseAnalyticsModal({ open, onOpenChange }: WarehouseAnalyticsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Package className="h-5 w-5" />
            Análise de Armazém Detalhada
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="fluxo" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="fluxo" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Fluxo
            </TabsTrigger>
            <TabsTrigger value="top" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Top Materiais
            </TabsTrigger>
            <TabsTrigger value="consumo" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Por Projecto
            </TabsTrigger>
            <TabsTrigger value="critico" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Stock Crítico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fluxo" className="mt-4">
            <MaterialFlowChart days={30} title="Fluxo de Materiais - Últimos 30 Dias" />
          </TabsContent>

          <TabsContent value="top" className="mt-4">
            <TopMaterialsChart limit={10} title="Top 10 Materiais Mais Movimentados" />
          </TabsContent>

          <TabsContent value="consumo" className="mt-4">
            <ConsumptionByProjectChart title="Consumo de Materiais por Projecto" />
          </TabsContent>

          <TabsContent value="critico" className="mt-4">
            <CriticalStockChart title="Materiais em Stock Crítico" />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
