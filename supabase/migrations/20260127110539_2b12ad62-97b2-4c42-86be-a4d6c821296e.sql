-- =====================================================
-- COMPREHENSIVE RLS SECURITY FIX FOR ALL ERROR-LEVEL FINDINGS
-- =====================================================

-- Drop existing overly permissive policies and replace with role-based access

-- =====================================================
-- 1. AUDITORIA_MOVIMENTOS - Audit logs (read-only for directors)
-- =====================================================
DROP POLICY IF EXISTS "Allow read on auditoria_movimentos" ON public.auditoria_movimentos;

CREATE POLICY "audit_logs_select_directors"
ON public.auditoria_movimentos
FOR SELECT
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

-- =====================================================
-- 2. REEMBOLSOS_FOA_FOF - Loan repayments (finance directors only)
-- =====================================================
DROP POLICY IF EXISTS "Allow all on reembolsos_foa_fof" ON public.reembolsos_foa_fof;
DROP POLICY IF EXISTS "Allow all operations on reembolsos_foa_fof" ON public.reembolsos_foa_fof;

CREATE POLICY "reembolsos_select_finance"
ON public.reembolsos_foa_fof
FOR SELECT
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "reembolsos_insert_directors"
ON public.reembolsos_foa_fof
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "reembolsos_update_directors"
ON public.reembolsos_foa_fof
FOR UPDATE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "reembolsos_delete_directors"
ON public.reembolsos_foa_fof
FOR DELETE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

-- =====================================================
-- 3. CONTAS_CORRENTES_FORNECEDORES - Supplier accounts (finance + directors)
-- =====================================================
DROP POLICY IF EXISTS "Allow all operations on contas_correntes_fornecedores" ON public.contas_correntes_fornecedores;

CREATE POLICY "contas_fornec_select"
ON public.contas_correntes_fornecedores
FOR SELECT
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'assistente_compras'::app_role)
);

CREATE POLICY "contas_fornec_insert"
ON public.contas_correntes_fornecedores
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "contas_fornec_update"
ON public.contas_correntes_fornecedores
FOR UPDATE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "contas_fornec_delete"
ON public.contas_correntes_fornecedores
FOR DELETE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

-- =====================================================
-- 4. MATERIAIS_ARMAZEM - Warehouse inventory (warehouse + procurement)
-- =====================================================
DROP POLICY IF EXISTS "Permitir acesso completo aos materiais do armazém" ON public.materiais_armazem;

CREATE POLICY "materiais_armazem_select"
ON public.materiais_armazem
FOR SELECT
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'assistente_compras'::app_role) OR
  has_role(auth.uid(), 'encarregado_obra'::app_role)
);

CREATE POLICY "materiais_armazem_insert"
ON public.materiais_armazem
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'assistente_compras'::app_role)
);

CREATE POLICY "materiais_armazem_update"
ON public.materiais_armazem
FOR UPDATE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'assistente_compras'::app_role)
);

CREATE POLICY "materiais_armazem_delete"
ON public.materiais_armazem
FOR DELETE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

-- =====================================================
-- 5. CENTROS_CUSTO - Cost centers (managers + directors)
-- =====================================================
DROP POLICY IF EXISTS "Allow all operations on centros_custo" ON public.centros_custo;

CREATE POLICY "centros_custo_select"
ON public.centros_custo
FOR SELECT
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'encarregado_obra'::app_role)
);

CREATE POLICY "centros_custo_insert"
ON public.centros_custo
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "centros_custo_update"
ON public.centros_custo
FOR UPDATE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "centros_custo_delete"
ON public.centros_custo
FOR DELETE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

-- =====================================================
-- 6. REQUISICOES - Purchase requests (procurement + managers + directors)
-- =====================================================
DROP POLICY IF EXISTS "Allow all operations on requisicoes" ON public.requisicoes;

CREATE POLICY "requisicoes_select"
ON public.requisicoes
FOR SELECT
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'assistente_compras'::app_role) OR
  has_role(auth.uid(), 'encarregado_obra'::app_role) OR
  has_role(auth.uid(), 'departamento_hst'::app_role)
);

CREATE POLICY "requisicoes_insert"
ON public.requisicoes
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'encarregado_obra'::app_role) OR
  has_role(auth.uid(), 'departamento_hst'::app_role)
);

CREATE POLICY "requisicoes_update"
ON public.requisicoes
FOR UPDATE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'assistente_compras'::app_role)
);

CREATE POLICY "requisicoes_delete"
ON public.requisicoes
FOR DELETE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

-- =====================================================
-- 7. TAREFAS_LEAN - Tasks (project managers + directors)
-- =====================================================
DROP POLICY IF EXISTS "Allow all operations on tarefas_lean" ON public.tarefas_lean;

CREATE POLICY "tarefas_select"
ON public.tarefas_lean
FOR SELECT
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'encarregado_obra'::app_role)
);

CREATE POLICY "tarefas_insert"
ON public.tarefas_lean
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'encarregado_obra'::app_role)
);

CREATE POLICY "tarefas_update"
ON public.tarefas_lean
FOR UPDATE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'encarregado_obra'::app_role)
);

CREATE POLICY "tarefas_delete"
ON public.tarefas_lean
FOR DELETE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

-- =====================================================
-- 8. FLUXO_CAIXA - Cash flow (finance directors only)
-- =====================================================
DROP POLICY IF EXISTS "Allow all operations on fluxo_caixa" ON public.fluxo_caixa;

CREATE POLICY "fluxo_caixa_select"
ON public.fluxo_caixa
FOR SELECT
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "fluxo_caixa_insert"
ON public.fluxo_caixa
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "fluxo_caixa_update"
ON public.fluxo_caixa
FOR UPDATE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "fluxo_caixa_delete"
ON public.fluxo_caixa
FOR DELETE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

-- =====================================================
-- 9. MOVIMENTOS_FINANCEIROS - Financial transactions (finance directors only)
-- =====================================================
DROP POLICY IF EXISTS "Allow all operations on movimentos_financeiros" ON public.movimentos_financeiros;

CREATE POLICY "movimentos_select"
ON public.movimentos_financeiros
FOR SELECT
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "movimentos_insert"
ON public.movimentos_financeiros
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "movimentos_update"
ON public.movimentos_financeiros
FOR UPDATE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "movimentos_delete"
ON public.movimentos_financeiros
FOR DELETE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

-- =====================================================
-- 10. FORNECEDORES - Suppliers (procurement + directors)
-- =====================================================
DROP POLICY IF EXISTS "Allow all operations on fornecedores" ON public.fornecedores;

CREATE POLICY "fornecedores_select"
ON public.fornecedores
FOR SELECT
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'assistente_compras'::app_role)
);

CREATE POLICY "fornecedores_insert"
ON public.fornecedores
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'assistente_compras'::app_role)
);

CREATE POLICY "fornecedores_update"
ON public.fornecedores
FOR UPDATE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'assistente_compras'::app_role)
);

CREATE POLICY "fornecedores_delete"
ON public.fornecedores
FOR DELETE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

-- =====================================================
-- 11. GASTOS_DETALHADOS - Expense details (finance directors only)
-- =====================================================
DROP POLICY IF EXISTS "Allow all operations on gastos_detalhados" ON public.gastos_detalhados;
DROP POLICY IF EXISTS "Allow users to create detailed expenses" ON public.gastos_detalhados;
DROP POLICY IF EXISTS "Allow users to delete detailed expenses" ON public.gastos_detalhados;
DROP POLICY IF EXISTS "Allow users to update detailed expenses" ON public.gastos_detalhados;
DROP POLICY IF EXISTS "Allow users to view detailed expenses" ON public.gastos_detalhados;

CREATE POLICY "gastos_det_select"
ON public.gastos_detalhados
FOR SELECT
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "gastos_det_insert"
ON public.gastos_detalhados
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "gastos_det_update"
ON public.gastos_detalhados
FOR UPDATE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "gastos_det_delete"
ON public.gastos_detalhados
FOR DELETE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

-- =====================================================
-- 12. LANCAMENTOS_FORNECEDOR - Supplier ledger (finance directors only)
-- =====================================================
DROP POLICY IF EXISTS "Allow all operations on lancamentos_fornecedor" ON public.lancamentos_fornecedor;

CREATE POLICY "lancamentos_select"
ON public.lancamentos_fornecedor
FOR SELECT
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "lancamentos_insert"
ON public.lancamentos_fornecedor
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "lancamentos_update"
ON public.lancamentos_fornecedor
FOR UPDATE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "lancamentos_delete"
ON public.lancamentos_fornecedor
FOR DELETE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

-- =====================================================
-- 13. COLABORADORES - Employees (HR + directors only)
-- =====================================================
DROP POLICY IF EXISTS "Allow all operations on colaboradores" ON public.colaboradores;

CREATE POLICY "colaboradores_select"
ON public.colaboradores
FOR SELECT
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'encarregado_obra'::app_role)
);

CREATE POLICY "colaboradores_insert"
ON public.colaboradores
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "colaboradores_update"
ON public.colaboradores
FOR UPDATE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "colaboradores_delete"
ON public.colaboradores
FOR DELETE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

-- =====================================================
-- 14. PROJETOS - Projects (project managers + directors)
-- =====================================================
DROP POLICY IF EXISTS "Allow all operations on projetos" ON public.projetos;

CREATE POLICY "projetos_select"
ON public.projetos
FOR SELECT
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'encarregado_obra'::app_role) OR
  has_role(auth.uid(), 'assistente_compras'::app_role)
);

CREATE POLICY "projetos_insert"
ON public.projetos
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "projetos_update"
ON public.projetos
FOR UPDATE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "projetos_delete"
ON public.projetos
FOR DELETE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

-- =====================================================
-- 15. MATERIAIS_MOVIMENTACOES - Material movements (warehouse + directors)
-- =====================================================
DROP POLICY IF EXISTS "Allow all operations on materiais_movimentacoes" ON public.materiais_movimentacoes;

CREATE POLICY "mat_mov_select"
ON public.materiais_movimentacoes
FOR SELECT
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'assistente_compras'::app_role) OR
  has_role(auth.uid(), 'encarregado_obra'::app_role)
);

CREATE POLICY "mat_mov_insert"
ON public.materiais_movimentacoes
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'assistente_compras'::app_role)
);

CREATE POLICY "mat_mov_update"
ON public.materiais_movimentacoes
FOR UPDATE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'assistente_compras'::app_role)
);

CREATE POLICY "mat_mov_delete"
ON public.materiais_movimentacoes
FOR DELETE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

-- =====================================================
-- 16. CONTRATOS_FORNECEDORES - Supplier contracts (directors only)
-- =====================================================
DROP POLICY IF EXISTS "Allow all operations on contratos_fornecedores" ON public.contratos_fornecedores;

CREATE POLICY "contratos_forn_select"
ON public.contratos_fornecedores
FOR SELECT
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "contratos_forn_insert"
ON public.contratos_fornecedores
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "contratos_forn_update"
ON public.contratos_fornecedores
FOR UPDATE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "contratos_forn_delete"
ON public.contratos_fornecedores
FOR DELETE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

-- =====================================================
-- 17. ETAPAS_PROJETO - Project stages (managers + directors)
-- =====================================================
DROP POLICY IF EXISTS "Allow all operations on etapas_projeto" ON public.etapas_projeto;

CREATE POLICY "etapas_select"
ON public.etapas_projeto
FOR SELECT
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'encarregado_obra'::app_role)
);

CREATE POLICY "etapas_insert"
ON public.etapas_projeto
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "etapas_update"
ON public.etapas_projeto
FOR UPDATE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role) OR
  has_role(auth.uid(), 'encarregado_obra'::app_role)
);

CREATE POLICY "etapas_delete"
ON public.etapas_projeto
FOR DELETE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

-- =====================================================
-- 18. FINANCAS - Legacy finance table (directors only)
-- =====================================================
DROP POLICY IF EXISTS "Allow all operations on financas" ON public.financas;

CREATE POLICY "financas_select"
ON public.financas
FOR SELECT
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "financas_insert"
ON public.financas
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "financas_update"
ON public.financas
FOR UPDATE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);

CREATE POLICY "financas_delete"
ON public.financas
FOR DELETE
USING (
  has_role(auth.uid(), 'diretor_tecnico'::app_role) OR 
  has_role(auth.uid(), 'coordenacao_direcao'::app_role)
);