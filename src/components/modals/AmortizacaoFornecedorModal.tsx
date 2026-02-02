import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BaseModal } from "@/components/shared/BaseModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useCreateLancamento, useContasFornecedores } from "@/hooks/useContasFornecedores";
import { formatCurrency } from "@/utils/currency";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AmortizacaoFornecedorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: number;
}

export function AmortizacaoFornecedorModal({ open, onOpenChange, projectId }: AmortizacaoFornecedorModalProps) {
  const [contaId, setContaId] = useState<string>("");
  const [dataAmortizacao, setDataAmortizacao] = useState<string>(new Date().toISOString().split("T")[0]);
  const [valor, setValor] = useState<number>(0);
  const [descricao, setDescricao] = useState<string>("");
  const [observacoes, setObservacoes] = useState<string>("");
  
  const { data: contas, isLoading: loadingContas } = useContasFornecedores(projectId);
  const createLancamento = useCreateLancamento();

  const contaSelecionada = contas?.find((c: any) => c.id === contaId);
  const saldoDisponivel = contaSelecionada?.saldo?.saldo_atual || 0;

  const handleSubmit = async () => {
    if (!contaId) {
      toast.error("Selecione uma conta para amortização");
      return;
    }

    if (!descricao.trim()) {
      toast.error("Descrição é obrigatória");
      return;
    }

    if (valor <= 0) {
      toast.error("O valor da amortização deve ser maior que zero");
      return;
    }

    if (valor > saldoDisponivel) {
      toast.error(`O valor da amortização não pode exceder o saldo disponível (${formatCurrency(saldoDisponivel)})`);
      return;
    }

    await createLancamento.mutateAsync({
      conta_fornecedor_id: contaId,
      data_lancamento: dataAmortizacao,
      descricao,
      credito: 0,
      debito: valor,
      observacoes,
    });

    onOpenChange(false);
    setContaId("");
    setDataAmortizacao(new Date().toISOString().split("T")[0]);
    setValor(0);
    setDescricao("");
    setObservacoes("");
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title="Amortização de Crédito"
      size="lg"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="conta">Conta Fornecedor *</Label>
          <Select value={contaId} onValueChange={setContaId}>
            <SelectTrigger id="conta">
              <SelectValue placeholder="Selecione uma conta para amortizar" />
            </SelectTrigger>
            <SelectContent>
              {loadingContas ? (
                <SelectItem value="loading" disabled>Carregando...</SelectItem>
              ) : contas && contas.length > 0 ? (
                contas
                  .filter((c: any) => (c.saldo?.saldo_atual || 0) > 0)
                  .map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.fornecedores?.nome} - Saldo: {formatCurrency(c.saldo?.saldo_atual || 0)}
                    </SelectItem>
                  ))
              ) : (
                <SelectItem value="empty" disabled>Nenhuma conta com saldo disponível</SelectItem>
              )}
            </SelectContent>
          </Select>
          {contaSelecionada && (
            <p className="text-xs text-muted-foreground">
              Saldo disponível: <span className="font-semibold text-green-600">{formatCurrency(saldoDisponivel)}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Data da Amortização *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dataAmortizacao && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataAmortizacao ? (
                  format(parseISO(dataAmortizacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                ) : (
                  <span>Selecione a data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
              <Calendar
                mode="single"
                selected={dataAmortizacao ? parseISO(dataAmortizacao) : undefined}
                onSelect={(date) => setDataAmortizacao(date ? format(date, "yyyy-MM-dd") : "")}
                initialFocus
                locale={ptBR}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor">Valor da Amortização *</Label>
          <CurrencyInput
            id="valor"
            value={valor}
            onValueChange={setValor}
            placeholder="0,00 Kz"
          />
          <p className="text-xs text-muted-foreground">
            Valor a ser pago/amortizado do crédito
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição *</Label>
          <Input
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Pagamento parcial, Quitação total..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Observações adicionais sobre a amortização..."
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!contaId || !descricao || valor <= 0 || createLancamento.isPending}
          >
            {createLancamento.isPending ? "Registrando..." : "Registrar Amortização"}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
