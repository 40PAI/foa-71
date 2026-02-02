import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ProjectSelector } from "@/components/ProjectSelector";
import { ClipboardList, Phone, MapPin, Building2, FileText } from "lucide-react";
import type { Cliente } from "@/types/contasCorrentes";

const PROVINCIAS_ANGOLA = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango",
  "Cuanza Norte", "Cuanza Sul", "Cunene", "Huambo", "Huíla",
  "Luanda", "Lunda Norte", "Lunda Sul", "Malanje", "Moxico",
  "Namibe", "Uíge", "Zaire"
];

const clienteSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  nif: z.string().trim().max(50, "NIF muito longo").optional().or(z.literal("")),
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo").optional().or(z.literal("")),
  telefone: z.string().trim().max(20, "Telefone muito longo").optional().or(z.literal("")),
  endereco: z.string().trim().max(500, "Endereço muito longo").optional().or(z.literal("")),
  cidade: z.string().trim().max(100, "Cidade muito longa").optional().or(z.literal("")),
  provincia: z.string().optional().or(z.literal("")),
  tipo_cliente: z.enum(["pessoa_fisica", "pessoa_juridica", ""]).optional(),
  status: z.enum(["ativo", "inativo", "suspenso", "inadimplente"]),
  projeto_id: z.number().nullable().optional(),
  observacoes: z.string().trim().max(1000, "Observações muito longas").optional().or(z.literal("")),
});

type ClienteFormValues = z.infer<typeof clienteSchema>;

interface ClienteFormProps {
  cliente?: Cliente;
  projectId?: number;
  onSubmit: (data: ClienteFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ClienteForm({ cliente, projectId, onSubmit, onCancel, isLoading }: ClienteFormProps) {
  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: cliente?.nome || "",
      nif: cliente?.nif || "",
      email: cliente?.email || "",
      telefone: cliente?.telefone || "",
      endereco: cliente?.endereco || "",
      cidade: cliente?.cidade || "",
      provincia: cliente?.provincia || "",
      tipo_cliente: cliente?.tipo_cliente || "",
      status: cliente?.status || "ativo",
      projeto_id: cliente?.projeto_id || projectId || null,
      observacoes: cliente?.observacoes || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            INFORMAÇÕES BÁSICAS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do cliente" {...field} />
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
                    <Input placeholder="Número de Identificação Fiscal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="tipo_cliente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Cliente</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pessoa_fisica">Pessoa Física</SelectItem>
                    <SelectItem value="pessoa_juridica">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contacto */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            CONTACTO
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
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
                    <Input placeholder="+244 923 456 789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Localização */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            LOCALIZAÇÃO
          </h3>
          <FormField
            control={form.control}
            name="endereco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Endereço completo do cliente"
                    className="resize-none"
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="cidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Cidade" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
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
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="suspenso">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Associação */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            ASSOCIAÇÃO
          </h3>
          <FormField
            control={form.control}
            name="projeto_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Projeto (opcional)</FormLabel>
                <FormControl>
                  <ProjectSelector
                    value={field.value?.toString() || undefined}
                    onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                    placeholder="Selecione um projeto"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Observações */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            OBSERVAÇÕES
          </h3>
          <FormField
            control={form.control}
            name="observacoes"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea 
                    placeholder="Notas adicionais sobre o cliente..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : cliente ? "Atualizar Cliente" : "Criar Cliente"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
