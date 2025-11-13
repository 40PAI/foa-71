import { BaseModal } from "@/components/shared/BaseModal";
import { CashFlowMovementForm } from "@/components/forms/CashFlowMovementForm";
import { useCreateCashFlowMovement, useUpdateCashFlowMovement } from "@/hooks/useCashFlow";
import { CashFlowMovement } from "@/types/cashflow";

interface CashFlowMovementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  movement?: CashFlowMovement;
}

export function CashFlowMovementModal({
  open,
  onOpenChange,
  projectId,
  movement,
}: CashFlowMovementModalProps) {
  console.log('🔵 CashFlowMovementModal render', { open, projectId, movement });
  
  if (!projectId) {
    console.error('❌ projectId não fornecido ao CashFlowMovementModal');
  }
  
  const createMutation = useCreateCashFlowMovement();
  const updateMutation = useUpdateCashFlowMovement();

  const handleSubmit = async (data: any) => {
    const movementData = {
      ...data,
      projeto_id: projectId,
      responsavel_id: undefined, // Will be set automatically by auth context if needed
    };

    if (movement?.id) {
      await updateMutation.mutateAsync({ ...movementData, id: movement.id });
    } else {
      await createMutation.mutateAsync(movementData);
    }
    onOpenChange(false);
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={(newOpen) => {
        console.log('🟡 Modal onOpenChange', { newOpen });
        onOpenChange(newOpen);
      }}
      title={movement ? "Editar Movimento de Caixa" : "Novo Movimento de Caixa"}
      size="2xl"
    >
      <CashFlowMovementForm
        projectId={projectId}
        movement={movement}
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </BaseModal>
  );
}
