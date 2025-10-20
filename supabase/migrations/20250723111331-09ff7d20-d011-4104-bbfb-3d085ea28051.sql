
-- Verificar se a tabela existe e habilitar RLS se necessário
ALTER TABLE public.gastos_detalhados ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir SELECT (visualizar gastos)
CREATE POLICY "Allow users to view detailed expenses" ON public.gastos_detalhados
    FOR SELECT USING (true);

-- Criar política para permitir INSERT (criar gastos)
CREATE POLICY "Allow users to create detailed expenses" ON public.gastos_detalhados
    FOR INSERT WITH CHECK (true);

-- Criar política para permitir UPDATE (atualizar gastos)
CREATE POLICY "Allow users to update detailed expenses" ON public.gastos_detalhados
    FOR UPDATE USING (true);

-- Criar política para permitir DELETE (excluir gastos)
CREATE POLICY "Allow users to delete detailed expenses" ON public.gastos_detalhados
    FOR DELETE USING (true);
