import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useMonthlyProjectStatus } from "@/hooks/useMonthlyProjectStatus";
import { useMonthlyEmployeeAllocations } from "@/hooks/useMonthlyEmployeeAllocations";
import { MonthlyManagementModal } from "@/components/modals/MonthlyManagementModal";

interface GeneralCalendarProps {
  onProjectSelect?: (projectId: number, month: number) => void;
}

export const GeneralCalendar: React.FC<GeneralCalendarProps> = ({ onProjectSelect }) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<{ id: number; name: string } | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  
  const { data: projects } = useProjects();
  const { getProjectStatusForMonth } = useMonthlyProjectStatus();
  const { getEmployeeCountForMonth } = useMonthlyEmployeeAllocations();

  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "ativo":
        return "bg-success/10 text-success border-success/20 hover:bg-success/20";
      case "pausado":
        return "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20";
      case "concluido":
        return "bg-muted/20 text-muted-foreground border-muted/30 hover:bg-muted/30";
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20 hover:bg-muted/20";
    }
  };

  const handleCellClick = (projectId: number, monthIndex: number, projectName: string) => {
    setSelectedProject({ id: projectId, name: projectName });
    setSelectedMonth(monthIndex + 1); // monthIndex is 0-based, but we want 1-based for modal
    setModalOpen(true);
    
    if (onProjectSelect) {
      onProjectSelect(projectId, monthIndex + 1);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Calendário Geral - {selectedYear}</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedYear(selectedYear - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-4 py-2">{selectedYear}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedYear(selectedYear + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full border-collapse border border-border select-none">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-3 text-left font-medium border-r border-border sticky left-0 bg-background backdrop-blur-sm shadow-lg min-w-[200px] z-20">
                    Projeto
                  </th>
                  {months.map((month, index) => (
                    <th key={month} className="p-3 text-center font-medium border-r border-border min-w-[100px] whitespace-nowrap">
                      {month}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects?.map((project) => (
                  <tr key={project.id} className="border-b border-border/50">
                    <td className="p-3 font-medium text-sm border-r border-border/50 bg-background backdrop-blur-sm shadow-lg sticky left-0 min-w-[200px] z-20 whitespace-nowrap">
                      {project.nome}
                    </td>
                    {months.map((month, monthIndex) => {
                      const status = getProjectStatusForMonth(project.id, monthIndex + 1, selectedYear);
                      const employeeCount = getEmployeeCountForMonth(project.id, monthIndex + 1, selectedYear);
                      
                      return (
                        <td 
                          key={monthIndex} 
                          className="p-2 text-center border-r border-border/50 cursor-pointer transition-colors select-none"
                          onClick={() => handleCellClick(project.id, monthIndex, project.nome)}
                          onDragStart={(e) => e.preventDefault()}
                        >
                          <div className={`p-2 rounded border text-xs font-medium transition-colors whitespace-nowrap ${getStatusColor(status)}`}>
                            <div className="capitalize">{status}</div>
                            <div className="text-xs opacity-75 mt-1">{employeeCount} func.</div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <div className="px-6 pb-4">
          <p className="text-sm text-muted-foreground">
            Clique numa célula para gerir o status e colaboradores do projeto no mês específico.
          </p>
        </div>
      </Card>

      <MonthlyManagementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        projectId={selectedProject?.id || null}
        month={selectedMonth}
        year={selectedYear}
        projectName={selectedProject?.name}
      />
    </div>
  );
};