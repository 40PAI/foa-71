import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Edit, Eye, UserPlus } from "lucide-react";

interface Employee {
  id: number;
  nome: string;
  cargo: string;
  categoria: string;
  tipo_colaborador?: string;
  custo_hora: number;
  hora_entrada?: string;
  hora_saida?: string;
  numero_funcional?: string;
}

interface EmployeeListViewProps {
  employees: Employee[];
  onViewEmployee: (employee: Employee) => void;
  onEditEmployee: (employee: Employee) => void;
  onAllocateEmployee: (employee: Employee) => void;
  getCategoryColor: (category: string) => string;
  getTypeColor: (type: string) => string;
}

export function EmployeeListView({
  employees,
  onViewEmployee,
  onEditEmployee,
  onAllocateEmployee,
  getCategoryColor,
  getTypeColor,
}: EmployeeListViewProps) {
  return (
    <div className="space-y-4">
      {employees?.map((employee) => (
        <div
          key={employee.id}
          className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-semibold">{employee.nome}</h3>
                <p className="text-sm text-muted-foreground">{employee.cargo}</p>
                {employee.numero_funcional && (
                  <p className="text-xs text-muted-foreground">
                    Nº: {employee.numero_funcional}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Badge className={getCategoryColor(employee.categoria)}>
                  {employee.categoria}
                </Badge>
                <Badge className={getTypeColor(employee.tipo_colaborador || "")}>
                  {employee.tipo_colaborador || "Não definido"}
                </Badge>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span>Custo/hora: {employee.custo_hora} KZ</span>
              {employee.hora_entrada && employee.hora_saida && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{employee.hora_entrada} - {employee.hora_saida}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewEmployee(employee)}
              className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onAllocateEmployee(employee)}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEditEmployee(employee)}
              className="hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </div>
        </div>
      ))}
      {employees?.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          Nenhum colaborador encontrado
        </div>
      )}
    </div>
  );
}