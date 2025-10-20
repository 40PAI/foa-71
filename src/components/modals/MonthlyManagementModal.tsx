import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus } from 'lucide-react';
import { useMonthlyProjectStatus } from '@/hooks/useMonthlyProjectStatus';
import { useMonthlyEmployeeAllocations } from '@/hooks/useMonthlyEmployeeAllocations';
import { useEmployees } from '@/hooks/useEmployees';

interface MonthlyManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number | null;
  month: number | null;
  year: number;
  projectName?: string;
}

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const statusColors = {
  ativo: 'bg-success text-success-foreground',
  pausado: 'bg-warning text-warning-foreground',
  concluido: 'bg-muted text-muted-foreground'
};

export const MonthlyManagementModal: React.FC<MonthlyManagementModalProps> = ({
  isOpen,
  onClose,
  projectId,
  month,
  year,
  projectName
}) => {
  const [selectedStatus, setSelectedStatus] = useState<'ativo' | 'pausado' | 'concluido'>('ativo');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [selectedScheduleType, setSelectedScheduleType] = useState<string>('Integral');

  const { getProjectStatusForMonth, updateProjectStatus } = useMonthlyProjectStatus();
  const { 
    getAllocationsForMonth, 
    addEmployeeToMonth, 
    removeEmployeeFromMonth 
  } = useMonthlyEmployeeAllocations();
  const { data: employees = [] } = useEmployees();

  const currentStatus = projectId && month ? getProjectStatusForMonth(projectId, month, year) : 'ativo';
  const currentAllocations = projectId && month ? getAllocationsForMonth(projectId, month, year) : [];

  useEffect(() => {
    if (currentStatus) {
      setSelectedStatus(currentStatus as 'ativo' | 'pausado' | 'concluido');
    }
  }, [currentStatus]);

  const handleStatusUpdate = async () => {
    if (projectId && month) {
      await updateProjectStatus(projectId, month, year, selectedStatus);
    }
  };

  const handleAddEmployee = async () => {
    if (projectId && month && selectedEmployee && selectedFunction) {
      await addEmployeeToMonth(
        projectId, 
        parseInt(selectedEmployee), 
        month, 
        year, 
        selectedFunction,
        selectedScheduleType
      );
      setSelectedEmployee('');
      setSelectedFunction('');
    }
  };

  if (!projectId || !month) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Gestão Mensal - {projectName} - {monthNames[month - 1]} {year}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status do Projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select value={selectedStatus} onValueChange={(value: any) => setSelectedStatus(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="pausado">Pausado</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleStatusUpdate}>
                  Atualizar Status
                </Button>
                <Badge className={statusColors[selectedStatus]}>
                  {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Employee Allocations Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Colaboradores Alocados ({currentAllocations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add Employee Form */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 border rounded-lg bg-card">
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar colaborador" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter(emp => !currentAllocations.find(alloc => alloc.colaborador_id === emp.id))
                      .map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.nome} - {employee.cargo}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <Select value={selectedFunction} onValueChange={setSelectedFunction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Função no projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gestor de Projeto">Gestor de Projeto</SelectItem>
                    <SelectItem value="Encarregado">Encarregado</SelectItem>
                    <SelectItem value="Técnico">Técnico</SelectItem>
                    <SelectItem value="Operário">Operário</SelectItem>
                    <SelectItem value="Auxiliar">Auxiliar</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedScheduleType} onValueChange={setSelectedScheduleType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo horário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Integral">Integral</SelectItem>
                    <SelectItem value="Meio Período">Meio Período</SelectItem>
                    <SelectItem value="Por Horas">Por Horas</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  onClick={handleAddEmployee}
                  disabled={!selectedEmployee || !selectedFunction}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              {/* Employee List */}
              <div className="space-y-2">
                {currentAllocations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum colaborador alocado para este mês
                  </p>
                ) : (
                  currentAllocations.map((allocation) => (
                    <div key={allocation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{allocation.colaborador?.nome}</div>
                        <div className="text-sm text-muted-foreground">
                          {allocation.colaborador?.cargo} • {allocation.funcao} • {allocation.horario_tipo}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeEmployeeFromMonth(allocation.id)}
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};