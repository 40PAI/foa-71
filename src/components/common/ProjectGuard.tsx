import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ProjectGuardProps {
  projectId: number | null | undefined;
  children: React.ReactNode;
  message?: string;
}

export function ProjectGuard({ 
  projectId, 
  children, 
  message = "Por favor, selecione um projeto no cabeçalho para continuar." 
}: ProjectGuardProps) {
  if (!projectId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
            <h3 className="text-lg font-semibold mb-2">Selecione um Projeto</h3>
            <p className="text-muted-foreground">{message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}