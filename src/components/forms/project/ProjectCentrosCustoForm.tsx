import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import type { TipoCentroCusto } from "@/types/centroCusto";
import type { ProjectStage } from "./types";
export interface ProjectCentroCusto {
  codigo: string;
  nome: string;
  tipo: TipoCentroCusto;
  etapa_numero?: number; // Número da etapa para vinculação
  departamento?: string;
  orcamento_mensal: number;
}
interface ProjectCentrosCustoFormProps {
  centrosCusto: ProjectCentroCusto[];
  onCentrosCustoChange: (centrosCusto: ProjectCentroCusto[]) => void;
  stages: ProjectStage[];
}
export function ProjectCentrosCustoForm({
  centrosCusto,
  onCentrosCustoChange,
  stages
}: ProjectCentrosCustoFormProps) {
  const addCentroCusto = () => {
    const newCentro: ProjectCentroCusto = {
      codigo: "",
      nome: "",
      tipo: "categoria",
      etapa_numero: stages.length > 0 ? stages[0].numero_etapa : undefined,
      departamento: "",
      orcamento_mensal: 0
    };
    onCentrosCustoChange([...centrosCusto, newCentro]);
  };
  const removeCentroCusto = (index: number) => {
    const newCentros = centrosCusto.filter((_, i) => i !== index);
    onCentrosCustoChange(newCentros);
  };
  const updateCentroCusto = (index: number, field: keyof ProjectCentroCusto, value: string | number) => {
    const newCentros = [...centrosCusto];
    newCentros[index] = {
      ...newCentros[index],
      [field]: value
    };
    onCentrosCustoChange(newCentros);
  };
  const gerarCodigoAutomatico = (index: number) => {
    const prefix = "CC";
    const counter = (index + 1).toString().padStart(3, '0');
    const novoCodigo = `${prefix}-${counter}`;
    updateCentroCusto(index, "codigo", novoCodigo);
  };
  const isCentroValido = (centro: ProjectCentroCusto) => {
    return centro.codigo.trim() !== "" && centro.nome.trim() !== "" && centro.tipo && (stages.length === 0 || centro.etapa_numero !== undefined);
  };
  return <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Defina os centros de custo e aloque-os às etapas do projeto para melhor controle financeiro.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={addCentroCusto} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Centro de Custo
        </Button>
      </div>

      {stages.length === 0 && <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ É necessário definir pelo menos uma etapa antes de criar centros de custo. 
            Vá para a aba "Etapas" e adicione as etapas do projeto.
          </p>
        </div>}

      {centrosCusto.map((centro, index) => <div key={index} className="border rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center bg-slate-200">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">Centro {index + 1}</h4>
              {isCentroValido(centro) ? <Badge variant="default" className="bg-green-500">✓ Válido</Badge> : <Badge variant="destructive">✗ Campos obrigatórios</Badge>}
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => removeCentroCusto(index)} title="Remover centro de custo">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Código*</label>
              <div className="flex gap-2">
                <Input value={centro.codigo} onChange={e => updateCentroCusto(index, "codigo", e.target.value)} placeholder="Ex: CC-001" className={!centro.codigo.trim() ? "border-red-500 focus-visible:ring-red-500" : ""} />
                <Button type="button" variant="outline" onClick={() => gerarCodigoAutomatico(index)} title="Gerar código automático" className="shrink-0">
                  🔄 Auto
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Tipo*</label>
              <Select value={centro.tipo} onValueChange={(value: TipoCentroCusto) => updateCentroCusto(index, "tipo", value)}>
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

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Nome*</label>
              <Input value={centro.nome} onChange={e => updateCentroCusto(index, "nome", e.target.value)} placeholder="Ex: Material de Construção - Etapa Fundação" className={!centro.nome.trim() ? "border-red-500 focus-visible:ring-red-500" : ""} />
            </div>

            <div>
              <label className="text-sm font-medium">
                Alocado à Etapa*
                {stages.length === 0 && <span className="text-red-500 ml-1">(Defina etapas primeiro)</span>}
              </label>
              <Select value={centro.etapa_numero?.toString()} onValueChange={value => updateCentroCusto(index, "etapa_numero", parseInt(value))} disabled={stages.length === 0}>
                <SelectTrigger className={stages.length > 0 && !centro.etapa_numero ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione a etapa" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map(stage => <SelectItem key={stage.numero_etapa} value={stage.numero_etapa.toString()}>
                      Etapa {stage.numero_etapa} - {stage.nome_etapa || "Sem nome"}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Departamento</label>
              <Input value={centro.departamento} onChange={e => updateCentroCusto(index, "departamento", e.target.value)} placeholder="Ex: Obras, Compras" />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Orçamento Mensal (AOA)</label>
              <Input type="number" step="0.01" min="0" value={centro.orcamento_mensal} onChange={e => updateCentroCusto(index, "orcamento_mensal", parseFloat(e.target.value) || 0)} placeholder="0.00" />
              <p className="text-xs text-muted-foreground mt-1">
                Valor máximo de gastos mensais para este centro de custo
              </p>
            </div>
          </div>
        </div>)}

      {centrosCusto.length === 0 && <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <p>Nenhum centro de custo definido.</p>
          <p className="text-sm mt-1">Clique em "Adicionar Centro de Custo" para começar.</p>
        </div>}
    </div>;
}