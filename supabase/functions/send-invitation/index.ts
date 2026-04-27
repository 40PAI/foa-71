import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const APP_URL = "https://foa-gest.plenuz.ao";

const roleLabels: Record<string, string> = {
  diretor_tecnico: "Diretor Técnico",
  encarregado_obra: "Encarregado de Obra",
  assistente_compras: "Assistente de Compras",
  departamento_hst: "Departamento de HST",
  coordenacao_direcao: "Coordenação/Direção",
};

const labelToRole = Object.fromEntries(
  Object.entries(roleLabels).map(([key, label]) => [label, key]),
) as Record<string, string>;

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") || "";

    if (!authHeader) {
      return json({ success: false, error: "Sessão inválida. Faça login novamente." }, 401);
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: userData, error: userError } = await callerClient.auth.getUser();
    if (userError || !userData.user) {
      return json({ success: false, error: "Sessão inválida. Faça login novamente." }, 401);
    }

    const { data: profile } = await callerClient
      .from("profiles")
      .select("nome")
      .eq("id", userData.user.id)
      .maybeSingle();

    const { data: canInvite, error: roleError } = await callerClient.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "diretor_tecnico",
    });
    const { data: canInviteAsCoordinator, error: coordinatorRoleError } = await callerClient.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "coordenacao_direcao",
    });

    if (roleError || coordinatorRoleError || (!canInvite && !canInviteAsCoordinator)) {
      return json({ success: false, error: "Sem permissão para convidar utilizadores." }, 403);
    }

    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const nome = String(body.nome || "").trim();
    const cargo = labelToRole[String(body.cargo || "")] || String(body.cargo || "");

    if (!email || !nome || !roleLabels[cargo]) {
      return json({ success: false, error: "Preencha nome, email e cargo válido." }, 400);
    }

    const invitedByName = String(body.invitedBy || profile?.nome || "Administrador");

    await adminClient
      .from("invitations")
      .update({ used_at: new Date().toISOString() })
      .eq("email", email)
      .is("used_at", null);

    const { data: invitation, error: inviteError } = await adminClient
      .from("invitations")
      .insert({
        email,
        nome,
        cargo,
        invited_by: userData.user.id,
        invited_by_name: invitedByName,
      })
      .select("token")
      .single();

    if (inviteError || !invitation?.token) {
      return json({ success: false, error: inviteError?.message || "Erro ao criar convite." }, 500);
    }

    const registrationUrl = `${APP_URL}/register-invitation?token=${encodeURIComponent(invitation.token)}`;
    const redirectTo = `${APP_URL}/register-invitation?token=${encodeURIComponent(invitation.token)}`;
    const { error: authInviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { nome, cargo, invitation_token: invitation.token },
    });

    if (authInviteError) {
      const alreadyRegistered = authInviteError.message?.toLowerCase().includes("already") ||
        authInviteError.message?.toLowerCase().includes("registered");
      if (!alreadyRegistered) {
        return json({ success: false, error: authInviteError.message }, 500);
      }
    }

    return json({
      success: true,
      message: authInviteError
        ? "Convite criado. O utilizador já existe; envie-lhe o link de registo ou peça para fazer login."
        : "Convite enviado com sucesso.",
      token: invitation.token,
      registrationUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno ao enviar convite.";
    return json({ success: false, error: message }, 500);
  }
});