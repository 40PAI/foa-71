-- ==========================================
-- RE-ENABLE RLS ON CRITICAL TABLES
-- ==========================================

-- Re-enable RLS on all critical tables
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requisicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patrimonio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas_lean ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais_armazem ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ponto_diario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fichas_tecnicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos_detalhados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guias_consumo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guias_consumo_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais_movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etapas_projeto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semanas_projeto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores_projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alocacao_mensal_colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projeto_status_mensal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategorias_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppc_historico ENABLE ROW LEVEL SECURITY;