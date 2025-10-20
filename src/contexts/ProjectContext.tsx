
import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { useProjectDetails } from "@/hooks/useProjectDetails";

interface ProjectDerivedState {
  totalFinances: number;
  totalEmployees: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  physicalProgress: number;
  financialProgress: number;
  timeProgress: number;
  isOverBudget: boolean;
  isOverdue: boolean;
  daysRemaining: number;
  budgetRemaining: number;
}

interface ProjectContextType {
  selectedProjectId: number | null;
  setSelectedProjectId: (id: number | null) => void;
  projectData: any;
  derivedState: ProjectDerivedState | null;
  isProjectSelected: boolean;
  resetProject: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  
  // Fetch project data when selected
  const { data: projectData } = useProjectDetails(selectedProjectId || undefined);

  // Derived state calculations with memoization
  const derivedState = useMemo((): ProjectDerivedState | null => {
    if (!projectData || !selectedProjectId) return null;

    const project = projectData.project;
    if (!project) return null;

    // Use simple fallback values since the exact structure may vary
    const totalFinances = 0; // Will be calculated from actual data
    const totalEmployees = 0; // Will be calculated from actual data  
    const totalTasks = 0; // Will be calculated from actual data
    const completedTasks = 0; // Will be calculated from actual data
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const physicalProgress = project.avanco_fisico || completionRate;
    const financialProgress = project.avanco_financeiro || 0;
    const timeProgress = project.avanco_tempo || 0;

    const totalBudget = project.orcamento || 0;
    const totalSpent = project.gasto || 0;
    const budgetRemaining = totalBudget - totalSpent;
    const isOverBudget = totalSpent > totalBudget;

    const endDate = project.data_fim_prevista ? new Date(project.data_fim_prevista) : null;
    const currentDate = new Date();
    const daysRemaining = endDate ? Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const isOverdue = daysRemaining < 0;

    return {
      totalFinances,
      totalEmployees,
      totalTasks,
      completedTasks,
      completionRate,
      physicalProgress,
      financialProgress,
      timeProgress,
      isOverBudget,
      isOverdue,
      daysRemaining,
      budgetRemaining,
    };
  }, [projectData, selectedProjectId]);

  const isProjectSelected = selectedProjectId !== null;
  
  const resetProject = () => {
    setSelectedProjectId(null);
  };

  return (
    <ProjectContext.Provider value={{
      selectedProjectId,
      setSelectedProjectId,
      projectData,
      derivedState,
      isProjectSelected,
      resetProject,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
}

// Safe version that returns null if context is not available
export function useProjectContextSafe() {
  const context = useContext(ProjectContext);
  return context || null;
}
