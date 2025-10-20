
-- Fase 1: Corrigir Estrutura da Base de Dados
-- 1. Criar enum tipo_projeto se não existir
DO $$ BEGIN
    CREATE TYPE tipo_projeto AS ENUM ('Residencial', 'Comercial', 'Industrial', 'Infraestrutura', 'Reforma');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Adicionar colunas em falta à tabela projetos (verificar se já existem)
DO $$ BEGIN
    -- Adicionar provincia se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projetos' AND column_name = 'provincia') THEN
        ALTER TABLE public.projetos ADD COLUMN provincia TEXT;
    END IF;
    
    -- Adicionar municipio se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projetos' AND column_name = 'municipio') THEN
        ALTER TABLE public.projetos ADD COLUMN municipio TEXT;
    END IF;
    
    -- Adicionar zona_bairro se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projetos' AND column_name = 'zona_bairro') THEN
        ALTER TABLE public.projetos ADD COLUMN zona_bairro TEXT;
    END IF;
    
    -- Adicionar tipo_projeto se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projetos' AND column_name = 'tipo_projeto') THEN
        ALTER TABLE public.projetos ADD COLUMN tipo_projeto tipo_projeto;
    END IF;
    
    -- Adicionar numero_etapas se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projetos' AND column_name = 'numero_etapas') THEN
        ALTER TABLE public.projetos ADD COLUMN numero_etapas INTEGER DEFAULT 1;
    END IF;
END $$;

-- Fase 2: Implementar Segurança RLS
-- 3. Ativar RLS em todas as tabelas públicas que não têm
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fichas_tecnicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patrimonio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requisicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas_lean ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de segurança para acesso completo (temporário até implementar autenticação)
-- Colaboradores
CREATE POLICY "Allow all operations on colaboradores" ON public.colaboradores
  FOR ALL USING (true) WITH CHECK (true);

-- Dashboard KPIs
CREATE POLICY "Allow all operations on dashboard_kpis" ON public.dashboard_kpis
  FOR ALL USING (true) WITH CHECK (true);

-- EPIs
CREATE POLICY "Allow all operations on epis" ON public.epis
  FOR ALL USING (true) WITH CHECK (true);

-- Fichas Técnicas
CREATE POLICY "Allow all operations on fichas_tecnicas" ON public.fichas_tecnicas
  FOR ALL USING (true) WITH CHECK (true);

-- Finanças
CREATE POLICY "Allow all operations on financas" ON public.financas
  FOR ALL USING (true) WITH CHECK (true);

-- Incidentes
CREATE POLICY "Allow all operations on incidentes" ON public.incidentes
  FOR ALL USING (true) WITH CHECK (true);

-- Materiais
CREATE POLICY "Allow all operations on materiais" ON public.materiais
  FOR ALL USING (true) WITH CHECK (true);

-- Patrimônio
CREATE POLICY "Allow all operations on patrimonio" ON public.patrimonio
  FOR ALL USING (true) WITH CHECK (true);

-- Projetos
CREATE POLICY "Allow all operations on projetos" ON public.projetos
  FOR ALL USING (true) WITH CHECK (true);

-- Requisições
CREATE POLICY "Allow all operations on requisicoes" ON public.requisicoes
  FOR ALL USING (true) WITH CHECK (true);

-- Tarefas Lean
CREATE POLICY "Allow all operations on tarefas_lean" ON public.tarefas_lean
  FOR ALL USING (true) WITH CHECK (true);

-- 5. Adicionar foreign keys para integridade referencial
-- Colaboradores -> Projetos
ALTER TABLE public.colaboradores 
ADD CONSTRAINT fk_colaboradores_projeto 
FOREIGN KEY (projeto_id) REFERENCES public.projetos(id) ON DELETE SET NULL;

-- Finanças -> Projetos
ALTER TABLE public.financas 
ADD CONSTRAINT fk_financas_projeto 
FOREIGN KEY (id_projeto) REFERENCES public.projetos(id) ON DELETE CASCADE;

-- Incidentes -> Projetos
ALTER TABLE public.incidentes 
ADD CONSTRAINT fk_incidentes_projeto 
FOREIGN KEY (id_projeto) REFERENCES public.projetos(id) ON DELETE CASCADE;

-- Requisições -> Projetos
ALTER TABLE public.requisicoes 
ADD CONSTRAINT fk_requisicoes_projeto 
FOREIGN KEY (id_projeto) REFERENCES public.projetos(id) ON DELETE CASCADE;

-- Requisições -> Materiais
ALTER TABLE public.requisicoes 
ADD CONSTRAINT fk_requisicoes_material 
FOREIGN KEY (id_material) REFERENCES public.materiais(id) ON DELETE SET NULL;

-- Tarefas Lean -> Projetos
ALTER TABLE public.tarefas_lean 
ADD CONSTRAINT fk_tarefas_projeto 
FOREIGN KEY (id_projeto) REFERENCES public.projetos(id) ON DELETE CASCADE;

-- Patrimônio -> Projetos (alocação)
ALTER TABLE public.patrimonio 
ADD CONSTRAINT fk_patrimonio_projeto 
FOREIGN KEY (alocado_projeto_id) REFERENCES public.projetos(id) ON DELETE SET NULL;

-- Dashboard KPIs -> Projetos
ALTER TABLE public.dashboard_kpis 
ADD CONSTRAINT fk_dashboard_kpis_projeto 
FOREIGN KEY (projeto_id) REFERENCES public.projetos(id) ON DELETE CASCADE;

-- Fichas Técnicas -> Materiais
ALTER TABLE public.fichas_tecnicas 
ADD CONSTRAINT fk_fichas_tecnicas_material 
FOREIGN KEY (id_material) REFERENCES public.materiais(id) ON DELETE CASCADE;

-- Materiais Armazém -> Projetos (alocação)
ALTER TABLE public.materiais_armazem 
ADD CONSTRAINT fk_materiais_armazem_projeto 
FOREIGN KEY (projeto_alocado_id) REFERENCES public.projetos(id) ON DELETE SET NULL;

-- Colaboradores Projetos -> Colaboradores e Projetos
ALTER TABLE public.colaboradores_projetos 
ADD CONSTRAINT fk_colaboradores_projetos_colaborador 
FOREIGN KEY (colaborador_id) REFERENCES public.colaboradores(id) ON DELETE CASCADE;

ALTER TABLE public.colaboradores_projetos 
ADD CONSTRAINT fk_colaboradores_projetos_projeto 
FOREIGN KEY (projeto_id) REFERENCES public.projetos(id) ON DELETE CASCADE;

-- Ponto Diário -> Colaboradores e Projetos
ALTER TABLE public.ponto_diario 
ADD CONSTRAINT fk_ponto_diario_colaborador 
FOREIGN KEY (colaborador_id) REFERENCES public.colaboradores(id) ON DELETE CASCADE;

ALTER TABLE public.ponto_diario 
ADD CONSTRAINT fk_ponto_diario_projeto 
FOREIGN KEY (projeto_id) REFERENCES public.projetos(id) ON DELETE CASCADE;

-- Fase 3: Corrigir Triggers e Funções
-- 6. Corrigir função update_updated_at_column com search_path seguro
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- 7. Adicionar trigger updated_at à tabela epis se não existir
DROP TRIGGER IF EXISTS update_epis_updated_at ON public.epis;
CREATE TRIGGER update_epis_updated_at
    BEFORE UPDATE ON public.epis
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Verificar e adicionar triggers para outras tabelas se necessário
DROP TRIGGER IF EXISTS update_colaboradores_updated_at ON public.colaboradores;
CREATE TRIGGER update_colaboradores_updated_at
    BEFORE UPDATE ON public.colaboradores
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_dashboard_kpis_updated_at ON public.dashboard_kpis;
CREATE TRIGGER update_dashboard_kpis_updated_at
    BEFORE UPDATE ON public.dashboard_kpis
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_fichas_tecnicas_updated_at ON public.fichas_tecnicas;
CREATE TRIGGER update_fichas_tecnicas_updated_at
    BEFORE UPDATE ON public.fichas_tecnicas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_financas_updated_at ON public.financas;
CREATE TRIGGER update_financas_updated_at
    BEFORE UPDATE ON public.financas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_incidentes_updated_at ON public.incidentes;
CREATE TRIGGER update_incidentes_updated_at
    BEFORE UPDATE ON public.incidentes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_materiais_updated_at ON public.materiais;
CREATE TRIGGER update_materiais_updated_at
    BEFORE UPDATE ON public.materiais
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_materiais_armazem_updated_at ON public.materiais_armazem;
CREATE TRIGGER update_materiais_armazem_updated_at
    BEFORE UPDATE ON public.materiais_armazem
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_patrimonio_updated_at ON public.patrimonio;
CREATE TRIGGER update_patrimonio_updated_at
    BEFORE UPDATE ON public.patrimonio
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_projetos_updated_at ON public.projetos;
CREATE TRIGGER update_projetos_updated_at
    BEFORE UPDATE ON public.projetos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_requisicoes_updated_at ON public.requisicoes;
CREATE TRIGGER update_requisicoes_updated_at
    BEFORE UPDATE ON public.requisicoes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_tarefas_lean_updated_at ON public.tarefas_lean;
CREATE TRIGGER update_tarefas_lean_updated_at
    BEFORE UPDATE ON public.tarefas_lean
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_colaboradores_projetos_updated_at ON public.colaboradores_projetos;
CREATE TRIGGER update_colaboradores_projetos_updated_at
    BEFORE UPDATE ON public.colaboradores_projetos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_ponto_diario_updated_at ON public.ponto_diario;
CREATE TRIGGER update_ponto_diario_updated_at
    BEFORE UPDATE ON public.ponto_diario
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Atualizar projetos existentes com valores padrão
UPDATE public.projetos SET numero_etapas = 1 WHERE numero_etapas IS NULL;
UPDATE public.projetos SET tipo_projeto = 'Residencial' WHERE tipo_projeto IS NULL;
