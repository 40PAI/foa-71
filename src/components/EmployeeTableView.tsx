import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface EmployeeTableViewProps {
  employees: Employee[];
  onViewEmployee: (employee: Employee) => void;
  onEditEmployee: (employee: Employee) => void;
  onAllocateEmployee: (employee: Employee) => void;
  getCategoryColor: (category: string) => string;
  getTypeColor: (type: string) => string;
}

export function EmployeeTableView({
  employees,
  onViewEmployee,
  onEditEmployee,
  onAllocateEmployee,
  getCategoryColor,
  getTypeColor,
}: EmployeeTableViewProps) {
  if (employees?.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Nenhum colaborador encontrado
      </div>
    );
  }

  return (
    <div className="scrollable-table-container" style={{ maxHeight: '500px' }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Nº Funcional</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Custo/Hora</TableHead>
            <TableHead>Horário</TableHead>
            <TableHead className="w-[120px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees?.map((employee) => (
            <TableRow key={employee.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{employee.nome}</TableCell>
              <TableCell>{employee.cargo}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {employee.numero_funcional || "-"}
              </TableCell>
              <TableCell>
                <Badge className={getCategoryColor(employee.categoria)}>
                  {employee.categoria}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getTypeColor(employee.tipo_colaborador || "")}>
                  {employee.tipo_colaborador || "Não definido"}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                {employee.custo_hora} KZ
              </TableCell>
              <TableCell>
                {employee.hora_entrada && employee.hora_saida ? (
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3" />
                    <span>{employee.hora_entrada} - {employee.hora_saida}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onViewEmployee(employee)}
                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onAllocateEmployee(employee)}
                    className="h-8 w-8 p-0"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEditEmployee(employee)}
                    className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}