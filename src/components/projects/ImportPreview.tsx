import { ExcelProjectData } from "@/types/projectImport";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/formatters";

interface ImportPreviewProps {
  data: ExcelProjectData;
}

export function ImportPreview({ data }: ImportPreviewProps) {
  const { projeto, etapas, tarefas } = data;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Dados do Projeto</CardTitle>
          <CardDescription>Revise as informações antes de importar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome</p>
              <p className="text-sm font-semibold">{projeto.nome}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cliente</p>
              <p className="text-sm">{projeto.cliente}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Encarregado</p>
              <p className="text-sm">{projeto.encarregado}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge>{projeto.status}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Período</p>
              <p className="text-sm">{projeto.data_inicio} até {projeto.data_fim_prevista}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipo</p>
              <Badge variant="outline">{projeto.tipo_projeto}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Orçamento</p>
              <p className="text-sm font-semibold">{formatCurrency(projeto.orcamento)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Localização</p>
              <p className="text-sm">{projeto.municipio}, {projeto.provincia}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Etapas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{etapas.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {etapas.length} etapa(s) serão criadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tarefas.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {tarefas.length} tarefa(s) serão criadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(projeto.orcamento)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Limite: {formatCurrency(projeto.limite_aprovacao)}
            </p>
          </CardContent>
        </Card>
      </div>

      {etapas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Etapas a Importar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {etapas.slice(0, 5).map((etapa, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {etapa.numero_etapa}. {etapa.nome_etapa}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {etapa.responsavel_etapa} • {etapa.tipo_etapa}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {etapa.status_etapa}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(etapa.orcamento_etapa)}
                      </p>
                    </div>
                  </div>
                  {index < Math.min(4, etapas.length - 1) && <Separator />}
                </div>
              ))}
              {etapas.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  + {etapas.length - 5} etapa(s) adicional(is)
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {tarefas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Primeiras Tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tarefas.slice(0, 5).map((tarefa, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{tarefa.descricao}</p>
                      <p className="text-xs text-muted-foreground">
                        {tarefa.responsavel} • Prazo: {tarefa.prazo}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {tarefa.status}
                      </Badge>
                    </div>
                  </div>
                  {index < Math.min(4, tarefas.length - 1) && <Separator />}
                </div>
              ))}
              {tarefas.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  + {tarefas.length - 5} tarefa(s) adicional(is)
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
