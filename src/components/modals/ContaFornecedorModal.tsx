import { useState } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useCreateContaFornecedor } from "@/hooks/useContasFornecedores";
import { useFornecedores } from "@/hooks/useFornecedores";
import { useProjectState } from "@/hooks/useContextHooks";

interface ContaFornecedorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContaFornecedorModal({ open, onOpenChange }: ContaFornecedorModalProps) {
  const { projectData } = useProjectState();
  const [fornecedorId, setFornecedorId] = useState<string>("");
  const [saldoInicial, setSaldoInicial] = useState<number>(0);
  
  const { data: fornecedores, isLoading: loadingFornecedores } = useFornecedores();
  const createConta = useCreateContaFornecedor();

  const handleSubmit = async () => {
    if (!fornecedorId || !projectData) return;

    await createConta.mutateAsync({
      fornecedor_id: fornecedorId,
      projeto_id: projectData.id,
      saldo_inicial: saldoInicial,
    });

    onOpenChange(false);
    setFornecedorId("");
    setSaldoInicial(0);
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title="Nova Conta Corrente"
      size="lg"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fornecedor">Fornecedor *</Label>
          <Select value={fornecedorId} onValueChange={setFornecedorId}>
            <SelectTrigger id="fornecedor">
              <SelectValue placeholder="Selecione um fornecedor" />
            </SelectTrigger>
            <SelectContent>
              {loadingFornecedores ? (
                <SelectItem value="loading" disabled>Carregando...</SelectItem>
              ) : fornecedores && fornecedores.length > 0 ? (
                fornecedores.map((f: any) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.nome} {f.nif ? `(NIF: ${f.nif})` : ""}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="empty" disabled>Nenhum fornecedor disponível</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="saldo">Saldo Inicial</Label>
          <CurrencyInput
            id="saldo"
            value={saldoInicial}
            onValueChange={setSaldoInicial}
            placeholder="0,00 Kz"
          />
          <p className="text-xs text-muted-foreground">
            Valor positivo indica crédito a favor da empresa
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!fornecedorId || createConta.isPending}
          >
            {createConta.isPending ? "Criando..." : "Criar Conta"}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
