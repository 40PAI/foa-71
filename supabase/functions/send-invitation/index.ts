import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  nome: string;
  cargo: string;
  invitedBy: string;
}

const APP_URL = "https://foa-gest.plenuz.ao";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "RESEND_API_KEY não configurada. Adicione a chave em Cloud → Secrets antes de enviar convites.",
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const resend = new Resend(RESEND_API_KEY);

    const body: InvitationRequest = await req.json();
    const { email, nome, cargo, invitedBy } = body;

    if (!email || !nome || !cargo) {
      return new Response(
        JSON.stringify({ success: false, error: "Campos obrigatórios em falta (email, nome, cargo)" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Creating invitation for:", email, "role:", cargo);

    // 1) Try to record invitation token in DB (best-effort).
    let inviteToken: string | null = null;
    try {
      const { data: invite, error: insertError } = await supabase
        .from("invitations")
        .insert({
          email,
          nome,
          cargo,
          invited_by: invitedBy || "Equipe FOA",
          status: "pending",
        })
        .select("token")
        .single();

      if (insertError) {
        console.warn("Could not insert invitation row (continuing without token):", insertError.message);
      } else {
        inviteToken = invite?.token ?? null;
      }
    } catch (e) {
      console.warn("Invitations table not available, falling back to legacy URL", e);
    }

    // 2) Build registration URL — token-based when available, fallback to legacy params
    const registrationUrl = inviteToken
      ? `${APP_URL}/register-invitation?token=${encodeURIComponent(inviteToken)}`
      : `${APP_URL}/register-invitation?email=${encodeURIComponent(email)}&role=${encodeURIComponent(cargo)}&invitedBy=${encodeURIComponent(invitedBy)}`;

    // 3) Send email
    const fromAddress = "Equipe FOA <onboarding@resend.dev>";

    const emailResponse = await resend.emails.send({
      from: fromAddress,
      to: [email],
      subject: "Convite para acessar a Plataforma FOA SmartSite",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; text-align: center;">Convite para Plataforma FOA SmartSite</h1>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Olá ${nome}!</h2>
            <p>Você foi convidado(a) por <strong>${invitedBy || "Equipe FOA"}</strong> para fazer parte da equipe na Plataforma FOA SmartSite.</p>
            <div style="background-color: #e0f2fe; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p><strong>Cargo atribuído:</strong> ${cargo}</p>
              <p><strong>Email de acesso:</strong> ${email}</p>
            </div>
            <p>Para criar sua conta e acessar a plataforma, clique no link abaixo:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${registrationUrl}"
                 style="background-color: #2563eb; color: white; padding: 12px 24px;
                        text-decoration: none; border-radius: 6px; display: inline-block;">
                Criar Conta e Acessar Plataforma
              </a>
            </div>
            <p style="font-size: 12px; color: #64748b;">Este convite expira em 7 dias.</p>
          </div>
          <div style="text-align: center; color: #64748b; font-size: 14px; margin-top: 30px;">
            <p>Se você não esperava este convite, pode ignorar este email.</p>
            <p>© 2025 FOA SmartSite</p>
          </div>
        </div>
      `,
    });

    if ((emailResponse as any)?.error) {
      const err = (emailResponse as any).error;
      console.error("Resend error:", err);
      return new Response(
        JSON.stringify({
          success: false,
          error: err?.message || "Falha ao enviar email pelo Resend",
          details: err,
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Email sent:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Convite enviado com sucesso!",
        emailId: (emailResponse as any)?.data?.id,
        token: inviteToken,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-invitation function:", error);
    let errorMessage = error?.message || "Erro interno ao enviar convite";
    if (errorMessage?.includes?.("API key")) {
      errorMessage = "Chave do Resend inválida. Verifique RESEND_API_KEY.";
    } else if (errorMessage?.includes?.("domain")) {
      errorMessage =
        "Domínio do remetente não verificado no Resend. Verifique seu domínio em resend.com/domains ou use o remetente de teste.";
    } else if (errorMessage?.includes?.("rate limit")) {
      errorMessage = "Limite de envios atingido. Tente novamente em alguns minutos.";
    }
    return new Response(
      JSON.stringify({ success: false, error: errorMessage, details: error?.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
