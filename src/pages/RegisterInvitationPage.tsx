import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type InvitationStatus = "valid" | "used" | "expired" | "invalid";

export function RegisterInvitationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp, user, refreshProfile } = useAuth();
  const { toast } = useToast();

  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [status, setStatus] = useState<InvitationStatus>("invalid");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [invitationData, setInvitationData] = useState({
    email: "",
    nome: "",
    cargo: "",
    invitedBy: "Equipe FOA",
  });
  const [formData, setFormData] = useState({ password: "", confirmPassword: "", nome: "" });

  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setStatus("invalid");
        setValidating(false);
        return;
      }

      const { data, error } = await supabase.rpc("validate_invitation" as any, { p_token: token });
      const invitation = Array.isArray(data) ? data[0] : null;

      if (error || !invitation) {
        setStatus("invalid");
        setValidating(false);
        return;
      }

      setStatus(invitation.status as InvitationStatus);
      setInvitationData({
        email: invitation.email,
        nome: invitation.nome,
        cargo: invitation.cargo,
        invitedBy: invitation.invited_by_name || "Equipe FOA",
      });
      setFormData((prev) => ({ ...prev, nome: invitation.nome || "" }));
      setValidating(false);
    };

    validate();
  }, [token]);

  const acceptExistingUserInvitation = async () => {
    if (!token || !user) return;
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    if (formData.password.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error: passwordError } = await supabase.auth.updateUser({ password: formData.password });
      if (passwordError) throw passwordError;
      const { data, error } = await supabase.rpc("accept_invitation" as any, { p_token: token });
      if (error || !data?.success) throw new Error(data?.error || error?.message || "Erro ao aceitar convite.");
      await refreshProfile();
      toast({ title: "Convite aceite", description: "A sua conta foi ativada com sucesso." });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    if (formData.password.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres", variant: "destructive" });
      return;
    }
    if (!formData.nome.trim()) {
      toast({ title: "Erro", description: "Digite o nome completo", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const redirectTo = `${window.location.origin}/register-invitation?token=${encodeURIComponent(token)}`;
      const { data, error } = await signUp(invitationData.email, formData.password, formData.nome, redirectTo);
      if (error) throw error;

      const activeUser = user || data.user;
      const activeSession = data.session;

      if (activeUser && activeSession) {
        const { data: accepted, error: acceptError } = await supabase.rpc("accept_invitation" as any, { p_token: token });
        if (acceptError || !accepted?.success) {
          throw new Error(accepted?.error || acceptError?.message || "Erro ao ativar convite.");
        }
        await refreshProfile();
        toast({ title: "Conta ativada", description: "O seu acesso foi criado com sucesso." });
        navigate("/");
        return;
      }

      toast({
        title: "Conta criada com sucesso",
        description: "Abra o email recebido para confirmar o acesso e concluir a ativação.",
      });
      navigate("/auth", { state: { email: invitationData.email } });
    } catch (error: any) {
      const alreadyExists = error.message?.toLowerCase?.().includes("already") || error.message?.includes("registered");
      toast({
        title: alreadyExists ? "Conta já existente" : "Erro ao criar conta",
        description: alreadyExists
          ? "Este email já tem conta. Faça login e volte a abrir o convite para ativar o acesso."
          : error.message,
        variant: alreadyExists ? "default" : "destructive",
      });
      if (alreadyExists) navigate("/auth", { state: { email: invitationData.email } });
    } finally {
      setIsLoading(false);
    }
  };

  if (validating || isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  if (status !== "valid") {
    const message = status === "used" ? "Este convite já foi utilizado. Faça login normalmente." :
      status === "expired" ? "Este convite expirou. Solicite um novo convite ao administrador." :
      "Convite inválido ou inexistente.";
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Convite indisponível</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent><Button className="w-full" onClick={() => navigate("/auth")}>Ir para Login</Button></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Bem-vindo à FOA SmartSite</CardTitle>
          <CardDescription>Complete o registo para acessar a plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg mb-6 space-y-1">
            <p className="text-sm text-muted-foreground"><strong>Convidado por:</strong> {invitationData.invitedBy}</p>
            <p className="text-sm text-muted-foreground"><strong>Cargo:</strong> {invitationData.cargo}</p>
            <p className="text-sm text-muted-foreground break-all"><strong>Email:</strong> {invitationData.email}</p>
          </div>

          {user ? (
            <div className="space-y-4 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
              <p className="text-sm text-muted-foreground">Defina a sua senha e aceite o convite para ativar o acesso nesta conta.</p>
              <div className="text-left space-y-4">
                <div>
                  <Label htmlFor="existing-password">Senha</Label>
                  <Input id="existing-password" type="password" value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} required minLength={6} />
                </div>
                <div>
                  <Label htmlFor="existing-confirm-password">Confirmar Senha</Label>
                  <Input id="existing-confirm-password" type="password" value={formData.confirmPassword} onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))} required minLength={6} />
                </div>
              </div>
              <Button className="w-full" onClick={acceptExistingUserInvitation}>Definir Senha e Aceitar Convite</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label htmlFor="nome">Nome Completo</Label><Input id="nome" value={formData.nome} onChange={(e) => setFormData((p) => ({ ...p, nome: e.target.value }))} required /></div>
              <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={invitationData.email} readOnly className="bg-muted" /></div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <div className="relative"><Input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} required minLength={6} /><Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative"><Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))} required minLength={6} /><Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div>
              </div>
              <Button type="submit" className="w-full">Criar Conta e Acessar</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}