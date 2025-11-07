
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileUpload } from "@/components/FileUpload";
import { 
  Plus, 
  Receipt, 
  Check, 
  X, 
  Calendar,
  FileText,
  DollarSign,
  Eye,
  Download,
  Building,
  ShoppingCart,
  Hammer,
  PenTool
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/formatters";
import { useDetailedExpenses, useCreateDetailedExpense, useApproveExpense } from "@/hooks/useIntegratedFinances";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTaskExpensesByCategory } from "@/hooks/useTaskExpensesByCategory";
import { useUnifiedExpenses } from "@/hooks/useUnifiedExpenses";

interface ExpenseManagementProps {
  projectId: number;
  filterByCategory?: string;
  showAddButton?: boolean;
  fromTasksValue?: number;
  fromCentroCustoValue?: number;
}

export function ExpenseManagement({ 
  projectId, 
  filterByCategory,
  showAddButton = true,
  fromTasksValue = 0,
  fromCentroCustoValue = 0,
}: ExpenseManagementProps) {
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [newExpense, setNewExpense] = useState({
    categoria_gasto: "",
    valor: "",
    data_gasto: new Date().toISOString().split('T')[0],
    descricao: "",
    comprovante_url: "",
    comprovante_nome: "",
  });

  const { data: allExpenses = [], isLoading } = useDetailedExpenses(projectId);
  const { data: taskExpenses = [], isLoading: isLoadingTasks } = useTaskExpensesByCategory(projectId, filterByCategory || '');
  const { data: unifiedExpenses = [], isLoading: isLoadingUnified } = useUnifiedExpenses(projectId, filterByCategory || '');
  const createExpense = useCreateDetailedExpense();
  const approveExpense = useApproveExpense();
  const { toast } = useToast();

  // Filter expenses by category if provided
  const expenses = useMemo(() => {
    if (!filterByCategory) return allExpenses;
    return allExpenses.filter(e => e.categoria_gasto === filterByCategory);
  }, [allExpenses, filterByCategory]);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Tentando criar gasto:", newExpense);
    
    if (!newExpense.categoria_gasto || !newExpense.valor) {
      toast({
        title: "Campos obrigatórios",
        description: "Categoria e valor são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const valorNumerico = parseFloat(newExpense.valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor numérico válido.",
        variant: "destructive",
      });
      return;
    }

    try {
      const expenseData = {
        projeto_id: projectId,
        categoria_gasto: newExpense.categoria_gasto,
        valor: valorNumerico,
        data_gasto: newExpense.data_gasto,
        descricao: newExpense.descricao || null,
        comprovante_url: newExpense.comprovante_url || null,
      };

      console.log("Dados do gasto a ser criado:", expenseData);

      await createExpense.mutateAsync(expenseData);

      // Reset form
      setNewExpense({
        categoria_gasto: "",
        valor: "",
        data_gasto: new Date().toISOString().split('T')[0],
        descricao: "",
        comprovante_url: "",
        comprovante_nome: "",
      });
      setIsAddingExpense(false);

      toast({
        title: "Sucesso",
        description: "Gasto registrado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao criar gasto:", error);
      toast({
        title: "Erro",
        description: "Erro ao registrar gasto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveExpense.mutateAsync({ id, aprovado_por: "Sistema" });
    } catch (error) {
      console.error("Erro ao aprovar gasto:", error);
      toast({
        title: "Erro",
        description: "Erro ao aprovar gasto.",
        variant: "destructive",
      });
    }
  };

  const categoryOptions = [
    { value: "material", label: "Material" },
    { value: "mao_obra", label: "Mão de Obra" },
    { value: "patrimonio", label: "Patrimônio" },
    { value: "indireto", label: "Custos Indiretos" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "aprovado":
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case "rejeitado":
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "material":
        return <Receipt className="h-4 w-4" />;
      case "mao_obra":
        return <DollarSign className="h-4 w-4" />;
      case "patrimonio":
        return <FileText className="h-4 w-4" />;
      default:
        return <Plus className="h-4 w-4" />;
    }
  };

  // Extrai bucket e caminho a partir de uma URL pública do Storage
  const parseStorageRef = (url: string): { bucket: string; path: string } | null => {
    try {
      const u = new URL(url);
      const after = u.pathname.split('/object/public/')[1];
      if (!after) return null;
      const [bucket, ...rest] = after.split('/');
      if (!bucket || rest.length === 0) return null;
      return { bucket, path: rest.join('/') };
    } catch {
      return null;
    }
  };

  // Abrir/baixar comprovante. Para PDF tenta baixar via API (Blob) para evitar bloqueios de cliente
  const openReceipt = async (url: string) => {
    if (!url) return;
    const lower = url.toLowerCase();
    const isPdf = lower.includes('.pdf');

    if (isPdf) {
      try {
        const ref = parseStorageRef(url);
        if (ref) {
          const { data, error } = await supabase.storage.from(ref.bucket).download(ref.path);
          if (error) throw error;
          const blobUrl = URL.createObjectURL(data);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = decodeURIComponent(ref.path.split('/').pop() || 'comprovante.pdf');
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
          return;
        }
      } catch (e) {
        console.error('Falha no download via API, usando fallback', e);
      }
      // Fallback: força download pela URL pública
      const finalUrl = `${url}${url.includes('?') ? '&' : '?'}download=1`;
      window.open(finalUrl, '_blank', 'noopener');
      return;
    }

    // Para imagens/vídeos abre normalmente em nova aba
    window.open(url, '_blank', 'noopener');
  };

  const getSourceIcon = (fonte: string) => {
    switch (fonte) {
      case 'centro_custo': return <Building className="h-4 w-4 text-blue-600" />;
      case 'requisicao': return <ShoppingCart className="h-4 w-4 text-purple-600" />;
      case 'tarefa': return <Hammer className="h-4 w-4 text-orange-600" />;
      case 'manual': return <PenTool className="h-4 w-4 text-green-600" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getSourceLabel = (fonte: string) => {
    switch (fonte) {
      case 'centro_custo': return 'Centro de Custos';
      case 'requisicao': return 'Requisição';
      case 'tarefa': return 'Tarefa';
      case 'manual': return 'Manual';
      default: return 'Outro';
    }
  };

  if (isLoading || isLoadingUnified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Gastos Detalhados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          {filterByCategory ? `Gastos de ${categoryOptions.find(c => c.value === filterByCategory)?.label}` : "Gestão de Gastos Detalhados"}
        </CardTitle>
        {showAddButton && (
          <Dialog open={isAddingExpense} onOpenChange={setIsAddingExpense}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Movimento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Novo Gasto</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateExpense} className="space-y-4">
                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select 
                    value={newExpense.categoria_gasto} 
                    onValueChange={(value) => setNewExpense(prev => ({ ...prev, categoria_gasto: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="valor">Valor (Kz) *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newExpense.valor}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, valor: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="data_gasto">Data do Gasto</Label>
                  <Input
                    id="data_gasto"
                    type="date"
                    value={newExpense.data_gasto}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, data_gasto: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={newExpense.descricao}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descrição do gasto..."
                  />
                </div>

                <FileUpload
                  bucket="comprovantes"
                  folder={`projeto-${projectId}`}
                  accept="image/*,video/*,.pdf"
                  maxSizeInMB={50}
                  onFileUploaded={(url, fileName) => {
                    setNewExpense(prev => ({ 
                      ...prev, 
                      comprovante_url: url,
                      comprovante_nome: fileName 
                    }));
                  }}
                  existingFileUrl={newExpense.comprovante_url}
                />

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={createExpense.isPending}
                    className="flex-1"
                  >
                    {createExpense.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddingExpense(false)}
                    disabled={createExpense.isPending}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="py-6">
            {(fromTasksValue > 0 || fromCentroCustoValue > 0) ? (
              <>
                <div className="text-center mb-6">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                  <p className="font-medium mb-2 text-foreground">
                    Gastos calculados automaticamente
                  </p>
                  <p className="text-2xl font-bold text-primary mb-1">
                    {formatCurrency(fromTasksValue + fromCentroCustoValue)}
                  </p>
                  <div className="text-sm text-muted-foreground space-y-1 mb-4">
                    {fromTasksValue > 0 && (
                      <p>🏗️ Das Tarefas: {formatCurrency(fromTasksValue)}</p>
                    )}
                    {fromCentroCustoValue > 0 && (
                      <p>📊 Centro de Custos: {formatCurrency(fromCentroCustoValue)}</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Estes valores são calculados automaticamente com base nas tarefas e centros de custo do projeto
                  </p>
                  {showAddButton && (
                    <Button onClick={() => setIsAddingExpense(true)} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Gasto Manual Extra
                    </Button>
                  )}
                </div>

                {/* Tabela Unificada de Todos os Gastos */}
                {unifiedExpenses && unifiedExpenses.length > 0 && (
                  <div className="mt-6 border-t pt-6">
                    <h4 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      Todos os Gastos ({unifiedExpenses.length} movimentos)
                    </h4>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Origem</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Responsável</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {unifiedExpenses.map((expense) => (
                            <TableRow key={expense.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getSourceIcon(expense.fonte)}
                                  <Badge variant="outline" className="text-xs">
                                    {getSourceLabel(expense.fonte)}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {new Date(expense.data).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-xs">
                                <p className="text-sm truncate" title={expense.descricao}>
                                  {expense.descricao}
                                </p>
                                {expense.documento && (
                                  <span className="text-xs text-muted-foreground">
                                    Doc: {expense.documento}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className="font-medium text-red-600">
                                  -{formatCurrency(expense.valor)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">{expense.responsavel || '-'}</span>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedExpense(expense.metadata);
                                      setIsViewingDetails(true);
                                    }}
                                    title="Ver detalhes"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {expense.comprovante_url && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openReceipt(expense.comprovante_url!)}
                                      title="Ver comprovante"
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Resumo com breakdown por fonte */}
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg border space-y-2">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total Geral:</span>
                        <span className="text-primary">
                          {formatCurrency(unifiedExpenses.reduce((sum, e) => sum + e.valor, 0))}
                        </span>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="flex items-center gap-2">
                            <Building className="h-3 w-3 text-blue-600" /> Centro de Custos:
                          </span>
                          <span>
                            {formatCurrency(
                              unifiedExpenses
                                .filter(e => e.fonte === 'centro_custo')
                                .reduce((sum, e) => sum + e.valor, 0)
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="flex items-center gap-2">
                            <ShoppingCart className="h-3 w-3 text-purple-600" /> Requisições:
                          </span>
                          <span>
                            {formatCurrency(
                              unifiedExpenses
                                .filter(e => e.fonte === 'requisicao')
                                .reduce((sum, e) => sum + e.valor, 0)
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="flex items-center gap-2">
                            <Hammer className="h-3 w-3 text-orange-600" /> Tarefas:
                          </span>
                          <span>
                            {formatCurrency(
                              unifiedExpenses
                                .filter(e => e.fonte === 'tarefa')
                                .reduce((sum, e) => sum + e.valor, 0)
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="flex items-center gap-2">
                            <PenTool className="h-3 w-3 text-green-600" /> Gastos Manuais:
                          </span>
                          <span>
                            {formatCurrency(
                              unifiedExpenses
                                .filter(e => e.fonte === 'manual')
                                .reduce((sum, e) => sum + e.valor, 0)
                            )}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        {unifiedExpenses.length} movimento(s) registrado(s)
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">Nenhum gasto registrado ainda.</p>
                {showAddButton && (
                  <Button onClick={() => setIsAddingExpense(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Primeiro Gasto
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(expense.categoria_gasto)}
                      <span className="capitalize">
                        {categoryOptions.find(c => c.value === expense.categoria_gasto)?.label || expense.categoria_gasto}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(Number(expense.valor))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(expense.data_gasto).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell className="truncate">
                    {expense.descricao || "-"}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(expense.status_aprovacao || "pendente")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedExpense(expense);
                          setIsViewingDetails(true);
                        }}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {expense.status_aprovacao === "pendente" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(expense.id)}
                          disabled={approveExpense.isPending}
                          title="Aprovar"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {expense.comprovante_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openReceipt(expense.comprovante_url!)}
                          title="Ver comprovante"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Modal de Detalhes do Gasto */}
      <Dialog open={isViewingDetails} onOpenChange={setIsViewingDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Gasto</DialogTitle>
          </DialogHeader>
          
          {selectedExpense && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Categoria</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getCategoryIcon(selectedExpense.categoria_gasto)}
                    <span className="capitalize">
                      {categoryOptions.find(c => c.value === selectedExpense.categoria_gasto)?.label || selectedExpense.categoria_gasto}
                    </span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Valor</Label>
                  <p className="text-lg font-semibold mt-1">
                    {formatCurrency(Number(selectedExpense.valor))}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Data do Gasto</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(selectedExpense.data_gasto || selectedExpense.data_movimento || selectedExpense.data).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedExpense.status_aprovacao || "pendente")}
                  </div>
                </div>
              </div>

              {selectedExpense.descricao && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                  <p className="mt-1 p-3 bg-muted/50 rounded-md text-sm">
                    {selectedExpense.descricao}
                  </p>
                </div>
              )}

              {selectedExpense.aprovado_por && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Aprovado por</Label>
                  <p className="mt-1">{selectedExpense.aprovado_por}</p>
                </div>
              )}

              {selectedExpense.data_aprovacao && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Data de Aprovação</Label>
                  <p className="mt-1">
                    {new Date(selectedExpense.data_aprovacao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}

              {selectedExpense.comprovante_url && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Comprovante</Label>
                  <div className="mt-2 p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Comprovante anexado</p>
                          <p className="text-sm text-muted-foreground">
                            Clique em "Abrir" para visualizar o documento
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => openReceipt(selectedExpense.comprovante_url!)}
                        className="shrink-0"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Abrir
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-xs text-muted-foreground">
                  Criado em: {new Date(selectedExpense.created_at).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(selectedExpense.created_at).toLocaleTimeString('pt-BR')}
                </div>
                
                {selectedExpense.status_aprovacao === "pendente" && (
                  <Button
                    onClick={() => {
                      handleApprove(selectedExpense.id);
                      setIsViewingDetails(false);
                    }}
                    disabled={approveExpense.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Aprovar Gasto
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
