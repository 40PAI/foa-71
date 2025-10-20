
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmployeeAllocationForm } from "@/components/forms/EmployeeAllocationForm";
import { useEmployeeAllocations } from "@/hooks/useEmployeeAllocations";
import { useToast } from "@/hooks/use-toast";

interface EmployeeAllocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: any;
  preselectedProjectId?: number;
}

export function EmployeeAllocationModal({ open, onOpenChange, employee, preselectedProjectId }: EmployeeAllocationModalProps) {
  const { toast } = useToast();
  const { create: createAllocation } = useEmployeeAllocations();

  const handleSuccess = () => {
    toast({
      title: "Colaborador alocado",
      description: "O colaborador foi alocado ao projeto com sucesso.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Alocar Colaborador{employee ? `: ${employee.nome}` : ''}
          </DialogTitle>
        </DialogHeader>
        <EmployeeAllocationForm
          employee={employee}
          preselectedProjectId={preselectedProjectId}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
