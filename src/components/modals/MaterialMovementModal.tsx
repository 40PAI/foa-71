import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft } from "lucide-react";
import { useMoveMaterial } from "@/hooks/useMaterialMovements";
import { useProjects } from "@/hooks/useProjects";
import { useMaterialsArmazem } from "@/hooks/useMaterialsArmazem";

interface MaterialMovementFormData {
  materialId: string;
  projetoOrigemId?: number;
  projetoDestinoId?: number;
  quantidade: number;
  responsavel: string;
  observacoes?: string;
}

export function MaterialMovementModal() {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, setValue, watch, reset } = useForm<MaterialMovementFormData>();
  const moveMaterial = useMoveMaterial();
  const { data: projects } = useProjects();
  const { data: materials } = useMaterialsArmazem();
  
  const selectedMaterialId = watch("materialId");
  const selectedMaterial = materials?.find(m => m.id === selectedMaterialId);
  const quantidadeInput = watch("quantidade");

  const onSubmit = async (data: MaterialMovementFormData) => {
    await moveMaterial.mutateAsync(data);
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          Movimentar Material
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Movimentação de Material</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="materialId">Material</Label>
            <Select onValueChange={(value) => setValue("materialId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar material" />
              </SelectTrigger>
              <SelectContent>
                {materials?.map((material) => (
                  <SelectItem key={material.id} value={material.id}>
                    {material.nome_material} - Stock: {material.quantidade_stock}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projetoOrigemId">Projeto Origem (opcional)</Label>
            <Select onValueChange={(value) => setValue("projetoOrigemId", value === "armazem" ? undefined : parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="armazem">Armazém Geral</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projetoDestinoId">Projeto Destino (opcional)</Label>
            <Select onValueChange={(value) => setValue("projetoDestinoId", value === "armazem" ? undefined : parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar destino" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="armazem">Armazém Geral</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="quantidade">Quantidade</Label>
              {selectedMaterial && (
                <span className="text-sm text-muted-foreground">
                  Disponível: {selectedMaterial.quantidade_stock}
                </span>
              )}
            </div>
            <Input
              id="quantidade"
              type="number"
              step="0.01"
              disabled={!selectedMaterialId}
              {...register("quantidade", { 
                required: true, 
                valueAsNumber: true,
                max: selectedMaterial?.quantidade_stock || undefined
              })}
              className={quantidadeInput > (selectedMaterial?.quantidade_stock || 0) ? "border-destructive" : ""}
            />
            {quantidadeInput > (selectedMaterial?.quantidade_stock || 0) && (
              <p className="text-sm text-destructive">
                Quantidade excede o stock disponível
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável</Label>
            <Input
              id="responsavel"
              {...register("responsavel", { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register("observacoes")}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={moveMaterial.isPending}>
              {moveMaterial.isPending ? "Movimentando..." : "Movimentar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}