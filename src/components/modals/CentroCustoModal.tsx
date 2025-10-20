import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateCentroCusto, useUpdateCentroCusto } from "@/hooks/useCentrosCusto";
import type { CentroCusto, TipoCentroCusto } from "@/types/centroCusto";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CentroCustoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  centroCusto?: CentroCusto;
  projectId?: number;
}

export function CentroCustoModal({ open, onOpenChange, centroCusto, projectId }: CentroCustoModalProps) {
  const [formData, setFormData] = useState<Partial<CentroCusto>>({
    codigo: centroCusto?.codigo || "",
    nome: centroCusto?.nome || "",
    tipo: centroCusto?.tipo || "categoria",
    projeto_id: centroCusto?.projeto_id || projectId,
    departamento: centroCusto?.departamento || "",
    orcamento_mensal: centroCusto?.orcamento_mensal || 0,
    ativo: centroCusto?.ativo ?? true,
  });

  const createMutation = useCreateCentroCusto();
  const updateMutation = useUpdateCentroCusto();
  
  const [codigoExiste, setCodigoExiste] = useState(false);
  const [verificandoCodigo, setVerificandoCodigo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        codigo: centroCusto?.codigo || "",
        nome: centroCusto?.nome || "",
        tipo: centroCusto?.tipo || "categoria",
        projeto_id: centroCusto?.projeto_id || projectId,
        departamento: centroCusto?.departamento || "",
        orcamento_mensal: centroCusto?.orcamento_mensal || 0,
        ativo: centroCusto?.ativo ?? true,
      });
      setCodigoExiste(false);
    }
  }, [open, centroCusto, projectId]);

  // Verificar se código já existe
  const verificarCodigo = async (codigo: string) => {
    if (!codigo || centroCusto) return; // Skip se editando
    
    setVerificandoCodigo(true);
    
    const { data } = await supabase
      .from("centros_custo")
      .select("codigo")
      .eq("codigo", codigo)
      .eq("ativo", true)
      .maybeSingle();
    
    setCodigoExiste(!!data);
    setVerificandoCodigo(false);
  };

  // Gerar código automático
  const gerarCodigoAutomatico = async () => {
    if (!projectId) return;
    
    try {
      // Buscar nome do projeto
      const { data: projeto } = await supabase
        .from("projetos")
        .select("nome")
        .eq("id", projectId)
        .single();
      
      if (!projeto) return;
      
      // Gerar prefixo (primeiras 3 letras do projeto)
      const prefix = `CC-${projeto.nome.substring(0, 3).toUpperCase()}`;
      
      // Buscar códigos existentes com este prefixo
      const { data: centros } = await supabase
        .from("centros_custo")
        .select("codigo")
        .eq("projeto_id", projectId)
        .ilike("codigo", `${prefix}-%`);
      
      // Encontrar próximo número disponível
      let counter = 1;
      while (centros?.some(c => c.codigo === `${prefix}-${counter.toString().padStart(3, '0')}`)) {
        counter++;
      }
      
      const novoCodigo = `${prefix}-${counter.toString().padStart(3, '0')}`;
      setFormData({ ...formData, codigo: novoCodigo });
      setCodigoExiste(false);
      toast.success(`Código gerado: ${novoCodigo}`);
    } catch (error) {
      console.error("Erro ao gerar código:", error);
      toast.error("Erro ao gerar código automático");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de código duplicado
    if (codigoExiste && !centroCusto) {
      toast.error("Código já existe. Por favor, escolha outro código ou use o botão 'Auto'.");
      return;
    }
    
    // Validação
    if (!formData.codigo || !formData.nome || !formData.tipo) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!projectId && !formData.projeto_id) {
      toast.error("Nenhum projeto selecionado");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const dataToSend = {
        codigo: formData.codigo,
        nome: formData.nome,
        tipo: formData.tipo as TipoCentroCusto,
        projeto_id: formData.projeto_id || projectId,
        departamento: formData.departamento || null,
        orcamento_mensal: formData.orcamento_mensal || 0,
        ativo: formData.ativo ?? true,
      };

      console.log("Enviando dados:", dataToSend);

      if (centroCusto) {
        await updateMutation.mutateAsync({ id: centroCusto.id, ...dataToSend });
      } else {
        await createMutation.mutateAsync(dataToSend);
      }
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao salvar centro de custo:", error);
      
      // Mensagem específica para código duplicado
      if (error.code === '23505') {
        toast.error("Código já existe. Por favor, escolha outro código.");
      } else {
        toast.error("Erro ao salvar centro de custo");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {centroCusto ? "Editar Centro de Custo Polo" : "Novo Centro de Custo Polo"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="codigo">Código*</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    onBlur={(e) => verificarCodigo(e.target.value)}
                    placeholder="Ex: CC-KIF-001"
                    required
                    className={codigoExiste ? "border-destructive" : ""}
                  />
                  {codigoExiste && (
                    <p className="text-xs text-destructive mt-1">
                      ⚠️ Este código já existe
                    </p>
                  )}
                  {verificandoCodigo && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Verificando...
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={gerarCodigoAutomatico}
                  disabled={verificandoCodigo || isSubmitting}
                  title="Gerar código automático"
                >
                  🔄 Auto
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="tipo">Tipo*</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: TipoCentroCusto) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="projeto">Projeto</SelectItem>
                  <SelectItem value="departamento">Departamento</SelectItem>
                  <SelectItem value="categoria">Categoria</SelectItem>
                  <SelectItem value="fornecedor">Fornecedor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="nome">Nome*</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Material de Construção - Projeto A"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="departamento">Departamento</Label>
            <Input
              id="departamento"
              value={formData.departamento}
              onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
              placeholder="Ex: Obras, Administrativo, Compras"
            />
          </div>
          
          <div>
            <Label htmlFor="orcamento_mensal">Orçamento Mensal (AOA)</Label>
            <Input
              id="orcamento_mensal"
              type="number"
              step="0.01"
              value={formData.orcamento_mensal}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ 
                  ...formData, 
                  orcamento_mensal: value === '' ? 0 : parseFloat(value) || 0
                });
              }}
              placeholder="0.00"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || codigoExiste || verificandoCodigo}
            >
              {isSubmitting ? "Salvando..." : (centroCusto ? "Atualizar" : "Criar")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
