import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectSelector } from "@/components/ProjectSelector";
import { WeeklyTaskView } from "@/components/WeeklyTaskView";
import { TaskModal } from "@/components/modals/TaskModal";

export default function WeeklyTasksPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tarefas Semanais</h1>
          <p className="text-muted-foreground">
            Gerencie tarefas organizadas por semana do projeto
          </p>
        </div>
        {selectedProjectId && (
          <Button onClick={() => setIsTaskModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecionar Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectSelector
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
            placeholder="Selecione um projeto para ver as tarefas semanais..."
          />
        </CardContent>
      </Card>

      {selectedProjectId && (
        <WeeklyTaskView projectId={Number(selectedProjectId)} />
      )}

      <TaskModal
        open={isTaskModalOpen}
        onOpenChange={setIsTaskModalOpen}
      />
    </div>
  );
}