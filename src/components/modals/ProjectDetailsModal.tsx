
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { ProjectDetails } from "../ProjectDetails";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProjectDetailsModalProps {
  projectId: number;
  projectName: string;
}

export function ProjectDetailsModal({ projectId, projectName }: ProjectDetailsModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Ver detalhes completos">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Detalhes do Projeto: {projectName}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <ProjectDetails projectId={projectId} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
