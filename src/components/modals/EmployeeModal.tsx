
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmployeeForm } from "@/components/forms/EmployeeForm";
import { useCreateEmployee } from "@/hooks/useEmployees";
import { useToast } from "@/hooks/use-toast";
import type { TablesInsert } from "@/integrations/supabase/types";

interface EmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeModal({ open, onOpenChange }: EmployeeModalProps) {
  const { toast } = useToast();
  const createEmployee = useCreateEmployee();

  const handleSubmit = async (data: TablesInsert<"colaboradores">) => {
    try {
      await createEmployee.mutateAsync(data);
      toast({
        title: "Colaborador criado",
        description: "O colaborador foi adicionado com sucesso.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar colaborador. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Colaborador</DialogTitle>
        </DialogHeader>
        <EmployeeForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={createEmployee.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
