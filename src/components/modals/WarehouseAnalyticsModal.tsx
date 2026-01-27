import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaterialFlowChart } from "@/components/charts/MaterialFlowChart";
import { TopMaterialsChart } from "@/components/charts/TopMaterialsChart";
import { ConsumptionByProjectChart } from "@/components/charts/ConsumptionByProjectChart";
import { CriticalStockChart } from "@/components/charts/CriticalStockChart";
import { Package, TrendingUp, PieChart, AlertTriangle, Calendar } from "lucide-react";

interface WarehouseAnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PERIOD_OPTIONS = [
  { value: "30", label: "Últimos 30 dias" },
  { value: "60", label: "Últimos 60 dias" },
  { value: "90", label: "Últimos 90 dias" },
  { value: "180", label: "Últimos 6 meses" },
  { value: "365", label: "Último ano" },
];

export function WarehouseAnalyticsModal({ open, onOpenChange }: WarehouseAnalyticsModalProps) {
  const [selectedDays, setSelectedDays] = useState("90");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Análise de Armazém Detalhada
            </DialogTitle>
            
            {/* Period selector */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedDays} onValueChange={setSelectedDays}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="fluxo" className="w-full flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
            <TabsTrigger value="fluxo" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Fluxo</span>
            </TabsTrigger>
            <TabsTrigger value="top" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Top Materiais</span>
            </TabsTrigger>
            <TabsTrigger value="consumo" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Por Projecto</span>
            </TabsTrigger>
            <TabsTrigger value="critico" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Stock Crítico</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="fluxo" className="mt-0 h-full">
              <MaterialFlowChart 
                days={parseInt(selectedDays)} 
                title={`Fluxo de Materiais - ${PERIOD_OPTIONS.find(o => o.value === selectedDays)?.label}`} 
              />
            </TabsContent>

            <TabsContent value="top" className="mt-0 h-full">
              <TopMaterialsChart limit={10} title="Top 10 Materiais Mais Movimentados" />
            </TabsContent>

            <TabsContent value="consumo" className="mt-0 h-full">
              <ConsumptionByProjectChart title="Consumo de Materiais por Projecto" />
            </TabsContent>

            <TabsContent value="critico" className="mt-0 h-full">
              <CriticalStockChart title="Materiais em Stock Crítico" />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
