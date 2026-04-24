import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function RegisterInvitationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [invitationData, setInvitationData] = useState<{
    email: string;
    nome: string;
    cargo: string;
    invitedBy: string;
    token: string | null;
  }>({
    email: searchParams.get("email") || "",
    nome: "",
    cargo: searchParams.get("role") || "",
    invitedBy: searchParams.get("invitedBy") || "",
    token: searchParams.get("token"),
  });

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    nome: "",
  });

  // Validate token (or fall back to legacy email param)
  useEffect(() => {
    const validate = async () => {
      const token = searchParams.get("token");
      if (token) {
        try {
          const { data, error } = await supabase
            .from("invitations" as any)
            .select("*")
            .eq("token", token)
            .maybeSingle();

          if (error || !data) {
            setTokenError("Convite inválido ou expirado.");
            setValidating(false);
            return;
          }

          const inv = data as any;
          if (inv.status === "accepted") {
            setTokenError("Este convite já foi utilizado. Faça login normalmente.");
            setValidating(false);
            return;
          }

          if (inv.expires_at && new Date(inv.expires_at) < new Date()) {
            setTokenError("Este convite expirou. Solicite um novo convite ao administrador.");
            setValidating(false);
            return;
          }

          setInvitationData({
            email: inv.email,
            nome: inv.nome,
            cargo: inv.cargo,
            invitedBy: inv.invited_by,
            token: inv.token,
          });
          setFormData((prev) => ({ ...prev, nome: inv.nome }));
          setValidating(false);
        } catch (e: any) {
          setTokenError(e?.message || "Erro ao validar convite.");
          setValidating(false);
        }
      } else if (invitationData.email) {
        // Legacy flow: email in query string
        setValidating(false);
      } else {
        navigate("/auth");
      }
    };
    validate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    if (formData.password.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres", variant: "destructive" });
      return;
    }
    if (!formData.nome.trim()) {
      toast({ title: "Erro", description: "Por favor, digite seu nome completo", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signUp(invitationData.email, formData.password, formData.nome);

      if (error) {
        toast({ title: "Erro ao criar conta", description: error.message, variant: "destructive" });
        return;
      }

      // Mark invitation as accepted (best-effort)
      if (invitationData.token) {
        try {
          await supabase
            .from("invitations" as any)
            .update({ status: "accepted", accepted_at: new Date().toISOString() })
            .eq("token", invitationData.token);
        } catch (err) {
          console.warn("Could not mark invitation as accepted:", err);
        }
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Você será redirecionado para a página de login",
      });

      setTimeout(() => {
        navigate("/auth", {
          state: {
            message: "Conta criada com sucesso! Faça login para acessar a plataforma.",
            email: invitationData.email,
          },
        });
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Erro inesperado",
        description: error?.message || "Ocorreu um erro ao criar sua conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (validating || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Convite Inválido</CardTitle>
            <CardDescription>{tokenError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate("/auth")}>
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Bem-vindo à FOA SmartSite</CardTitle>
          <CardDescription>Complete seu registro para acessar a plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Detalhes do Convite</h3>
            <p className="text-sm text-muted-foreground"><strong>Convidado por:</strong> {invitationData.invitedBy}</p>
            <p className="text-sm text-muted-foreground"><strong>Cargo:</strong> {invitationData.cargo}</p>
            <p className="text-sm text-muted-foreground"><strong>Email:</strong> {invitationData.email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome Completo</Label>
              <Input id="nome" name="nome" type="text" placeholder="Digite seu nome completo"
                value={formData.nome} onChange={handleInputChange} required />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={invitationData.email} readOnly className="bg-muted" />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input id="password" name="password" type={showPassword ? "text" : "password"}
                  placeholder="Crie uma senha segura" value={formData.password} onChange={handleInputChange}
                  required minLength={6} />
                <Button type="button" variant="ghost" size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"}
                  placeholder="Digite a senha novamente" value={formData.confirmPassword}
                  onChange={handleInputChange} required minLength={6} />
                <Button type="button" variant="ghost" size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Criando conta..." : "Criar Conta e Acessar"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/auth")}>
                Fazer Login
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
