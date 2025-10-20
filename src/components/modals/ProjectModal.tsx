
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
import { ProjectForm } from "@/components/forms/ProjectForm";
import type { Tables } from "@/integrations/supabase/types";

interface ProjectModalProps {
  project?: Tables<"projetos">;
  trigger?: "button" | "edit";
}

export function ProjectModal({ project, trigger = "button" }: ProjectModalProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  const TriggerComponent = trigger === "edit" ? (
    <Button variant="ghost" size="sm" title="Editar">
      <Edit className="h-4 w-4" />
    </Button>
  ) : (
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Novo Projeto
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
            {project ? "Editar Projeto" : "Novo Projeto"}
          </DialogTitle>
        </DialogHeader>
        <ProjectForm
          project={project}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
