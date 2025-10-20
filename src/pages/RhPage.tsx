import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit, Clock, Users, Calendar, UserPlus, AlertTriangle, Eye, Table, List } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ProjectSelector } from "@/components/ProjectSelector";
import { EmployeeModal } from "@/components/modals/EmployeeModal";
import { EditEmployeeModal } from "@/components/modals/EditEmployeeModal";
import { ViewEmployeeModal } from "@/components/modals/ViewEmployeeModal";
import { EmployeeAllocationModal } from "@/components/modals/EmployeeAllocationModal";
import { GeneralCalendar } from "@/components/calendars/GeneralCalendar";
import { ProjectTimeCalendar } from "@/components/calendars/ProjectTimeCalendar";
import { EmployeeListView } from "@/components/EmployeeListView";
import { EmployeeTableView } from "@/components/EmployeeTableView";
import { EmployeeImportModal } from "@/components/modals/EmployeeImportModal";

const RhPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedProjectForCalendar, setSelectedProjectForCalendar] = useState<number | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState<"all" | "Fixo" | "Temporário">("all");
  const [activeTab, setActiveTab] = useState("colaboradores");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [employeeToView, setEmployeeToView] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"list" | "table">("list");
  
  const { data: employees, isLoading, error } = useEmployees();

  // Show error message if database connection fails
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erro de Conexão</h2>
          <p className="text-muted-foreground mb-4">
            Não foi possível carregar os dados dos colaboradores.
          </p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Oficial":
        return "bg-blue-500/10 text-blue-600";
      case "Auxiliar":
        return "bg-green-500/10 text-green-600";
      case "Técnico Superior":
        return "bg-purple-500/10 text-purple-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Fixo":
        return "bg-emerald-500/10 text-emerald-600";
      case "Temporário":
        return "bg-orange-500/10 text-orange-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  const filteredEmployees = employees?.filter((employee) => {
    const matchesSearch = employee.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = !selectedProject || 
                          employee.projeto_id?.toString() === selectedProject;
    const matchesType = employeeTypeFilter === "all" || 
                       employee.tipo_colaborador === employeeTypeFilter;
    return matchesSearch && matchesProject && matchesType;
  });

  const handleAllocateEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setIsAllocationModalOpen(true);
  };

  const handleEditEmployee = (employee: any) => {
    setEmployeeToEdit(employee);
    setIsEditModalOpen(true);
  };

  const handleViewEmployee = (employee: any) => {
    setEmployeeToView(employee);
    setIsViewModalOpen(true);
  };

  const handleProjectSelect = (projectId: number, month: number) => {
    setSelectedProjectForCalendar(projectId);
    setSelectedMonth(month);
    setActiveTab("ponto-projeto");
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Erro ao carregar colaboradores</div>;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recursos Humanos & Ponto</h1>
          <p className="text-muted-foreground">
            Gestão de colaboradores, alocação por projeto e controle de ponto
          </p>
        </div>
        <div className="flex gap-2">
          <EmployeeImportModal />
          <Button onClick={() => setIsEmployeeModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Colaborador
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="colaboradores" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Colaboradores
          </TabsTrigger>
          <TabsTrigger value="calendario-geral" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendário Geral
          </TabsTrigger>
          <TabsTrigger value="ponto-projeto" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Ponto por Projeto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colaboradores" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-60">
              <ProjectSelector
                value={selectedProject}
                onValueChange={setSelectedProject}
                placeholder="Filtrar por projeto..."
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={employeeTypeFilter}
                onChange={(e) => setEmployeeTypeFilter(e.target.value as any)}
                className="w-full rounded-md border border-input bg-background py-2 text-sm ring-offset-background"
              >
                <option value="all">Todos os tipos</option>
                <option value="Fixo">Fixos</option>
                <option value="Temporário">Temporários</option>
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Colaboradores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{employees?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fixos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {employees?.filter(e => e.tipo_colaborador === "Fixo").length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Temporários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {employees?.filter(e => e.tipo_colaborador === "Temporário").length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Oficiais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {employees?.filter(e => e.categoria === "Oficial").length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Técnicos Superiores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {employees?.filter(e => e.categoria === "Técnico Superior").length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employees List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Colaboradores</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="flex items-center gap-2"
                  >
                    <List className="h-4 w-4" />
                    Lista
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="flex items-center gap-2"
                  >
                    <Table className="h-4 w-4" />
                    Tabela
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === "list" ? (
                <EmployeeListView
                  employees={filteredEmployees}
                  onViewEmployee={handleViewEmployee}
                  onEditEmployee={handleEditEmployee}
                  onAllocateEmployee={handleAllocateEmployee}
                  getCategoryColor={getCategoryColor}
                  getTypeColor={getTypeColor}
                />
              ) : (
                <EmployeeTableView
                  employees={filteredEmployees}
                  onViewEmployee={handleViewEmployee}
                  onEditEmployee={handleEditEmployee}
                  onAllocateEmployee={handleAllocateEmployee}
                  getCategoryColor={getCategoryColor}
                  getTypeColor={getTypeColor}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendario-geral">
          <GeneralCalendar onProjectSelect={handleProjectSelect} />
        </TabsContent>

        <TabsContent value="ponto-projeto">
          <ProjectTimeCalendar 
            projectId={selectedProjectForCalendar}
            month={selectedMonth}
          />
        </TabsContent>
      </Tabs>

      <EmployeeModal 
        open={isEmployeeModalOpen} 
        onOpenChange={setIsEmployeeModalOpen} 
      />

      <EditEmployeeModal 
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen}
        employee={employeeToEdit}
      />

      <ViewEmployeeModal 
        open={isViewModalOpen} 
        onOpenChange={setIsViewModalOpen}
        employee={employeeToView}
      />

      <EmployeeAllocationModal
        open={isAllocationModalOpen}
        onOpenChange={setIsAllocationModalOpen}
        employee={selectedEmployee}
      />
    </div>
  );
};

export default RhPage;
