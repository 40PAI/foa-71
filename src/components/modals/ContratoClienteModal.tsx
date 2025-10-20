import { BaseModal } from "@/components/shared/BaseModal";
import { ContratoClienteForm } from "@/components/forms/ContratoClienteForm";
import { useCreateContratoCliente, useUpdateContratoCliente } from "@/hooks/useClientes";
import { toast } from "sonner";
import type { ContratoCliente } from "@/types/contasCorrentes";

interface ContratoClienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contrato?: ContratoCliente;
  projectId?: number;
}

export function ContratoClienteModal({
  open,
  onOpenChange,
  contrato,
  projectId,
}: ContratoClienteModalProps) {
  const createMutation = useCreateContratoCliente();
  const updateMutation = useUpdateContratoCliente();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (data: any) => {
    try {
      if (contrato) {
        await updateMutation.mutateAsync({
          id: contrato.id,
          ...data,
        });
        toast.success("Contrato atualizado com sucesso!");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Contrato criado com sucesso!");
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar contrato:", error);
      toast.error(contrato ? "Erro ao atualizar contrato" : "Erro ao criar contrato");
    }
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={contrato ? "Editar Contrato de Cliente" : "Novo Contrato de Cliente"}
      size="xl"
    >
      <ContratoClienteForm
        contrato={contrato}
        projectId={projectId}
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
        isLoading={isLoading}
      />
    </BaseModal>
  );
}
