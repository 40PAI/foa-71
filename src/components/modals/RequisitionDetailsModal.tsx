import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatters";
import { Calendar, User, Package, FileText, AlertCircle, Clock } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface RequisitionDetailsModalProps {
  requisition: Tables<"requisicoes"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequisitionDetailsModal({ 
  requisition, 
  open, 
  onOpenChange 
}: RequisitionDetailsModalProps) {
  if (!requisition) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente': return 'bg-gray-100 text-gray-800';
      case 'Cotações': return 'bg-blue-100 text-blue-800';
      case 'Aprovação Qualidade': return 'bg-yellow-100 text-yellow-800';
      case 'Aprovação Direção': return 'bg-orange-100 text-orange-800';
      case 'OC Gerada': return 'bg-green-100 text-green-800';
      case 'Recepcionado': return 'bg-teal-100 text-teal-800';
      case 'Liquidado': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalhes da Requisição REQ-{requisition.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status e Prioridade */}
          <div className="flex gap-4">
            <Badge className={getStatusColor(requisition.status_fluxo)}>
              {requisition.status_fluxo}
            </Badge>
            <Badge className={getUrgencyColor(requisition.urgencia_prioridade || 'Média')}>
              Urgência: {requisition.urgencia_prioridade || 'Média'}
            </Badge>
          </div>

          {/* Informações do Produto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Package className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">Produto</p>
                  <p className="text-sm text-muted-foreground">
                    {requisition.nome_comercial_produto || 'N/A'}
                  </p>
                  {requisition.codigo_produto && (
                    <p className="text-xs text-muted-foreground">
                      Código: {requisition.codigo_produto}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">Requisitante</p>
                  <p className="text-sm text-muted-foreground">{requisition.requisitante}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">Data da Requisição</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(requisition.data_requisicao).toLocaleDateString('pt-PT')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="font-medium">Categoria</p>
                <Badge variant="outline">
                  {requisition.categoria_principal || 'N/A'}
                </Badge>
                {requisition.subcategoria && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {requisition.subcategoria}
                  </p>
                )}
              </div>

              <div>
                <p className="font-medium">Quantidade</p>
                <p className="text-sm text-muted-foreground">
                  {requisition.quantidade_requisitada || 1} {requisition.unidade_medida || 'un'}
                </p>
                {requisition.valor_unitario && (
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(requisition.valor_unitario)}/un
                  </p>
                )}
              </div>

              <div>
                <p className="font-medium">Valor Total</p>
                <p className="text-lg font-semibold text-primary">
                  {formatCurrency(requisition.valor || 0)}
                </p>
                {requisition.valor_liquido && requisition.valor_liquido !== requisition.valor && (
                  <p className="text-xs text-muted-foreground">
                    Líquido: {formatCurrency(requisition.valor_liquido)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Fornecedor e Prazos */}
          {(requisition.fornecedor_preferencial || requisition.data_limite || requisition.prazo_limite_dias) && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Prazos e Fornecedor
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requisition.fornecedor_preferencial && (
                  <div>
                    <p className="font-medium">Fornecedor Preferencial</p>
                    <p className="text-sm text-muted-foreground">
                      {requisition.fornecedor_preferencial}
                    </p>
                  </div>
                )}
                
                {(requisition.data_limite || requisition.prazo_limite_dias) && (
                  <div>
                    <p className="font-medium">Prazo Limite</p>
                    {requisition.data_limite && (
                      <p className="text-sm text-muted-foreground">
                        {new Date(requisition.data_limite).toLocaleDateString('pt-PT')}
                      </p>
                    )}
                    {requisition.prazo_limite_dias && (
                      <p className="text-xs text-muted-foreground">
                        {requisition.prazo_limite_dias} dias
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Descrição Técnica e Observações */}
          {(requisition.descricao_tecnica || requisition.observacoes) && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Detalhes Adicionais
              </h4>
              {requisition.descricao_tecnica && (
                <div className="mb-3">
                  <p className="font-medium">Descrição Técnica</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {requisition.descricao_tecnica}
                  </p>
                </div>
              )}
              {requisition.observacoes && (
                <div>
                  <p className="font-medium">Observações</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {requisition.observacoes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Informações Financeiras */}
          {(requisition.percentual_imposto || requisition.valor_imposto || 
            requisition.percentual_desconto || requisition.valor_desconto) && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Informações Financeiras</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {(requisition.percentual_imposto || requisition.valor_imposto) && (
                  <div>
                    <p className="font-medium">Impostos</p>
                    {requisition.percentual_imposto && (
                      <p className="text-muted-foreground">
                        {requisition.percentual_imposto}%
                      </p>
                    )}
                    {requisition.valor_imposto && (
                      <p className="text-muted-foreground">
                        {formatCurrency(requisition.valor_imposto)}
                      </p>
                    )}
                  </div>
                )}
                
                {(requisition.percentual_desconto || requisition.valor_desconto) && (
                  <div>
                    <p className="font-medium">Descontos</p>
                    {requisition.percentual_desconto && (
                      <p className="text-muted-foreground">
                        {requisition.percentual_desconto}%
                      </p>
                    )}
                    {requisition.valor_desconto && (
                      <p className="text-muted-foreground">
                        {formatCurrency(requisition.valor_desconto)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}