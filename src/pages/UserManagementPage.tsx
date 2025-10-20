import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfiles, useUpdateProfile, useInviteUser } from "@/hooks/useProfiles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { UserPlus, Users, Settings, Shield, AlertTriangle } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const roleLabels = {
  diretor_tecnico: 'Diretor Técnico',
  encarregado_obra: 'Encarregado de Obra',
  assistente_compras: 'Assistente de Compras',
  departamento_hst: 'Departamento de HST',
  coordenacao_direcao: 'Coordenação/Direção'
};

const roleColors = {
  diretor_tecnico: 'bg-red-100 text-red-800',
  encarregado_obra: 'bg-blue-100 text-blue-800',
  assistente_compras: 'bg-green-100 text-green-800',
  departamento_hst: 'bg-yellow-100 text-yellow-800',
  coordenacao_direcao: 'bg-purple-100 text-purple-800'
};

export function UserManagementPage() {
  const { isDirector } = useAuth();
  const { data: profiles, isLoading } = useProfiles();
  const updateProfile = useUpdateProfile();
  const inviteUser = useInviteUser();
  
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const [inviteForm, setInviteForm] = useState({
    nome: '',
    email: '',
    cargo: 'encarregado_obra'
  });

  if (!isDirector()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">
            Apenas Diretores Técnicos podem gerenciar usuários.
          </p>
        </div>
      </div>
    );
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await inviteUser.mutateAsync(inviteForm);
    
    setInviteForm({
      nome: '',
      email: '',
      cargo: 'encarregado_obra'
    });
    setInviteModalOpen(false);
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    await updateProfile.mutateAsync({ id: userId, updates });
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    await handleUpdateUser(userId, { ativo: !currentStatus });
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <ProtectedRoute module="user_management">
      <div className="w-full space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
            <p className="text-muted-foreground">
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
                  <Button type="submit" disabled={inviteUser.isPending} className="flex-1">
                    {inviteUser.isPending ? 'Enviando...' : 'Enviar Convite'}
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários Ativos ({profiles?.filter(p => p.ativo).length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles?.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">{profile.nome}</TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>
                        <Badge className={roleColors[profile.cargo]}>
                          {roleLabels[profile.cargo]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={profile.ativo}
                            onCheckedChange={() => handleToggleUserStatus(profile.id, profile.ativo)}
                            disabled={updateProfile.isPending}
                          />
                          <span className="text-sm">
                            {profile.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(profile);
                            setEditUserModalOpen(true);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                <h4 className="font-semibold text-red-800">Diretor Técnico</h4>
                <p className="text-sm text-muted-foreground">
                  Acesso completo: Criação de projetos, aprovação de requisições, gestão de pessoal, 
                  criação de tarefas, convite de usuários e alteração de permissões.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-800">Encarregado de Obra</h4>
                <p className="text-sm text-muted-foreground">
                  Criação de requisições, gestão de tarefas. Acesso restrito às suas obras.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-green-800">Assistente de Compras</h4>
                <p className="text-sm text-muted-foreground">
                  Acesso ao armazém: entrada, movimentação e saída de materiais.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-yellow-800">Departamento de HST</h4>
                <p className="text-sm text-muted-foreground">
                  Criação de requisições, registro de ocorrências de segurança e acompanhamento de SST.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-800">Coordenação/Direção</h4>
                <p className="text-sm text-muted-foreground">
                  Acesso total ao sistema para visualização. Não pode alterar permissões de usuários.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}