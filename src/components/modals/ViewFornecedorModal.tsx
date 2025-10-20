import { BaseModal } from "@/components/shared/BaseModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { Fornecedor } from "@/types/contasCorrentes";

interface ViewFornecedorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fornecedor?: Fornecedor;
}

export function ViewFornecedorModal({
  open,
  onOpenChange,
  fornecedor,
}: ViewFornecedorModalProps) {
  if (!fornecedor) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "default";
      case "inativo":
        return "secondary";
      case "bloqueado":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const renderStars = (rating?: number | null) => {
    if (!rating) return <span className="text-muted-foreground">Não avaliado</span>;
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              rating >= star
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title="Detalhes do Fornecedor"
      size="lg"
      className="max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-4">
        {/* Informações Básicas */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{fornecedor.nome}</h3>
                {fornecedor.nif && (
                  <p className="text-sm text-muted-foreground">NIF: {fornecedor.nif}</p>
                )}
              </div>
              <Badge variant={getStatusColor(fornecedor.status)}>
                {fornecedor.status}
              </Badge>
            </div>

            {fornecedor.tipo_fornecedor && (
              <div>
                <span className="text-sm font-medium">Tipo: </span>
                <span className="text-sm text-muted-foreground capitalize">
                  {fornecedor.tipo_fornecedor}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contacto */}
        {(fornecedor.email || fornecedor.telefone) && (
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                📞 Contacto
              </h4>
              <div className="space-y-2">
                {fornecedor.email && (
                  <div>
                    <span className="text-sm font-medium">Email: </span>
                    <span className="text-sm text-muted-foreground">
                      {fornecedor.email}
                    </span>
                  </div>
                )}
                {fornecedor.telefone && (
                  <div>
                    <span className="text-sm font-medium">Telefone: </span>
                    <span className="text-sm text-muted-foreground">
                      {fornecedor.telefone}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Localização */}
        {(fornecedor.endereco || fornecedor.cidade || fornecedor.provincia) && (
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                📍 Localização
              </h4>
              <div className="space-y-2">
                {fornecedor.endereco && (
                  <div>
                    <span className="text-sm font-medium">Endereço: </span>
                    <span className="text-sm text-muted-foreground">
                      {fornecedor.endereco}
                    </span>
                  </div>
                )}
                <div className="flex gap-4">
                  {fornecedor.cidade && (
                    <div>
                      <span className="text-sm font-medium">Cidade: </span>
                      <span className="text-sm text-muted-foreground">
                        {fornecedor.cidade}
                      </span>
                    </div>
                  )}
                  {fornecedor.provincia && (
                    <div>
                      <span className="text-sm font-medium">Província: </span>
                      <span className="text-sm text-muted-foreground">
                        {fornecedor.provincia}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Classificação */}
        {(fornecedor.categoria_principal || fornecedor.recorrencia || fornecedor.avaliacao_qualidade) && (
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                🏷️ Classificação
              </h4>
              <div className="space-y-3">
                {fornecedor.categoria_principal && (
                  <div>
                    <span className="text-sm font-medium">Categoria Principal: </span>
                    <span className="text-sm text-muted-foreground">
                      {fornecedor.categoria_principal}
                    </span>
                  </div>
                )}
                {fornecedor.recorrencia && (
                  <div>
                    <span className="text-sm font-medium">Recorrência: </span>
                    <span className="text-sm text-muted-foreground capitalize">
                      {fornecedor.recorrencia}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium">Avaliação de Qualidade: </span>
                  <div className="mt-1">
                    {renderStars(fornecedor.avaliacao_qualidade)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Observações */}
        {fornecedor.observacoes && (
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                📝 Observações
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {fornecedor.observacoes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </div>
      </div>
    </BaseModal>
  );
}
