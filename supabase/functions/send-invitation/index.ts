import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationRequest {
  email: string;
  nome: string;
  cargo: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Create client with user's auth for permission checking
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Create service client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user's JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getUser(token);
    
    if (claimsError || !claimsData?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const userId = claimsData.user.id;

    // Check if user has director or coordinator role
    const { data: hasDirectorRole } = await supabaseAdmin.rpc('has_role', {
      _user_id: userId,
      _role: 'diretor_tecnico'
    });

    const { data: hasCoordRole } = await supabaseAdmin.rpc('has_role', {
      _user_id: userId,
      _role: 'coordenacao_direcao'
    });

    if (!hasDirectorRole && !hasCoordRole) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Insufficient permissions' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get inviter's name for the email
    const { data: inviterProfile } = await supabaseAdmin
      .from('profiles')
      .select('nome')
      .eq('id', userId)
      .single();
    
    const inviterName = inviterProfile?.nome || 'Administrador';

    // Parse and validate request body
    const body = await req.json();
    const { email, nome, cargo } = body as InvitationRequest;

    // Validate required fields
    if (!email || !nome || !cargo) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, nome, cargo' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate cargo against allowed roles
    const validRoles = ['diretor_tecnico', 'encarregado_obra', 'assistente_compras', 'departamento_hst', 'coordenacao_direcao'];
    if (!validRoles.includes(cargo)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role specified' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Creating invitation for:', email, 'role:', cargo, 'by:', inviterName);

    // Create invitation record with secure token
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('invitations')
      .insert({
        email: email.toLowerCase().trim(),
        nome: nome.trim(),
        cargo: cargo,
        token: invitationToken,
        invited_by: userId,
        invited_by_name: inviterName,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating invitation:', inviteError);
      return new Response(
        JSON.stringify({ error: 'Failed to create invitation', details: inviteError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Send invitation email using Resend
    const inviteUrl = `https://waridu.plenuz.ao/register-invitation?token=${invitationToken}`;
    
    const emailResponse = await resend.emails.send({
      from: 'Equipe FOA <noreply@waridu.plenuz.ao>',
      to: [email],
      subject: 'Convite para acessar a Plataforma FOA SmartSite',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; text-align: center;">Convite para Plataforma FOA SmartSite</h1>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Olá ${nome}!</h2>
            <p>Você foi convidado(a) por <strong>${inviterName}</strong> para fazer parte da equipe na Plataforma FOA SmartSite.</p>
            
            <div style="background-color: #e0f2fe; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p><strong>Cargo atribuído:</strong> ${cargo}</p>
              <p><strong>Email de acesso:</strong> ${email}</p>
            </div>
            
            <p>Para criar sua conta e acessar a plataforma, clique no link abaixo:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; display: inline-block;">
                Criar Conta e Acessar Plataforma
              </a>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 20px;">
              <h3>Como proceder:</h3>
              <ol>
                <li>Clique no link acima para criar sua conta</li>
                <li>Crie uma senha segura para sua conta</li>
                <li>Após o registro, faça login para acessar a plataforma</li>
              </ol>
            </div>
            
            <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
              Este convite expira em 7 dias. Se você não esperava este convite, pode ignorar este email.
            </p>
          </div>
          
          <div style="text-align: center; color: #64748b; font-size: 14px; margin-top: 30px;">
            <p>© 2025 FOA SmartSite - Plataforma de Gestão de Projetos</p>
          </div>
        </div>
      `,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Convite enviado com sucesso!',
      emailId: emailResponse.data?.id,
      invitationId: invitation.id
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-invitation function:', error);
    
    // Handle specific Resend errors
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
      error: errorMessage,
      details: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json', 
        ...corsHeaders 
      },
    });
  }
});
