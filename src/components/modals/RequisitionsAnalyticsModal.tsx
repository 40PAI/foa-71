import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DonutChart } from "@/components/charts/DonutChart";
import { useRequisitions } from "@/hooks/useRequisitions";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Clock, CheckCircle, ShoppingCart, FileText, Package } from "lucide-react";
import type { RequisicoesResumo } from "@/hooks/useDashboardGeral";

interface RequisitionsAnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisicoesResumo: RequisicoesResumo;
}

const STATUS_PENDENTES = ["Pendente", "Cotações", "Aprovação Qualidade", "Aprovação Direção"];
const STATUS_CONCLUIDOS = ["OC Gerada", "Recepcionado", "Liquidado"];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Pendente":
      return "bg-warning/20 text-warning dark:bg-warning/30";
    case "Cotações":
      return "bg-primary/20 text-primary dark:bg-primary/30";
    case "Aprovação Qualidade":
    case "Aprovação Direção":
      return "bg-secondary text-secondary-foreground";
    case "OC Gerada":
      return "bg-accent text-accent-foreground";
    case "Recepcionado":
      return "bg-chart-1/20 text-chart-1";
    case "Liquidado":
      return "bg-chart-1/30 text-chart-1";
    case "Rejeitado":
      return "bg-destructive/20 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function RequisitionsAnalyticsModal({ 
  open, 
  onOpenChange, 
  requisicoesResumo 
}: RequisitionsAnalyticsModalProps) {
  const { data: requisitions = [], isLoading } = useRequisitions();
  
  const chartData = [
    { name: "Pendentes", value: requisicoesResumo.pendentes, fill: "hsl(var(--warning))" },
    { name: "Em Aprovação", value: requisicoesResumo.aprovacao, fill: "hsl(var(--chart-2))" },
    { name: "Aprovadas", value: requisicoesResumo.aprovadas, fill: "hsl(var(--chart-1))" },
  ];

  const requisicoesEmProcesso = requisitions.filter(r => 
    STATUS_PENDENTES.includes(r.status_fluxo || "")
  );

  const requisicoesHistorico = requisitions.filter(r => 
    STATUS_CONCLUIDOS.includes(r.status_fluxo || "") || r.status_fluxo === "Rejeitado"
  );

  const renderRequisitionCard = (req: typeof requisitions[0]) => (
    <Card key={req.id} className="p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm">#{req.id}</span>
            <Badge className={getStatusColor(req.status_fluxo || "")}>
              {req.status_fluxo}
            </Badge>
            {req.urgencia_prioridade && (
              <Badge variant={req.urgencia_prioridade === "Alta" ? "destructive" : "outline"}>
                {req.urgencia_prioridade}
              </Badge>
            )}
          </div>
          
          <p className="font-medium truncate">
            {req.nome_comercial_produto || req.descricao_tecnica || "Sem descrição"}
          </p>
          
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
            {req.categoria_principal && (
              <span className="flex items-center gap-1">
                <Package className="h-3.5 w-3.5" />
                {req.categoria_principal}
              </span>
            )}
            {req.requisitante && (
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {req.requisitante}
              </span>
            )}
            {req.data_requisicao && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {format(new Date(req.data_requisicao), "dd/MM/yyyy", { locale: pt })}
              </span>
            )}
          </div>
          
          {(req as any).projeto?.nome && (
            <p className="text-xs text-muted-foreground mt-1">
              Projeto: {(req as any).projeto.nome}
            </p>
          )}
        </div>
        
        <div className="text-right shrink-0">
          <p className="font-bold text-lg">{formatCurrency(req.valor || 0)}</p>
          {req.quantidade_requisitada && (
            <p className="text-sm text-muted-foreground">
              {req.quantidade_requisitada} {req.unidade_medida || "un"}
            </p>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Compras & Requisições - Análise Detalhada
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Gráfico Expandido */}
          <Card className="p-4">
            <div className="h-[250px]">
              <DonutChart 
                data={chartData} 
                title={`Taxa de Aprovação: ${requisicoesResumo.taxa_aprovacao.toFixed(1)}%`} 
              />
            </div>
            
            {/* KPIs resumidos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold">{requisicoesResumo.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">{requisicoesResumo.pendentes}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{requisicoesResumo.aprovacao}</p>
                <p className="text-xs text-muted-foreground">Em Aprovação</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-chart-1">{requisicoesResumo.aprovadas}</p>
                <p className="text-xs text-muted-foreground">Aprovadas</p>
              </div>
            </div>
          </Card>

          {/* Tabs com Requisições */}
          <Tabs defaultValue="pendentes" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pendentes" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Em Processo ({requisicoesEmProcesso.length})
              </TabsTrigger>
              <TabsTrigger value="historico" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Histórico ({requisicoesHistorico.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pendentes" className="flex-1 overflow-hidden mt-4">
              <ScrollArea className="h-[280px] pr-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">A carregar requisições...</p>
                  </div>
                ) : requisicoesEmProcesso.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <CheckCircle className="h-12 w-12 text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground">Nenhuma requisição em processo</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requisicoesEmProcesso.map(renderRequisitionCard)}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="historico" className="flex-1 overflow-hidden mt-4">
              <ScrollArea className="h-[280px] pr-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">A carregar histórico...</p>
                  </div>
                ) : requisicoesHistorico.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground">Nenhuma requisição no histórico</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requisicoesHistorico.map(renderRequisitionCard)}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
