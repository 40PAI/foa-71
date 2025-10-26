import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/utils/formatters";
import type { ProjetoLista } from "@/hooks/useDashboardGeral";
import { cn } from "@/lib/utils";

interface DashboardProjetosSectionProps {
  projetos: ProjetoLista[];
}

const statusColors = {
  "Em Andamento": "bg-blue-500",
  "Pausado": "bg-yellow-500",
  "Concluído": "bg-green-500",
  "Atrasado": "bg-red-500",
  "Planeado": "bg-gray-500",
  "Cancelado": "bg-gray-700"
};

const statusFinanceiroColors = {
  verde: "text-green-600",
  amarelo: "text-yellow-600",
  vermelho: "text-red-600"
};

export function DashboardProjetosSection({ projetos }: DashboardProjetosSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-responsive-xl">🏗️ Projetos - Visão Rápida</CardTitle>
      </CardHeader>
      <CardContent>
        {projetos.length > 0 ? (
          <div className="space-y-3">
            {projetos.map((projeto) => {
              const percentualGasto = projeto.orcamento > 0 
                ? ((projeto.gasto / projeto.orcamento) * 100)
                : 0;

              return (
                <div key={projeto.id} className="p-4 border rounded-lg bg-card space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{projeto.nome}</h3>
                      <p className="text-xs text-muted-foreground truncate">{projeto.cliente}</p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={cn("shrink-0", statusColors[projeto.status as keyof typeof statusColors])}
                    >
                      {projeto.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Orçamento</p>
                      <p className="font-medium">{formatCurrency(projeto.orcamento)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gasto</p>
                      <p className={cn(
                        "font-medium",
                        statusFinanceiroColors[projeto.status_financeiro]
                      )}>
                        {formatCurrency(projeto.gasto)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progresso Físico</span>
                      <span className="font-medium">{projeto.avanco_fisico}%</span>
                    </div>
                    <Progress value={projeto.avanco_fisico} className="h-1.5" />
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground pt-1">
                    <span>Início: {new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}</span>
                    <span>Fim: {new Date(projeto.data_fim_prevista).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Nenhum projeto disponível para visualização
          </p>
        )}
      </CardContent>
    </Card>
  );
}
