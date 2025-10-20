
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IncidentForm } from "@/components/forms/IncidentForm";
import { useCreateIncident } from "@/hooks/useIncidents";
import { useToast } from "@/hooks/use-toast";
import type { TablesInsert } from "@/integrations/supabase/types";

interface IncidentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incident?: any;
  mode: 'create' | 'edit';
}

export function IncidentModal({ open, onOpenChange, incident, mode }: IncidentModalProps) {
  const { toast } = useToast();
  const createIncident = useCreateIncident();

  const handleSubmit = async (data: TablesInsert<"incidentes">) => {
    try {
      if (mode === 'create') {
        await createIncident.mutateAsync(data);
        toast({
          title: "Incidente criado",
          description: "O incidente foi registado com sucesso.",
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar incidente. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg sm:text-xl">
            {mode === 'create' ? 'Novo Incidente' : 'Editar Incidente'}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          <IncidentForm
            incident={incident}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={createIncident.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
