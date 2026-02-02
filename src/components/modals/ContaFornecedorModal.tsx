import { useState } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { BaseModal } from "@/components/shared/BaseModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCreateContaFornecedor, useCreateLancamento } from "@/hooks/useContasFornecedores";
import { useFornecedores } from "@/hooks/useFornecedores";
import { useProjectState } from "@/hooks/useContextHooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ContaFornecedorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContaFornecedorModal({ open, onOpenChange }: ContaFornecedorModalProps) {
  const { projectData } = useProjectState();
  const [fornecedorId, setFornecedorId] = useState<string>("");
  const [valorCredito, setValorCredito] = useState<number>(0);
  const [descricao, setDescricao] = useState<string>("");
  const [dataVencimento, setDataVencimento] = useState<Date | undefined>(undefined);
  const [categoria, setCategoria] = useState<string>("");
  
  const { data: fornecedores, isLoading: loadingFornecedores } = useFornecedores();
  const { mutateAsync: createConta, isPending: creatingConta } = useCreateContaFornecedor();
  const { mutateAsync: createLancamento, isPending: creatingLancamento } = useCreateLancamento();

  const handleSubmit = async () => {
    if (!fornecedorId || !projectData || !valorCredito || valorCredito <= 0) {
      toast.error("Preencha todos os campos obrigatórios e insira um valor válido");
      return;
    }

    try {
      // Criar conta com saldo inicial 0
      const novaConta = await createConta({
        fornecedor_id: fornecedorId,
        projeto_id: projectData.id,
        saldo_inicial: 0,
        descricao,
        data_vencimento: dataVencimento ? format(dataVencimento, "yyyy-MM-dd") : null,
        categoria,
      });

      // Criar lançamento de crédito
      await createLancamento({
        conta_fornecedor_id: novaConta.id,
        data_lancamento: new Date().toISOString().split('T')[0],
        descricao: descricao || "Crédito inicial",
        credito: valorCredito,
        debito: 0,
      });

      onOpenChange(false);
      setFornecedorId("");
      setValorCredito(0);
      setDescricao("");
      setDataVencimento(undefined);
      setCategoria("");
    } catch (error) {
      console.error("Erro ao criar crédito:", error);
    }
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title="Novo Crédito"
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
          <Label htmlFor="valor">Valor do Crédito *</Label>
          <CurrencyInput
            id="valor"
            value={valorCredito}
            onValueChange={setValorCredito}
            placeholder="0,00 Kz"
          />
          <p className="text-xs text-muted-foreground">
            Valor do crédito a registrar
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
          <Label>Data de Vencimento</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dataVencimento && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataVencimento ? (
                  format(dataVencimento, "dd 'de' MMMM 'de' yyyy", { locale: pt })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dataVencimento}
                onSelect={setDataVencimento}
                locale={pt}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria *</Label>
          <Select
            value={categoria}
            onValueChange={setCategoria}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mão de obra">Mão de obra</SelectItem>
              <SelectItem value="Materiais de construção">Materiais de construção</SelectItem>
              <SelectItem value="Equipamentos e ferramentas">Equipamentos e ferramentas</SelectItem>
              <SelectItem value="Transporte e combustível">Transporte e combustível</SelectItem>
              <SelectItem value="Serviços subcontratados">Serviços subcontratados</SelectItem>
              <SelectItem value="Licenças e taxas">Licenças e taxas</SelectItem>
              <SelectItem value="Imprevistos">Imprevistos</SelectItem>
              <SelectItem value="Segurança e EPI">Segurança e EPI</SelectItem>
              <SelectItem value="Manutenção de equipamentos">Manutenção de equipamentos</SelectItem>
              <SelectItem value="Despesas administrativas e comunicação/TI">Despesas administrativas e comunicação/TI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!fornecedorId || !categoria || !valorCredito || creatingConta || creatingLancamento}
          >
            {(creatingConta || creatingLancamento) ? "Criando..." : "Criar Crédito"}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
