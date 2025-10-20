-- Criar tabela fluxo_caixa
CREATE TABLE IF NOT EXISTS public.fluxo_caixa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id INTEGER NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
  
  -- Tipo de movimentação
  tipo_movimento TEXT NOT NULL CHECK (tipo_movimento IN ('entrada', 'saida')),
  
  -- Valores
  valor NUMERIC NOT NULL CHECK (valor > 0),
  
  -- Datas
  data_movimento DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Categorização
  categoria TEXT NOT NULL,
  subcategoria TEXT,
  descricao TEXT NOT NULL,
  
  -- Relacionamento com projeto/etapa/tarefa
  etapa_id INTEGER REFERENCES public.etapas_projeto(id) ON DELETE SET NULL,
  tarefa_id INTEGER REFERENCES public.tarefas_lean(id) ON DELETE SET NULL,
  
  -- Informações adicionais
  fornecedor_beneficiario TEXT,
  forma_pagamento TEXT CHECK (forma_pagamento IN ('dinheiro', 'transferencia', 'cheque', 'cartao', 'boleto', 'pix')),
  numero_documento TEXT,
  
  -- Anexos
  comprovante_url TEXT,
  
  -- Observações
  observacoes TEXT,
  
  -- Audit
  responsavel_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_fluxo_caixa_projeto ON public.fluxo_caixa(projeto_id);
CREATE INDEX idx_fluxo_caixa_tipo ON public.fluxo_caixa(tipo_movimento);
CREATE INDEX idx_fluxo_caixa_data ON public.fluxo_caixa(data_movimento);

-- RLS Policies
ALTER TABLE public.fluxo_caixa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on fluxo_caixa" 
ON public.fluxo_caixa FOR ALL 
USING (true) 
WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER update_fluxo_caixa_updated_at
  BEFORE UPDATE ON public.fluxo_caixa
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Database Function para Calcular Resumo
CREATE OR REPLACE FUNCTION public.get_fluxo_caixa_summary(project_id INTEGER)
RETURNS TABLE(
  total_entradas NUMERIC,
  total_saidas NUMERIC,
  saldo NUMERIC,
  total_movimentos BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN tipo_movimento = 'entrada' THEN valor ELSE 0 END), 0) as total_entradas,
    COALESCE(SUM(CASE WHEN tipo_movimento = 'saida' THEN valor ELSE 0 END), 0) as total_saidas,
    COALESCE(
      SUM(CASE WHEN tipo_movimento = 'entrada' THEN valor ELSE 0 END) -
      SUM(CASE WHEN tipo_movimento = 'saida' THEN valor ELSE 0 END),
      0
    ) as saldo,
    COUNT(*)::BIGINT as total_movimentos
  FROM public.fluxo_caixa
  WHERE projeto_id = project_id;
END;
$$;

-- Criar bucket de storage para comprovantes
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprovantes-caixa', 'comprovantes-caixa', true)
ON CONFLICT (id) DO NOTHING;

-- RLS para storage bucket
CREATE POLICY "Allow authenticated users to upload comprovantes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'comprovantes-caixa');

CREATE POLICY "Allow authenticated users to view comprovantes"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'comprovantes-caixa');

CREATE POLICY "Allow authenticated users to delete own comprovantes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'comprovantes-caixa');