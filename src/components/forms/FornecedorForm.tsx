import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star } from "lucide-react";
import type { Fornecedor } from "@/types/contasCorrentes";
import { FornecedorDocumentUpload } from "./FornecedorDocumentUpload";

const fornecedorSchema = z.object({
  nome: z.string().trim().min(1, "Nome obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  nif: z.string().trim().optional().or(z.literal("")),
  tipo_fornecedor: z.string().optional().or(z.literal("")),
  email: z.string().trim().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().trim().optional().or(z.literal("")),
  endereco: z.string().trim().optional().or(z.literal("")),
  cidade: z.string().trim().optional().or(z.literal("")),
  provincia: z.string().optional().or(z.literal("")),
  categoria_principal: z.string().trim().optional().or(z.literal("")),
  recorrencia: z.string().optional().or(z.literal("")),
  status: z.enum(["ativo", "inativo", "bloqueado"], {
    required_error: "Status obrigatório"
  }),
  avaliacao_qualidade: z.number().min(1).max(5).optional().nullable(),
  observacoes: z.string().trim().optional().or(z.literal("")),
});

type FornecedorFormValues = z.infer<typeof fornecedorSchema>;

interface FornecedorFormProps {
  fornecedor?: Fornecedor;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const PROVINCIAS_ANGOLA = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango",
  "Cuanza Norte", "Cuanza Sul", "Cunene", "Huambo", "Huíla",
  "Luanda", "Lunda Norte", "Lunda Sul", "Malanje", "Moxico",
  "Namibe", "Uíge", "Zaire"
];

export function FornecedorForm({
  fornecedor,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: FornecedorFormProps) {
  const form = useForm<FornecedorFormValues>({
    resolver: zodResolver(fornecedorSchema),
    defaultValues: {
      nome: fornecedor?.nome || "",
      nif: fornecedor?.nif || "",
      tipo_fornecedor: fornecedor?.tipo_fornecedor || "",
      email: fornecedor?.email || "",
      telefone: fornecedor?.telefone || "",
      endereco: fornecedor?.endereco || "",
      cidade: fornecedor?.cidade || "",
      provincia: fornecedor?.provincia || "",
      categoria_principal: fornecedor?.categoria_principal || "",
      recorrencia: fornecedor?.recorrencia || "",
      status: fornecedor?.status || "ativo",
      avaliacao_qualidade: fornecedor?.avaliacao_qualidade || null,
      observacoes: fornecedor?.observacoes || "",
    },
  });

  const handleSubmit = async (data: FornecedorFormValues) => {
    const submitData = {
      ...data,
      nif: data.nif || null,
      tipo_fornecedor: data.tipo_fornecedor || null,
      email: data.email || null,
      telefone: data.telefone || null,
      endereco: data.endereco || null,
      cidade: data.cidade || null,
      provincia: data.provincia || null,
      categoria_principal: data.categoria_principal || null,
      recorrencia: data.recorrencia || null,
      avaliacao_qualidade: data.avaliacao_qualidade || null,
      observacoes: data.observacoes || null,
    };

    await onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            📋 Informações Básicas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome do fornecedor" autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nif"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIF</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Número de identificação fiscal" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="tipo_fornecedor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Fornecedor</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="materiais">Materiais</SelectItem>
                    <SelectItem value="servicos">Serviços</SelectItem>
                    <SelectItem value="equipamentos">Equipamentos</SelectItem>
                    <SelectItem value="misto">Misto</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contacto */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            📞 Contacto
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="email@exemplo.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="+244 123 456 789" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Localização */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            📍 Localização
          </h3>
          <FormField
            control={form.control}
            name="endereco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Endereço completo" rows={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Cidade" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="provincia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Província</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a província" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROVINCIAS_ANGOLA.map((provincia) => (
                        <SelectItem key={provincia} value={provincia}>
                          {provincia}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Classificação */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            🏷️ Classificação
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="categoria_principal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria Principal</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Construção" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recorrencia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recorrência</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="eventual">Eventual</SelectItem>
                      <SelectItem value="estrategico">Estratégico</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avaliacao_qualidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avaliação de Qualidade</FormLabel>
                  <FormControl>
                    <div className="flex gap-1 pt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 cursor-pointer transition-colors ${
                            field.value && field.value >= star
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground hover:text-yellow-300"
                          }`}
                          onClick={() => field.onChange(star)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            📊 Status
          </h3>
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="bloqueado">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Observações */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            📝 Observações
          </h3>
          <FormField
            control={form.control}
            name="observacoes"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Notas e observações adicionais..."
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Documentos */}
        <FornecedorDocumentUpload fornecedorId={fornecedor?.id} />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "A guardar..."
              : fornecedor
              ? "Atualizar Fornecedor"
              : "Criar Fornecedor"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
