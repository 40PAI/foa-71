import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmployeeForm } from "@/components/forms/EmployeeForm";
import { useUpdateEmployee } from "@/hooks/useEmployees";
import { useToast } from "@/hooks/use-toast";
import type { TablesInsert } from "@/integrations/supabase/types";

interface EditEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: any;
}

export function EditEmployeeModal({ open, onOpenChange, employee }: EditEmployeeModalProps) {
  const { toast } = useToast();
  const updateEmployee = useUpdateEmployee();

  const handleSubmit = async (data: TablesInsert<"colaboradores">) => {
    if (!employee?.id) return;
    
    try {
      await updateEmployee.mutateAsync({ id: employee.id, ...data });
      toast({
        title: "Colaborador atualizado",
        description: "As informações do colaborador foram atualizadas com sucesso.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar colaborador. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Editar Colaborador{employee ? `: ${employee.nome}` : ''}
          </DialogTitle>
        </DialogHeader>
        <EmployeeForm
          initialData={employee}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={updateEmployee.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}