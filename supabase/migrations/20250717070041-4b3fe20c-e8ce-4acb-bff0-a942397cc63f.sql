
-- Temporariamente desabilitar RLS em todas as tabelas para permitir operações básicas
-- até que a autenticação seja implementada

ALTER TABLE public.projetos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.requisicoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.financas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patrimonio DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas_lean DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidentes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.epis DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fichas_tecnicas DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas RLS existentes
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.projetos;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.colaboradores;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.materiais;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.requisicoes;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.financas;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.patrimonio;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.tarefas_lean;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.dashboard_kpis;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.incidentes;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.epis;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.fichas_tecnicas;
