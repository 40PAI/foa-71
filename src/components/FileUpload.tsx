import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileUploaded: (url: string, fileName: string) => void;
  accept?: string;
  maxSizeInMB?: number;
  bucket: string;
  folder?: string;
  existingFileUrl?: string;
  disabled?: boolean;
}

export function FileUpload({
  onFileUploaded,
  accept = "image/*,video/*,.pdf",
  maxSizeInMB = 50,
  bucket,
  folder = "",
  existingFileUrl,
  disabled = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(existingFileUrl || null);
  const { toast } = useToast();

  const uploadFile = useCallback(async (file: File) => {
    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      // Validar tamanho do arquivo
      if (file.size > maxSizeInMB * 1024 * 1024) {
        throw new Error(`Arquivo muito grande. Máximo permitido: ${maxSizeInMB}MB`);
      }

      // Validar tipo de arquivo (suporta extensões, tipos MIME e curingas como image/*)
      const allowedTypes = accept.split(",").map((type) => type.trim().toLowerCase());
      const fileExtension = "." + (file.name.split(".").pop()?.toLowerCase() || "");
      const mimeType = (file.type || "").toLowerCase();

      const isAllowed = allowedTypes.some((t) => {
        if (t.startsWith(".")) return t === fileExtension; // .pdf, .png
        if (t.endsWith("/*")) return mimeType.startsWith(t.replace("/*", "/")); // image/*, video/*
        return t === mimeType; // application/pdf
      });

      if (!isAllowed) {
        throw new Error(`Tipo de arquivo não permitido. Tipos aceitos: ${accept}`);
      }

      // Sanitizar e gerar nome único para o arquivo
      const sanitizedName = file.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Substitui caracteres especiais por _
        .replace(/_{2,}/g, '_'); // Remove múltiplos underscores seguidos
      
      const fileName = `${folder ? folder + "/" : ""}${Date.now()}-${sanitizedName}`;

      // Simular progresso durante o upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Fazer upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) {
        throw error;
      }

      // Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setUploadedFile(publicUrl);
      onFileUploaded(publicUrl, file.name);

      toast({
        title: "Sucesso",
        description: "Arquivo enviado com sucesso.",
      });

    } catch (error: any) {
      console.error("Erro no upload:", error);
      setError(error.message || "Erro ao enviar arquivo");
      toast({
        title: "Erro no upload",
        description: error.message || "Erro ao enviar arquivo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [bucket, folder, maxSizeInMB, accept, onFileUploaded, toast]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    onFileUploaded("", "");
  };

  const parseStorageRef = (url: string): { bucket: string; path: string } | null => {
    try {
      const u = new URL(url);
      const after = u.pathname.split('/object/public/')[1];
      if (!after) return null;
      const [bucket, ...rest] = after.split('/');
      if (!bucket || rest.length === 0) return null;
      return { bucket, path: rest.join('/') };
    } catch {
      return null;
    }
  };

  const openFile = async () => {
    if (!uploadedFile) return;
    const lower = uploadedFile.toLowerCase();
    const isPdf = lower.includes('.pdf');

    if (isPdf) {
      try {
        const ref = parseStorageRef(uploadedFile);
        if (ref) {
          const { data, error } = await supabase.storage.from(ref.bucket).download(ref.path);
          if (error) throw error;
          const blobUrl = URL.createObjectURL(data);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = decodeURIComponent(ref.path.split('/').pop() || 'comprovante.pdf');
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
          return;
        }
      } catch (e) {
        console.error('Falha no download via API', e);
      }
      const finalUrl = `${uploadedFile}${uploadedFile.includes('?') ? '&' : '?'}download=1`;
      window.open(finalUrl, '_blank', 'noopener');
      return;
    }

    window.open(uploadedFile, '_blank', 'noopener');
  };

  return (
    <div className="space-y-4">
      <Label>Comprovante</Label>
      
      {!uploadedFile ? (
        <div className="space-y-2">
          <div className="relative">
            <Input
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              disabled={uploading || disabled}
              className="cursor-pointer"
            />
            {uploading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="flex items-center gap-2 text-sm">
                  <Upload className="h-4 w-4 animate-pulse" />
                  Enviando...
                </div>
              </div>
            )}
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Enviando arquivo... {uploadProgress}%
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Formatos aceitos: {accept} • Tamanho máximo: {maxSizeInMB}MB
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 border rounded-lg bg-green-50 border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <File className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm flex-1 truncate">Arquivo enviado</span>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openFile}
              className="h-7 px-2"
            >
              Ver
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removeFile}
              className="h-7 px-2"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}