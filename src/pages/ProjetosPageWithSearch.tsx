import { useState } from "react";
import { ProjectModal } from "@/components/modals/ProjectModal";
import { ProjectDetailsModal } from "@/components/modals/ProjectDetailsModal";
import { useProjects } from "@/hooks/useProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Eye, Plus, Search } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import type { Tables } from "@/integrations/supabase/types";

type Project = Tables<"projetos">;

export function ProjetosPage() {
  const { data: projects, isLoading } = useProjects();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Em Andamento":
        return "bg-blue-500 text-white";
      case "Concluído":
        return "bg-green-500 text-white";
      case "Atrasado":
        return "bg-red-500 text-white";
      case "Pausado":
        return "bg-yellow-500 text-black";
      case "Planeado":
        return "bg-gray-500 text-white";
      case "Cancelado":
        return "bg-red-800 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Filter projects based on search and status
  const filteredProjects = projects?.filter((project) => {
    const matchesSearch = searchTerm === "" || 
      project.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.encarregado.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 px-2 sm:px-4 lg:px-6 pt-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 lg:px-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Projetos</h1>
        <ProjectModal />
      </div>
      
      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Pesquisar por nome, cliente ou encarregado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="Em Andamento">Em Andamento</SelectItem>
            <SelectItem value="Atrasado">Atrasado</SelectItem>
            <SelectItem value="Concluído">Concluído</SelectItem>
            <SelectItem value="Pausado">Pausado</SelectItem>
            <SelectItem value="Planeado">Planeado</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" 
                ? "Nenhum projeto encontrado com os filtros aplicados." 
                : "Nenhum projeto criado ainda."}
            </p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow h-fit">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <Badge className={`${getStatusColor(project.status)} text-xs whitespace-nowrap`}>
                    {project.status}
                  </Badge>
                  <div className="flex gap-1 shrink-0">
                    <ProjectDetailsModal
                      projectId={project.id}
                      projectName={project.nome}
                    />
                    <ProjectModal project={project} trigger="edit" />
                  </div>
                </div>
                <CardTitle className="text-sm sm:text-base lg:text-lg line-clamp-2" title={project.nome}>
                  {project.nome}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Cliente</p>
                    <p className="font-medium text-sm truncate" title={project.cliente}>{project.cliente}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Encarregado</p>
                    <p className="font-medium text-sm truncate" title={project.encarregado}>{project.encarregado}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Orçamento</p>
                      <p className="font-medium text-sm truncate" title={formatCurrency(project.orcamento)}>
                        {formatCurrency(project.orcamento)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Avanço</p>
                      <p className="font-medium text-sm">{project.avanco_fisico}%</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Prazo</p>
                    <p className="font-medium text-sm">
                      {new Date(project.data_fim_prevista).toLocaleDateString("pt-PT")}
                    </p>
                  </div>
                  {project.provincia && project.municipio && (
                    <div>
                      <p className="text-xs text-muted-foreground">Localização</p>
                      <p className="font-medium text-sm truncate" title={`${project.municipio}, ${project.provincia}`}>
                        {project.municipio}, {project.provincia}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}