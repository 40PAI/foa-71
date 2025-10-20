import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { parseFOAExcel, FOAParsedData, convertFOARowToMovimento } from "@/utils/excelFOAParser";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, FileSpreadsheet } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportFOAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
}

export function ImportFOAModal({ open, onOpenChange, projectId }: ImportFOAModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<FOAParsedData | null>(null);
  const [importMode, setImportMode] = useState<"replace" | "new" | "update">("new");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    try {
      const parsed = await parseFOAExcel(selectedFile);
      setParsedData(parsed);
      toast.success("Arquivo analisado com sucesso!");
    } catch (error) {
      console.error("Erro ao analisar arquivo:", error);
      toast.error("Erro ao analisar arquivo Excel");
      setFile(null);
      setParsedData(null);
    }
  };

  const handleImport = async () => {
    if (!parsedData) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      let processedCentros = 0;
      const totalCentros = parsedData.centros.size;

      // Processar centros de custo
      for (const [centronomers, movimentos] of parsedData.centros.entries()) {
        // Criar ou buscar centro de custo
        let centro;
        const { data: existingCentro } = await supabase
          .from("centros_custo")
          .select("id")
          .eq("nome", centronomers)
          .eq("projeto_id", projectId)
          .maybeSingle();

        if (existingCentro) {
          centro = existingCentro;
        } else {
          const { data: newCentro, error: centroError } = await supabase
            .from("centros_custo")
            .insert({
              nome: centronomers,
              codigo: centronomers.substring(0, 10).toUpperCase().replace(/\s/g, "_"),
              tipo: "projeto",
              projeto_id: projectId,
              ativo: true,
              orcamento_mensal: 0,
            })
            .select()
            .single();

          if (centroError) throw centroError;
          centro = newCentro;
        }

        // Inserir movimentos
        const movimentosToInsert = movimentos
          .filter((m) => m.valor > 0) // Apenas movimentos com valor
          .map((movimento) => convertFOARowToMovimento(movimento, projectId, centro.id));

        if (movimentosToInsert.length > 0) {
          const { error: movimentoError } = await supabase
            .from("movimentos_financeiros")
            .insert(movimentosToInsert);

          if (movimentoError) throw movimentoError;
        }

        processedCentros++;
        setProgress((processedCentros / totalCentros) * 100);
      }

      // Processar reembolsos
      if (parsedData.reembolsos.length > 0) {
        const reembolsosToInsert = parsedData.reembolsos
          .filter((r) => r.valor > 0)
          .map((reembolso) => ({
            projeto_id: projectId,
            data_reembolso: reembolso.data,
            descricao: reembolso.descricao,
            valor: reembolso.valor,
            tipo: reembolso.tipo === "entrada" ? "aporte" : "amortizacao",
          }));

        if (reembolsosToInsert.length > 0) {
          const { error: reembolsoError } = await supabase
            .from("reembolsos_foa_fof")
            .insert(reembolsosToInsert);

          if (reembolsoError) throw reembolsoError;
        }
      }

      toast.success(`Importação concluída! ${parsedData.metadata.totalMovimentos} movimentos importados.`);
      onOpenChange(false);
      
      // Reset
      setFile(null);
      setParsedData(null);
      setProgress(0);
    } catch (error) {
      console.error("Erro na importação:", error);
      toast.error("Erro ao importar dados");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar Excel FOA
          </DialogTitle>
          <DialogDescription>
            Faça upload da planilha Excel FOA para importar centros de custo, movimentos e reembolsos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">Arquivo Excel (.xlsx)</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
          </div>

          {parsedData && (
            <>
              <Alert>
                <Upload className="h-4 w-4" />
                <AlertDescription>
                  <strong>Dados encontrados:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• {parsedData.metadata.totalCentros} centros de custo</li>
                    <li>• {parsedData.metadata.totalMovimentos} movimentos financeiros</li>
                    <li>• {parsedData.metadata.totalReembolsos} registros de reembolso</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Modo de Importação</Label>
                <RadioGroup value={importMode} onValueChange={(v: any) => setImportMode(v)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="new" />
                    <Label htmlFor="new" className="font-normal cursor-pointer">
                      Apenas novos (não duplicar)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="update" id="update" />
                    <Label htmlFor="update" className="font-normal cursor-pointer">
                      Atualizar existentes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="replace" id="replace" />
                    <Label htmlFor="replace" className="font-normal cursor-pointer">
                      Substituir tudo (limpar dados anteriores)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importando...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={!parsedData || isProcessing}>
            {isProcessing ? "Importando..." : "Importar Dados"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
