import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, Trash2, Download, Paperclip } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  useFornecedorDocumentos,
  useUploadFornecedorDocumento,
  useDeleteFornecedorDocumento,
} from "@/hooks/useFornecedorDocumentos";
import { formatBytes } from "@/utils/formatters";

interface FornecedorDocumentUploadProps {
  fornecedorId?: string;
}

const TIPOS_DOCUMENTO = [
  { value: "contrato", label: "Contrato" },
  { value: "certidao", label: "Certidão" },
  { value: "alvara", label: "Alvará" },
  { value: "nif", label: "Comprovante NIF" },
  { value: "outros", label: "Outros" },
];

export function FornecedorDocumentUpload({ fornecedorId }: FornecedorDocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState<string>("");

  const { data: documentos = [] } = useFornecedorDocumentos(fornecedorId);
  const uploadMutation = useUploadFornecedorDocumento();
  const deleteMutation = useDeleteFornecedorDocumento();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !fornecedorId) return;

    await uploadMutation.mutateAsync({
      fornecedorId,
      file: selectedFile,
      tipoDocumento: tipoDocumento || undefined,
    });

    setSelectedFile(null);
    setTipoDocumento("");
  };

  const handleDelete = (documentoId: string, storagePath: string) => {
    if (!fornecedorId) return;
    
    if (window.confirm("Tem certeza que deseja remover este documento?")) {
      deleteMutation.mutate({ documentoId, storagePath, fornecedorId });
    }
  };

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Paperclip className="h-5 w-5 text-primary" />
        Documentos do Fornecedor
      </h3>

      {/* Upload Section */}
      {fornecedorId && (
        <Card className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Documento</Label>
              <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_DOCUMENTO.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Arquivo</Label>
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span className="text-sm">
                {selectedFile.name} ({formatBytes(selectedFile.size)})
              </span>
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadMutation.isPending ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Documents List */}
      {documentos.length > 0 && (
        <div className="space-y-2">
          <Label>Documentos Anexados</Label>
          <div className="space-y-2">
            {documentos.map((doc) => (
              <Card key={doc.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.nome_arquivo}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.tipo_documento && (
                          <span className="capitalize">
                            {TIPOS_DOCUMENTO.find((t) => t.value === doc.tipo_documento)?.label || doc.tipo_documento}
                          </span>
                        )}
                        {doc.tamanho_bytes && ` • ${formatBytes(doc.tamanho_bytes)}`}
                        {" • "}
                        {new Date(doc.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {doc.url_documento && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc.url_documento!, doc.nome_arquivo)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doc.id, doc.storage_path)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!fornecedorId && (
        <p className="text-sm text-muted-foreground">
          Salve o fornecedor primeiro para poder adicionar documentos.
        </p>
      )}
    </div>
  );
}
