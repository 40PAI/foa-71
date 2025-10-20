
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
import { FinanceForm } from "@/components/forms/FinanceForm";
import type { Tables } from "@/integrations/supabase/types";

interface FinanceModalProps {
  projectId: number;
  finance?: Tables<"financas">;
  trigger?: "button" | "edit";
}

export function FinanceModal({ projectId, finance, trigger = "button" }: FinanceModalProps) {
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
      Nova Despesa
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {TriggerComponent}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {finance ? "Editar Categoria Financeira" : "Nova Categoria Financeira"}
          </DialogTitle>
        </DialogHeader>
        <FinanceForm
          projectId={projectId}
          finance={finance}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
