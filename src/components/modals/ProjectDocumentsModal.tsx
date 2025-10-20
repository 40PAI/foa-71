import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Upload, Trash2, Download, FileIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  useProjectDocuments,
  useCreateProjectDocument,
  useDeleteProjectDocument,
} from "@/hooks/useProjectDocuments";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProjectDocumentsModalProps {
  projectId: number;
  projectName: string;
}

export function ProjectDocumentsModal({ projectId, projectName }: ProjectDocumentsModalProps) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const { data: documents = [], isLoading } = useProjectDocuments(projectId);
  const createDocument = useCreateProjectDocument();
  const deleteDocument = useDeleteProjectDocument();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 10) {
      toast.error("Máximo de 10 arquivos por vez");
      return;
    }
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("Selecione pelo menos um arquivo");
      return;
    }

    setIsUploading(true);
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        if (file.size > 20 * 1024 * 1024) {
          toast.error(`${file.name} excede 20MB`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `projeto-${projectId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("documentos-projetos")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("documentos-projetos")
          .getPublicUrl(filePath);

        await createDocument.mutateAsync({
          projeto_id: projectId,
          nome_arquivo: file.name,
          url_arquivo: data.publicUrl,
          tipo_arquivo: fileExt || "unknown",
          tamanho_bytes: file.size,
        });
      }

      toast.success("Documentos enviados com sucesso");
      setSelectedFiles(null);
      const input = document.getElementById("file-input") as HTMLInputElement;
      if (input) input.value = "";
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast.error("Erro ao enviar documentos");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number, url: string) => {
    if (!confirm("Tem certeza que deseja remover este documento?")) return;
    await deleteDocument.mutateAsync({ id, url, projectId });
  };

  const handleDownload = (url: string) => {
    window.open(url, "_blank");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getFileIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (["pdf"].includes(lowerType)) return <FileText className="h-5 w-5 text-red-500" />;
    if (["doc", "docx"].includes(lowerType)) return <FileText className="h-5 w-5 text-blue-500" />;
    if (["xls", "xlsx"].includes(lowerType)) return <FileText className="h-5 w-5 text-green-500" />;
    if (["ppt", "pptx"].includes(lowerType)) return <FileText className="h-5 w-5 text-orange-500" />;
    return <FileIcon className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Gerenciar Documentos">
          <FileText className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Documentos: {projectName}</DialogTitle>
        </DialogHeader>

        <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
          <Label htmlFor="file-input" className="text-base font-semibold">
            Upload de Documentos
          </Label>
          <p className="text-sm text-muted-foreground">
            Aceita PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX e mais. Máximo 20MB por arquivo, até 10 arquivos.
          </p>
          <div className="flex gap-2">
            <Input
              id="file-input"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            <Button
              onClick={handleUpload}
              disabled={!selectedFiles || isUploading}
              className="shrink-0"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Enviando..." : "Enviar"}
            </Button>
          </div>
          {selectedFiles && (
            <p className="text-sm text-muted-foreground">
              {selectedFiles.length} arquivo(s) selecionado(s)
            </p>
          )}
        </div>

        <ScrollArea className="h-[400px] mt-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm mb-3">
              Documentos ({documents.length})
            </h3>
            
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum documento enviado</p>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(doc.tipo_arquivo)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{doc.nome_arquivo}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(doc.tamanho_bytes)}</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(doc.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(doc.url_arquivo)}
                      title="Baixar"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doc.id, doc.url_arquivo)}
                      title="Remover"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
