import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CashFlowAreaChart } from "@/components/charts/CashFlowAreaChart";
import { CostCenterUtilizationChart } from "@/components/charts/CostCenterUtilizationChart";
import { SupplierBalanceTreemap } from "@/components/charts/SupplierBalanceTreemap";
import { TrendingUp, Building2, Users, Filter } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { Label } from "@/components/ui/label";

interface FinanceAnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FinanceAnalyticsModal({ open, onOpenChange }: FinanceAnalyticsModalProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const { data: projects } = useProjects();

  const handleProjectChange = (value: string) => {
    setSelectedProjectId(value === "all" ? undefined : Number(value));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análise Financeira Detalhada
          </DialogTitle>
        </DialogHeader>

        {/* Project Filter */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Filtrar por Projecto:</Label>
          <Select value={selectedProjectId?.toString() || "all"} onValueChange={handleProjectChange}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Todos os Projectos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Projectos</SelectItem>
              {projects?.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
            <CashFlowAreaChart 
              projectId={selectedProjectId} 
              months={12} 
              title={selectedProjectId ? "Fluxo de Caixa do Projecto" : "Fluxo de Caixa - Todos os Projectos"} 
            />
          </TabsContent>

          <TabsContent value="centros" className="mt-4">
            <CostCenterUtilizationChart 
              projectId={selectedProjectId}
              title={selectedProjectId ? "Utilização por Centro de Custo - Projecto" : "Utilização por Centro de Custo - Geral"} 
            />
          </TabsContent>

          <TabsContent value="fornecedores" className="mt-4">
            <SupplierBalanceTreemap 
              projectId={selectedProjectId}
              title={selectedProjectId ? "Saldos por Fornecedor - Projecto" : "Saldos por Fornecedor (Top 10)"} 
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
