import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Buscar notificações não lidas
    const { data: notificacoes, error } = await supabaseClient
      .from('notificacoes')
      .select('*')
      .eq('lida', false)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    // Aqui você pode integrar com serviços de email/SMS/webhook
    // Por exemplo: SendGrid, Twilio, etc.
    
    console.log(`${notificacoes?.length || 0} notificações pendentes`);

    // Simular envio (em produção, integrar com serviço real)
    for (const notif of notificacoes || []) {
      console.log(`Enviando notificação: ${notif.titulo}`);
      console.log(`Tipo: ${notif.tipo}, Severidade: ${notif.severidade}`);
      
      // Aqui entraria a integração real com email/SMS
      // await sendEmail(notif);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificacoes_processadas: notificacoes?.length || 0 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (error: any) {
    console.error('Error in send-notifications:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno ao processar notificações' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      },
    );
  }
});
