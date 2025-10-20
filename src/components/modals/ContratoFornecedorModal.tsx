import { BaseModal } from "@/components/shared/BaseModal";
import { ContratoFornecedorForm } from "@/components/forms/ContratoFornecedorForm";
import { useCreateContratoFornecedor, useUpdateContratoFornecedor } from "@/hooks/useFornecedores";

interface ContratoFornecedorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contrato?: any;
  projectId?: number;
}

export function ContratoFornecedorModal({
  open,
  onOpenChange,
  contrato,
  projectId,
}: ContratoFornecedorModalProps) {
  const createMutation = useCreateContratoFornecedor();
  const updateMutation = useUpdateContratoFornecedor();

  const isEditing = !!contrato?.id;

  const handleSubmit = async (data: any) => {
    if (isEditing) {
      await updateMutation.mutateAsync({ id: contrato.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
    onOpenChange(false);
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar Contrato de Fornecedor" : "Novo Contrato de Fornecedor"}
      size="xl"
    >
      <ContratoFornecedorForm
        contrato={contrato}
        projectId={projectId}
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
      />
    </BaseModal>
  );
}
