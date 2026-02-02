
import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCreateMaterialArmazem, useUpdateMaterialArmazem } from "@/hooks/useMaterialsArmazem";
import { ProjectSelector } from "@/components/ProjectSelector";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

const SUBCATEGORIAS_PREDEFINIDAS = [
  "Materiais de Construção",
  "Equipamentos e Ferramentas",
  "Ferramentas Manuais",
  "EPIs",
  "Consumo Rápido / Apoio",
  "Cimento",
  "Ferragem",
  "Pintura",
  "Alvenaria",
  "Hidráulica",
  "Elétrica",
];

const materialArmazemFormSchema = z.object({
  nome_material: z.string().min(1, "Nome do material é obrigatório"),
  codigo_interno: z.string().min(1, "Código interno é obrigatório"),
  categoria_principal: z.enum(["Material", "Mão de Obra", "Património", "Custos Indiretos", "Segurança e Higiene no Trabalho"]),
  subcategoria: z.string().min(1, "Subcategoria é obrigatória"),
  subcategoria_outro: z.string().optional(),
  descricao_tecnica: z.string().optional(),
  unidade_medida: z.enum(["saco", "m³", "m", "kg", "litro", "unidade", "outro"]),
  quantidade_stock: z.number().min(0, "Quantidade deve ser positiva"),
  localizacao_fisica: z.string().optional(),
  fornecedor: z.string().optional(),
  data_entrada: z.string(),
  status_item: z.enum(["Disponível", "Em uso", "Reservado", "Manutenção", "Inativo"]),
  projeto_alocado_id: z.string().optional(),
  imagem_url: z.string().optional(),
});

type MaterialArmazemFormValues = z.infer<typeof materialArmazemFormSchema>;

interface MaterialArmazemFormProps {
  material?: Tables<"materiais_armazem"> & { imagem_url?: string };
  onSuccess?: () => void;
}

export function MaterialArmazemForm({ material, onSuccess }: MaterialArmazemFormProps) {
  const createMaterial = useCreateMaterialArmazem();
  const updateMaterial = useUpdateMaterialArmazem();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(material?.imagem_url || null);

  const form = useForm<MaterialArmazemFormValues>({
    resolver: zodResolver(materialArmazemFormSchema),
    defaultValues: {
      nome_material: material?.nome_material || "",
      codigo_interno: material?.codigo_interno || "",
      categoria_principal: material?.categoria_principal || "Material",
      subcategoria: SUBCATEGORIAS_PREDEFINIDAS.includes(material?.subcategoria || "") 
        ? material?.subcategoria || "" 
        : (material?.subcategoria ? "Outro" : ""),
      subcategoria_outro: !SUBCATEGORIAS_PREDEFINIDAS.includes(material?.subcategoria || "") 
        ? material?.subcategoria || "" 
        : "",
      descricao_tecnica: material?.descricao_tecnica || "",
      unidade_medida: material?.unidade_medida || "unidade",
      quantidade_stock: material?.quantidade_stock ? Number(material.quantidade_stock) : 0,
      localizacao_fisica: material?.localizacao_fisica || "",
      fornecedor: material?.fornecedor || "",
      data_entrada: material?.data_entrada || new Date().toISOString().split('T')[0],
      status_item: material?.status_item || "Disponível",
      projeto_alocado_id: material?.projeto_alocado_id?.toString() || "",
      imagem_url: material?.imagem_url || "",
    },
  });

  const watchedStatus = form.watch("status_item");
  const watchedSubcategoria = form.watch("subcategoria");

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione apenas arquivos de imagem");
      return;
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `materiais/${fileName}`;

      // Upload para o bucket
      const { error: uploadError } = await supabase.storage
        .from('materiais-armazem')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('materiais-armazem')
        .getPublicUrl(filePath);

      setPreviewUrl(publicUrl);
      form.setValue('imagem_url', publicUrl);
      toast.success("Imagem carregada com sucesso");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao carregar imagem");
    } finally {
      setIsUploading(false);
    }
  }, [form]);

  const handleRemoveImage = useCallback(() => {
    setPreviewUrl(null);
    form.setValue('imagem_url', '');
  }, [form]);

  const onSubmit = async (values: MaterialArmazemFormValues) => {
    try {
      // Determinar subcategoria final
      const subcategoriaFinal = values.subcategoria === "Outro" && values.subcategoria_outro
        ? values.subcategoria_outro
        : values.subcategoria;

      const materialData = {
        nome_material: values.nome_material,
        codigo_interno: values.codigo_interno,
        categoria_principal: values.categoria_principal,
        subcategoria: subcategoriaFinal,
        descricao_tecnica: values.descricao_tecnica || null,
        unidade_medida: values.unidade_medida,
        quantidade_stock: values.quantidade_stock,
        localizacao_fisica: values.localizacao_fisica || null,
        fornecedor: values.fornecedor || null,
        data_entrada: values.data_entrada,
        status_item: values.status_item,
        projeto_alocado_id: values.projeto_alocado_id ? parseInt(values.projeto_alocado_id) : null,
        imagem_url: values.imagem_url || null,
      };

      if (material) {
        await updateMaterial.mutateAsync({
          id: material.id,
          ...materialData,
        });
      } else {
        await createMaterial.mutateAsync(materialData);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Erro ao salvar material:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Seção 1: Informações Básicas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Informações Básicas</h3>
          
          <FormField
            control={form.control}
            name="nome_material"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Material *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Cimento Cimangola 42.5R, Betoneira 400L" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="codigo_interno"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código Interno *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: CIM-001, FER-012, EQU-025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="categoria_principal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria Principal *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Material">Material</SelectItem>
                      <SelectItem value="Mão de Obra">Mão de Obra</SelectItem>
                      <SelectItem value="Património">Património</SelectItem>
                      <SelectItem value="Custos Indiretos">Custos Indiretos</SelectItem>
                      <SelectItem value="Segurança e Higiene no Trabalho">Segurança e Higiene no Trabalho</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subcategoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategoria / Tipologia *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar subcategoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SUBCATEGORIAS_PREDEFINIDAS.map((sub) => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                      <SelectItem value="Outro">Outro (especificar)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Campo para especificar "Outro" */}
          {watchedSubcategoria === "Outro" && (
            <FormField
              control={form.control}
              name="subcategoria_outro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especificar Subcategoria *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Digite a subcategoria personalizada" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Seção 2: Especificações Técnicas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Especificações Técnicas</h3>
          
          <FormField
            control={form.control}
            name="descricao_tecnica"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição Técnica Completa (Recomendado)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tamanho, composição, norma, tensão, bitola, litragem ou finalidade"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="unidade_medida"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade de Medida *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar unidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="saco">Saco</SelectItem>
                      <SelectItem value="m³">m³</SelectItem>
                      <SelectItem value="m">Metro</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="litro">Litro</SelectItem>
                      <SelectItem value="unidade">Unidade</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantidade_stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade Atual em Stock *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="0"
                      {...field} 
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Seção 3: Imagem do Material */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Imagem do Material</h3>
          
          <FormField
            control={form.control}
            name="imagem_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Foto / Imagem (Opcional)</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    {previewUrl ? (
                      <div className="relative w-full max-w-xs">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="w-full h-40 object-cover rounded-lg border border-border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={handleRemoveImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Arraste uma imagem ou clique para selecionar
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG até 5MB
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="hidden"
                        id="material-image-upload"
                      />
                      <label htmlFor="material-image-upload">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isUploading}
                          asChild
                        >
                          <span className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            {isUploading ? "Carregando..." : "Selecionar Imagem"}
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Seção 4: Localização e Origem */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Localização e Origem</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="localizacao_fisica"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localização Física (Recomendado)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Estante A3, Contentor 02, Zona 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fornecedor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fornecedor / Origem (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Loja ou empresa fornecedora" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="data_entrada"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Entrada no Armazém *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(parseISO(field.value), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecione a data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? parseISO(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status_item"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status do Item *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Disponível">Disponível</SelectItem>
                      <SelectItem value="Em uso">Em uso</SelectItem>
                      <SelectItem value="Reservado">Reservado</SelectItem>
                      <SelectItem value="Manutenção">Manutenção</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {watchedStatus === "Em uso" && (
            <FormField
              control={form.control}
              name="projeto_alocado_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Projeto Alocado</FormLabel>
                  <ProjectSelector
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Selecionar projeto..."
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={createMaterial.isPending || updateMaterial.isPending || isUploading}
          >
            {material ? "Atualizar" : "Adicionar"} Material
          </Button>
        </div>
      </form>
    </Form>
  );
}
