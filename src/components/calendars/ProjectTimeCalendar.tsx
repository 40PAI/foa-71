
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock, User, Calendar, UserPlus, RefreshCw, Save, AlertTriangle, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDailyTimeByProject, useEmployeesByProject, useUpdateDailyTime } from "@/hooks/useDailyTimeTracking";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmployeeAllocationModal } from "@/components/modals/EmployeeAllocationModal";
import { useToast } from "@/hooks/use-toast";

interface ProjectTimeCalendarProps {
  projectId?: number;
  month?: number;
  year?: number;
}

export function ProjectTimeCalendar({ projectId, month = new Date().getMonth(), year = new Date().getFullYear() }: ProjectTimeCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(month);
  const [currentYear, setCurrentYear] = useState(year);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [localTimeEntries, setLocalTimeEntries] = useState<any[]>([]);
  const [pendingChanges, setPendingChanges] = useState<Map<string, any>>(new Map());
  const { toast } = useToast();

  const { data: timeEntries, isLoading: timeLoading, refetch: refetchTimeEntries } = useDailyTimeByProject(projectId || 0, currentMonth, currentYear);
  const { data: employees, isLoading: employeesLoading, refetch: refetchEmployees } = useEmployeesByProject(projectId || 0);
  const updateTimeMutation = useUpdateDailyTime();

  // Update local state when data changes
  useEffect(() => {
    if (timeEntries) {
      console.log('Time entries updated:', timeEntries);
      setLocalTimeEntries(timeEntries);
    }
  }, [timeEntries]);

  // Force refresh when mutation succeeds
  useEffect(() => {
    if (updateTimeMutation.isSuccess) {
      console.log('Mutation succeeded, refreshing data...');
      refetchTimeEntries();
      refetchEmployees();
    }
  }, [updateTimeMutation.isSuccess, refetchTimeEntries, refetchEmployees]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getMonthName = (month: number) => {
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return months[month];
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setPendingChanges(new Map()); // Clear pending changes when changing month
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const getTimeEntry = (employeeId: number, day: number) => {
    const dateStr = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
    const key = `${employeeId}-${dateStr}`;
    
    // Check for pending changes first
    if (pendingChanges.has(key)) {
      return pendingChanges.get(key);
    }
    
    const entry = localTimeEntries?.find(entry => 
      entry.colaborador_id === employeeId && 
      entry.data === dateStr
    );
    return entry;
  };

  const handleTimeChange = (
    employeeId: number, 
    day: number, 
    field: 'entrada' | 'saida', 
    value: string
  ) => {
    const dateStr = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
    const key = `${employeeId}-${dateStr}`;
    
    const existing = getTimeEntry(employeeId, day) || {
      colaborador_id: employeeId,
      projeto_id: projectId,
      data: dateStr,
      status: 'presente'
    };
    
    const updated = {
      ...existing,
      [field === 'entrada' ? 'hora_entrada' : 'hora_saida']: value,
      status: 'presente'
    };
    
    setPendingChanges(prev => new Map(prev.set(key, updated)));
  };

  const handleStatusChange = (employeeId: number, day: number, status: string) => {
    const dateStr = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
    const key = `${employeeId}-${dateStr}`;
    
    const existing = getTimeEntry(employeeId, day) || {
      colaborador_id: employeeId,
      projeto_id: projectId,
      data: dateStr
    };
    
    const updated = {
      ...existing,
      status: status,
      hora_entrada: status === 'falta' || status === 'ausencia_justificada' ? null : existing.hora_entrada,
      hora_saida: status === 'falta' || status === 'ausencia_justificada' ? null : existing.hora_saida
    };
    
    setPendingChanges(prev => new Map(prev.set(key, updated)));
  };

  const handleBatchUpdate = async () => {
    const changes = Array.from(pendingChanges.values());
    
    if (changes.length === 0) {
      toast({
        title: "Nenhuma alteração",
        description: "Não há alterações pendentes para salvar.",
        variant: "default"
      });
      return;
    }

    try {
      for (const change of changes) {
        await updateTimeMutation.mutateAsync({
          colaboradorId: change.colaborador_id,
          projetoId: projectId!,
          data: change.data,
          horaEntrada: change.hora_entrada || undefined,
          horaSaida: change.hora_saida || undefined,
          status: change.status || 'presente'
        });
      }
      
      setPendingChanges(new Map());
      
      toast({
        title: "Alterações salvas",
        description: `${changes.length} registros atualizados com sucesso.`,
      });
    } catch (error) {
      console.error('Error in batch update:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar alterações. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      presente: "bg-green-500/10 text-green-600",
      falta: "bg-red-500/10 text-red-600",
      ausencia_justificada: "bg-blue-500/10 text-blue-600",
      atraso: "bg-yellow-500/10 text-yellow-600"
    };
    const labels: Record<string, string> = {
      presente: "presente",
      falta: "falta",
      ausencia_justificada: "ausência justificada",
      atraso: "atraso"
    };
    return <Badge className={variants[status] || variants.presente}>{labels[status] || status}</Badge>;
  };

  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    setPendingChanges(new Map());
    refetchTimeEntries();
    refetchEmployees();
  };

  if (!projectId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Selecione um projeto</h3>
            <p className="text-muted-foreground">
              Vá ao Calendário Geral e clique em um projeto para ver o controle de ponto
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (timeLoading || employeesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendário de Ponto - {getMonthName(currentMonth)} {currentYear}
            </CardTitle>
            <div className="flex items-center gap-2">
              {pendingChanges.size > 0 && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleBatchUpdate}
                  disabled={updateTimeMutation.isPending}
                  className="bg-primary text-primary-foreground"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações ({pendingChanges.size})
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={updateTimeMutation.isPending}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${updateTimeMutation.isPending ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAllocationModalOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Colaborador
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Colaborador</TableHead>
                  {days.map(day => (
                    <TableHead key={day} className="text-center min-w-[120px]">
                      {day}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees?.map(employee => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{employee.nome}</div>
                          <div className="text-sm text-muted-foreground">{employee.cargo}</div>
                          {employee.numero_funcional && (
                            <div className="text-xs text-muted-foreground">
                              Nº: {employee.numero_funcional}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {days.map(day => {
                      const timeEntry = getTimeEntry(employee.id, day);
                      const isPending = pendingChanges.has(`${employee.id}-${new Date(currentYear, currentMonth, day).toISOString().split('T')[0]}`);
                      return (
                        <TableCell key={day} className={`p-1 ${isPending ? 'bg-blue-50 border-blue-200' : ''}`}>
                          <div className="space-y-1">
                            {timeEntry?.status === 'falta' || timeEntry?.status === 'ausencia_justificada' ? (
                              <div className="flex flex-col items-center gap-1">
                                {getStatusBadge(timeEntry.status)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 text-xs"
                                  onClick={() => handleStatusChange(employee.id, day, 'presente')}
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Remover
                                </Button>
                              </div>
                            ) : (
                              <>
                                <Input
                                  type="time"
                                  value={timeEntry?.hora_entrada || ''}
                                  onChange={(e) => handleTimeChange(employee.id, day, 'entrada', e.target.value)}
                                  className="h-6 text-xs"
                                  placeholder="Entrada"
                                />
                                <Input
                                  type="time"
                                  value={timeEntry?.hora_saida || ''}
                                  onChange={(e) => handleTimeChange(employee.id, day, 'saida', e.target.value)}
                                  className="h-6 text-xs"
                                  placeholder="Saída"
                                />
                                <div className="flex flex-col gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 text-xs text-red-600 hover:text-red-700"
                                    onClick={() => handleStatusChange(employee.id, day, 'falta')}
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Falta
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 text-xs text-blue-600 hover:text-blue-700"
                                    onClick={() => handleStatusChange(employee.id, day, 'ausencia_justificada')}
                                  >
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Ausência Just.
                                  </Button>
                                </div>
                                {timeEntry?.status && timeEntry.status !== 'presente' && (
                                  <div className="flex justify-center">
                                    {getStatusBadge(timeEntry.status)}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
                {(!employees || employees.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={days.length + 1} className="text-center py-8">
                      <div className="text-muted-foreground">
                        <User className="mx-auto h-8 w-8 mb-2" />
                        <p>Nenhum colaborador alocado para este projeto</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setIsAllocationModalOpen(true)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Adicionar Colaborador
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Faça as alterações e clique em "Salvar Alterações"</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge('presente')}
              {getStatusBadge('falta')}
              {getStatusBadge('ausencia_justificada')}
              {getStatusBadge('atraso')}
            </div>
          </div>
        </CardContent>
      </Card>

      <EmployeeAllocationModal
        open={isAllocationModalOpen}
        onOpenChange={setIsAllocationModalOpen}
        employee={null}
        preselectedProjectId={projectId}
      />
    </div>
  );
}
