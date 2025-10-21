import { useState } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [descricao, setDescricao] = useState<string>("");
  const [dataVencimento, setDataVencimento] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("");
  
  const { data: fornecedores, isLoading: loadingFornecedores } = useFornecedores();
  const createConta = useCreateContaFornecedor();

  const handleSubmit = async () => {
    if (!fornecedorId || !projectData) return;

    await createConta.mutateAsync({
      fornecedor_id: fornecedorId,
      projeto_id: projectData.id,
      saldo_inicial: saldoInicial,
      descricao,
      data_vencimento: dataVencimento || null,
      categoria,
    });

    onOpenChange(false);
    setFornecedorId("");
    setSaldoInicial(0);
    setDescricao("");
    setDataVencimento("");
    setCategoria("");
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

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição da conta corrente..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dataVencimento">Data de Vencimento</Label>
          <Input
            id="dataVencimento"
            type="date"
            value={dataVencimento}
            onChange={(e) => setDataVencimento(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria</Label>
          <Select
            value={categoria}
            onValueChange={setCategoria}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mao_de_obra">Mão de obra</SelectItem>
              <SelectItem value="materiais_construcao">Materiais de construção</SelectItem>
              <SelectItem value="equipamentos_ferramentas">Equipamentos e ferramentas</SelectItem>
              <SelectItem value="transporte_combustivel">Transporte e combustível</SelectItem>
              <SelectItem value="servicos_subcontratados">Serviços subcontratados</SelectItem>
              <SelectItem value="licencas_taxas">Licenças e taxas</SelectItem>
              <SelectItem value="imprevistos">Imprevistos</SelectItem>
              <SelectItem value="seguranca_epi">Segurança e EPI</SelectItem>
              <SelectItem value="manutencao_equipamentos">Manutenção de equipamentos</SelectItem>
              <SelectItem value="despesas_admin_ti">Despesas administrativas e comunicação/TI</SelectItem>
            </SelectContent>
          </Select>
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
