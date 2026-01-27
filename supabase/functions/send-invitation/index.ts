import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

// CORS restrito para domínios específicos (Segurança)
const allowedOrigins = [
  'https://waridu.plenuz.ao',
  'https://foa-71.lovable.app',
  'https://id-preview--1e652bca-993a-42a7-9ea2-bb2f10a775b5.lovable.app'
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = origin && (allowedOrigins.includes(origin) || origin.includes('lovable'));
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

interface InvitationRequest {
  email: string;
  nome: string;
  cargo: string;
  invitedBy: string;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validar autenticação e permissão
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Não autorizado' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Criar cliente Supabase com o token do usuário
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Validar token e obter claims
    const token = authHeader.replace('Bearer ', '');
    const { data: authData, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !authData?.user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token inválido' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const userId = authData.user.id;

    // Verificar se o usuário tem permissão para convidar (diretor ou coordenação)
    const { data: userRoles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (rolesError) {
      console.error('Error checking user roles:', rolesError);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao verificar permissões' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const allowedRoles = ['diretor_tecnico', 'coordenacao_direcao'];
    const hasPermission = userRoles?.some(r => allowedRoles.includes(r.role));

    if (!hasPermission) {
      return new Response(
        JSON.stringify({ success: false, error: 'Permissão negada. Apenas diretores podem convidar usuários.' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { email, nome, cargo, invitedBy }: InvitationRequest = await req.json();

    // Validar campos obrigatórios
    if (!email || !nome || !cargo) {
      return new Response(
        JSON.stringify({ success: false, error: 'Campos obrigatórios: email, nome, cargo' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Sending invitation to:', email, 'for role:', cargo);

    // Send invitation email using Resend
    const emailResponse = await resend.emails.send({
      from: 'Equipe FOA <noreply@waridu.plenuz.ao>',
      to: [email],
      subject: 'Convite para acessar a Plataforma FOA SmartSite',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; text-align: center;">Convite para Plataforma FOA SmartSite</h1>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Olá ${nome}!</h2>
            <p>Você foi convidado(a) por <strong>${invitedBy}</strong> para fazer parte da equipe na Plataforma FOA SmartSite.</p>
            
            <div style="background-color: #e0f2fe; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p><strong>Cargo atribuído:</strong> ${cargo}</p>
              <p><strong>Email de acesso:</strong> ${email}</p>
            </div>
            
            <p>Para criar sua conta e acessar a plataforma, clique no link abaixo:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://waridu.plenuz.ao/register-invitation?email=${encodeURIComponent(email)}&role=${encodeURIComponent(cargo)}&invitedBy=${encodeURIComponent(invitedBy)}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; display: inline-block;">
                Criar Conta e Acessar Plataforma
              </a>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 20px;">
              <h3>Como proceder:</h3>
              <ol>
                <li>Clique no link acima para criar sua conta</li>
                <li>Confirme seu email: <strong>${email}</strong></li>
                <li>Crie uma senha segura para sua conta</li>
                <li>Após o registro, faça login para acessar a plataforma</li>
              </ol>
            </div>
          </div>
          
          <div style="text-align: center; color: #64748b; font-size: 14px; margin-top: 30px;">
            <p>Se você não esperava este convite, pode ignorar este email.</p>
            <p>© 2025 FOA SmartSite - Plataforma de Gestão de Projetos</p>
          </div>
        </div>
      `,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Convite enviado com sucesso!',
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-invitation function:', error);
    
    // Não expor detalhes do erro em produção
    let errorMessage = 'Erro interno ao enviar convite';
    if (error.message?.includes('API key')) {
      errorMessage = 'Erro de configuração do email. Contate o administrador.';
    } else if (error.message?.includes('domain')) {
      errorMessage = 'Domínio de email não verificado. Contate o administrador.';
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'Muitos emails enviados. Tente novamente em alguns minutos.';
    }

    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage
      // Removido: details: error.message (segurança)
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json', 
        ...corsHeaders 
      },
    });
  }
});
