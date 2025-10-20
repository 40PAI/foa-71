
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Edit } from "lucide-react";
import { RequisitionForm } from "@/components/forms/RequisitionForm";
import type { Tables } from "@/integrations/supabase/types";

interface RequisitionModalProps {
  projectId: number;
  requisition?: Tables<"requisicoes"> & { material?: Tables<"materiais"> };
  trigger?: "button" | "edit";
}

export function RequisitionModal({ projectId, requisition, trigger = "button" }: RequisitionModalProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  const TriggerComponent = trigger === "edit" ? (
    <Button variant="ghost" size="sm">
      <Edit className="h-4 w-4" />
    </Button>
  ) : (
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Nova Requisição
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {TriggerComponent}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {requisition ? "Editar Requisição" : "Nova Requisição"}
          </DialogTitle>
        </DialogHeader>
        <RequisitionForm
          projectId={projectId}
          requisition={requisition}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
