
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
import { PatrimonyForm } from "@/components/forms/PatrimonyForm";
import type { Tables } from "@/integrations/supabase/types";

interface PatrimonyModalProps {
  patrimony?: Tables<"patrimonio">;
  trigger?: "button" | "edit";
}

export function PatrimonyModal({ patrimony, trigger = "button" }: PatrimonyModalProps) {
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
      Novo Equipamento
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
            {patrimony ? "Editar Equipamento" : "Novo Equipamento"}
          </DialogTitle>
        </DialogHeader>
        <PatrimonyForm
          patrimony={patrimony}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
