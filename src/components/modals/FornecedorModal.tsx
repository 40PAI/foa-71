import { useState } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { FornecedorForm } from "@/components/forms/FornecedorForm";
import {
  useCreateFornecedor,
  useUpdateFornecedor,
} from "@/hooks/useFornecedores";
import type { Fornecedor } from "@/types/contasCorrentes";

interface FornecedorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fornecedor?: Fornecedor;
}

export function FornecedorModal({
  open,
  onOpenChange,
  fornecedor,
}: FornecedorModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createFornecedor = useCreateFornecedor();
  const updateFornecedor = useUpdateFornecedor();

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (fornecedor?.id) {
        await updateFornecedor.mutateAsync({
          id: fornecedor.id,
          ...data,
        });
      } else {
        await createFornecedor.mutateAsync(data);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar fornecedor:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={fornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}
      size="xl"
      className="max-h-[90vh] overflow-y-auto"
    >
      <FornecedorForm
        fornecedor={fornecedor}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </BaseModal>
  );
}
