import { BaseModal } from "@/components/shared/BaseModal";
import { ClienteForm } from "@/components/forms/ClienteForm";
import { useCreateCliente, useUpdateCliente } from "@/hooks/useClientes";
import type { Cliente } from "@/types/contasCorrentes";

interface ClienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente;
  projectId?: number;
}

export function ClienteModal({ open, onOpenChange, cliente, projectId }: ClienteModalProps) {
  const createMutation = useCreateCliente();
  const updateMutation = useUpdateCliente();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (data: any) => {
    try {
      // Remove tipo_cliente se for string vazia para evitar erro de constraint
      const cleanedData = {
        ...data,
        tipo_cliente: data.tipo_cliente === "" ? null : data.tipo_cliente,
      };
      
      if (cliente?.id) {
        await updateMutation.mutateAsync({ id: cliente.id, ...cleanedData });
      } else {
        await createMutation.mutateAsync(cleanedData);
      }
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hooks via toast
      console.error("Error saving cliente:", error);
    }
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={cliente ? "Editar Cliente" : "Novo Cliente"}
      size="xl"
    >
      <ClienteForm
        cliente={cliente}
        projectId={projectId}
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
        isLoading={isLoading}
      />
    </BaseModal>
  );
}
