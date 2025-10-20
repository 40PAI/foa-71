import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, User, MapPin, FileText, Download, ExternalLink, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ViewEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: any;
}

export function ViewEmployeeModal({ open, onOpenChange, employee }: ViewEmployeeModalProps) {
  const { toast } = useToast();
  
  if (!employee) return null;

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

  const handleViewCV = () => {
    if (employee.cv_link) {
      // Abrir diretamente no navegador
      window.open(employee.cv_link, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownloadCV = async () => {
    if (!employee.cv_link) return;
    
    try {
      toast({
        title: "Iniciando download...",
        description: "Aguarde enquanto baixamos o arquivo.",
      });
      
      // Usar fetch para baixar o arquivo
      const response = await fetch(employee.cv_link);
      if (!response.ok) throw new Error('Falha no download');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Criar link temporário para download
      const link = document.createElement('a');
      link.href = url;
      link.download = `CV_${employee.nome.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Limpar recursos
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download concluído!",
        description: "O arquivo foi baixado com sucesso.",
      });
    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro no download",
        description: "Tentando abrir o arquivo em nova aba...",
        variant: "destructive",
      });
      // Fallback: tentar abrir em nova aba
      window.open(employee.cv_link, '_blank');
    }
  };

  const isImageFile = (url: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const isPDFFile = (url: string) => {
    return url.toLowerCase().includes('.pdf');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações do Colaborador
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header com informações principais */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{employee.nome}</CardTitle>
                  <p className="text-lg text-muted-foreground mt-1">{employee.cargo}</p>
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
            </CardHeader>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Informações Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {employee.numero_funcional && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Número Funcional</label>
                    <p className="text-sm">{employee.numero_funcional}</p>
                  </div>
                )}
                
                {employee.bi && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bilhete de Identidade</label>
                    <p className="text-sm">{employee.bi}</p>
                  </div>
                )}

                {employee.morada && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Morada</label>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                      <p className="text-sm">{employee.morada}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informações Profissionais */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Profissionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Custo por Hora</label>
                  <p className="text-sm font-semibold">{employee.custo_hora} KZ</p>
                </div>

                {employee.hora_entrada && employee.hora_saida && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Horário de Trabalho</label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{employee.hora_entrada} - {employee.hora_saida}</p>
                    </div>
                  </div>
                )}

                {employee.projeto_id && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Projeto Alocado</label>
                    <p className="text-sm">Projeto ID: {employee.projeto_id}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Documentos */}
          {employee.cv_link && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="font-medium">Curriculum Vitae</p>
                        <p className="text-sm text-muted-foreground">
                          {isPDFFile(employee.cv_link) ? 'Documento PDF' : 
                           isImageFile(employee.cv_link) ? 'Imagem' : 'Documento'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleViewCV}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Visualizar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadCV}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  {/* Preview do documento se for imagem */}
                  {isImageFile(employee.cv_link) && (
                    <div className="border rounded-lg p-4">
                      <p className="text-sm font-medium mb-2">Preview:</p>
                      <img 
                        src={employee.cv_link} 
                        alt="CV Preview" 
                        className="max-w-full h-auto rounded border"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>
                  )}
                  
                  {/* Instruções para PDFs */}
                  {isPDFFile(employee.cv_link) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Dica:</strong> Se o PDF não abrir automaticamente, use o botão "Download" 
                        para baixar o arquivo ou verifique se o seu navegador não está bloqueando popups.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações de Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data de Criação</label>
                  <p className="text-sm">
                    {employee.created_at ? new Date(employee.created_at).toLocaleDateString('pt-BR') : 'Não informado'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Última Atualização</label>
                  <p className="text-sm">
                    {employee.updated_at ? new Date(employee.updated_at).toLocaleDateString('pt-BR') : 'Não informado'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}