
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
import { MaterialArmazemForm } from "@/components/forms/MaterialArmazemForm";
import type { Tables } from "@/integrations/supabase/types";

interface MaterialArmazemModalProps {
  material?: Tables<"materiais_armazem">;
  trigger?: "button" | "edit";
}

export function MaterialArmazemModal({ material, trigger = "button" }: MaterialArmazemModalProps) {
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
      Novo Material
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
            {material ? "Editar Material" : "Novo Material do Armazém"}
          </DialogTitle>
        </DialogHeader>
        <MaterialArmazemForm
          material={material}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
