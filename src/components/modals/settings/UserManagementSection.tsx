import { useState } from "react";
import { useProfiles, useUpdateProfile } from "@/hooks/useProfiles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Users, Settings, Shield, AlertTriangle, Edit } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useSonnerToast } from "@/hooks/use-sonner-toast";

const roleLabels = {
  diretor_tecnico: 'Diretor Técnico',
  encarregado_obra: 'Encarregado de Obra',
  assistente_compras: 'Assistente de Compras',
  departamento_hst: 'Departamento de HST',
  coordenacao_direcao: 'Coordenação/Direção'
};

const roleColors = {
  diretor_tecnico: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  encarregado_obra: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  assistente_compras: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  departamento_hst: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  coordenacao_direcao: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
};

export function UserManagementSection() {
  const { profile } = useAuth();
  const { data: profiles, isLoading, refetch } = useProfiles();
  const updateProfile = useUpdateProfile();
  const toast = useSonnerToast();
  
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isInviting, setIsInviting] = useState(false);
  
  const [inviteForm, setInviteForm] = useState({
    nome: '',
    email: '',
    cargo: 'encarregado_obra'
  });

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    
    try {
      console.log('Enviando convite para:', inviteForm.email);
      
      // Send invitation using the edge function
      const { data, error } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: inviteForm.email,
          nome: inviteForm.nome,
          cargo: roleLabels[inviteForm.cargo as keyof typeof roleLabels],
          invitedBy: profile?.nome || 'Administrador'
        }
      });

      console.log('Resposta da edge function:', { data, error });

      if (error) {
        console.error('Erro ao enviar convite:', error);
        toast.error('Erro ao enviar convite', error.message || 'Tente novamente mais tarde');
        setIsInviting(false);
        return;
      }

      const result = data as { success: boolean; message: string; error?: string };
      
      if (result?.success) {
        toast.success('Convite enviado!', result.message || 'O utilizador receberá um email com instruções.');
        
        // Reset form and close modal
        setInviteForm({
          nome: '',
          email: '',
          cargo: 'encarregado_obra'
        });
        setInviteModalOpen(false);
        
        // Refresh the profiles list
        refetch();
      } else {
        toast.error('Erro ao enviar convite', result?.error || 'Tente novamente');
      }
    } catch (error: any) {
      console.error('Erro ao enviar convite:', error);
      toast.error('Erro inesperado', error?.message || 'Não foi possível enviar o convite. Tente novamente.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    await updateProfile.mutateAsync({ id: userId, updates });
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    await handleUpdateUser(userId, { ativo: !currentStatus });
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header com ação de convidar */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Gestão de Usuários</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie usuários e permissões do sistema
          </p>
        </div>
        
        <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Convidar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Novo Usuário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={inviteForm.nome}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="cargo">Cargo/Perfil</Label>
                <Select 
                  value={inviteForm.cargo} 
                  onValueChange={(value) => setInviteForm(prev => ({ ...prev, cargo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isInviting} className="flex-1">
                  {isInviting ? 'Enviando...' : 'Enviar Convite'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setInviteModalOpen(false)}
                >
                  Cancelar  
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários Ativos ({profiles?.filter(p => p.ativo).length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profiles?.map((userProfile) => (
              <div key={userProfile.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={userProfile.foto_perfil_url || ""} />
                    <AvatarFallback>
                      {userProfile.nome.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h4 className="font-medium">{userProfile.nome}</h4>
                    <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                    <Badge className={`mt-1 ${roleColors[userProfile.cargo]}`}>
                      {roleLabels[userProfile.cargo]}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={userProfile.ativo}
                      onCheckedChange={() => handleToggleUserStatus(userProfile.id, userProfile.ativo)}
                      disabled={updateProfile.isPending}
                    />
                    <span className="text-sm">
                      {userProfile.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(userProfile);
                      setEditUserModalOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={editUserModalOpen} onOpenChange={setEditUserModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário: {selectedUser?.nome}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label>Cargo/Perfil</Label>
                <Select 
                  value={selectedUser.cargo}
                  onValueChange={(value) => {
                    handleUpdateUser(selectedUser.id, { cargo: value });
                    setSelectedUser(prev => ({ ...prev, cargo: value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Status do Usuário</h4>
                  <p className="text-sm text-muted-foreground">
                    Usuários inativos não podem acessar o sistema
                  </p>
                </div>
                <Switch
                  checked={selectedUser.ativo}
                  onCheckedChange={(checked) => {
                    handleToggleUserStatus(selectedUser.id, selectedUser.ativo);
                    setSelectedUser(prev => ({ ...prev, ativo: checked }));
                  }}
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setEditUserModalOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Permissions Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Matriz de Permissões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-red-800 dark:text-red-200">Diretor Técnico</h4>
              <p className="text-sm text-muted-foreground">
                Acesso completo: Criação de projetos, aprovação de requisições, gestão de pessoal, 
                criação de tarefas, convite de usuários e alteração de permissões.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-800 dark:text-purple-200">Coordenação/Direção</h4>
              <p className="text-sm text-muted-foreground">
                Acesso total ao sistema para visualização e gestão de usuários. Pode convidar e editar usuários.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">Encarregado de Obra</h4>
              <p className="text-sm text-muted-foreground">
                Criação de requisições, gestão de tarefas. Acesso restrito às suas obras.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-green-800 dark:text-green-200">Assistente de Compras</h4>
              <p className="text-sm text-muted-foreground">
                Acesso ao armazém: entrada, movimentação e saída de materiais.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Departamento de HST</h4>
              <p className="text-sm text-muted-foreground">
                Criação de requisições, registro de ocorrências de segurança e acompanhamento de SST.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}