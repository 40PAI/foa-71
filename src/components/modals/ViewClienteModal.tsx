import { BaseModal } from "@/components/shared/BaseModal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building2, Mail, Phone, MapPin, FileText, Calendar } from "lucide-react";
import type { Cliente } from "@/types/contasCorrentes";
import { formatDate } from "@/lib/helpers";

interface ViewClienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente;
}

export function ViewClienteModal({ open, onOpenChange, cliente }: ViewClienteModalProps) {
  if (!cliente) return null;

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: "default",
      inativo: "secondary",
      suspenso: "destructive",
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title="Detalhes do Cliente"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header com Status */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{cliente.nome}</h2>
            {cliente.nif && (
              <p className="text-sm text-muted-foreground mt-1">NIF: {cliente.nif}</p>
            )}
          </div>
          {getStatusBadge(cliente.status)}
        </div>

        <Separator />

        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cliente.tipo_cliente && (
              <div className="grid grid-cols-3">
                <span className="text-sm text-muted-foreground">Tipo:</span>
                <span className="col-span-2 text-sm font-medium capitalize">
                  {cliente.tipo_cliente.replace("_", " ")}
                </span>
              </div>
            )}
            {cliente.created_at && (
              <div className="grid grid-cols-3">
                <span className="text-sm text-muted-foreground">Cadastro:</span>
                <span className="col-span-2 text-sm">{formatDate(cliente.created_at)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-4 w-4" />
              Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cliente.email && (
              <div className="grid grid-cols-3">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  Email:
                </span>
                <span className="col-span-2 text-sm">{cliente.email}</span>
              </div>
            )}
            {cliente.telefone && (
              <div className="grid grid-cols-3">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  Telefone:
                </span>
                <span className="col-span-2 text-sm">{cliente.telefone}</span>
              </div>
            )}
            {!cliente.email && !cliente.telefone && (
              <p className="text-sm text-muted-foreground">Sem informações de contacto</p>
            )}
          </CardContent>
        </Card>

        {/* Localização */}
        {(cliente.endereco || cliente.cidade || cliente.provincia) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Localização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cliente.endereco && (
                <div className="grid grid-cols-3">
                  <span className="text-sm text-muted-foreground">Endereço:</span>
                  <span className="col-span-2 text-sm">{cliente.endereco}</span>
                </div>
              )}
              {cliente.cidade && (
                <div className="grid grid-cols-3">
                  <span className="text-sm text-muted-foreground">Cidade:</span>
                  <span className="col-span-2 text-sm">{cliente.cidade}</span>
                </div>
              )}
              {cliente.provincia && (
                <div className="grid grid-cols-3">
                  <span className="text-sm text-muted-foreground">Província:</span>
                  <span className="col-span-2 text-sm">{cliente.provincia}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Observações */}
        {cliente.observacoes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Observações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{cliente.observacoes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </BaseModal>
  );
}
