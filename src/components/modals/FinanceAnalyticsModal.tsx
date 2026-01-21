import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CashFlowAreaChart } from "@/components/charts/CashFlowAreaChart";
import { CostCenterUtilizationChart } from "@/components/charts/CostCenterUtilizationChart";
import { SupplierBalanceTreemap } from "@/components/charts/SupplierBalanceTreemap";
import { TrendingUp, Building2, Users } from "lucide-react";

interface FinanceAnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FinanceAnalyticsModal({ open, onOpenChange }: FinanceAnalyticsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análise Financeira Detalhada
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="fluxo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fluxo" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Fluxo de Caixa
            </TabsTrigger>
            <TabsTrigger value="centros" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Centros de Custo
            </TabsTrigger>
            <TabsTrigger value="fornecedores" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Fornecedores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fluxo" className="mt-4">
            <CashFlowAreaChart months={12} title="Fluxo de Caixa - Últimos 12 Meses" />
          </TabsContent>

          <TabsContent value="centros" className="mt-4">
            <CostCenterUtilizationChart title="Utilização por Centro de Custo" />
          </TabsContent>

          <TabsContent value="fornecedores" className="mt-4">
            <SupplierBalanceTreemap title="Saldos por Fornecedor (Top 10)" />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
