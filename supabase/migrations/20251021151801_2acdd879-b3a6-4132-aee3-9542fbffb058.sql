-- Criar bucket para documentos de fornecedores
INSERT INTO storage.buckets (id, name, public)
VALUES ('fornecedor-documentos', 'fornecedor-documentos', false)
ON CONFLICT (id) DO NOTHING;

-- Criar tabela para documentos de fornecedores
CREATE TABLE IF NOT EXISTS public.fornecedor_documentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fornecedor_id UUID NOT NULL REFERENCES public.fornecedores(id) ON DELETE CASCADE,
  nome_arquivo TEXT NOT NULL,
  tipo_documento TEXT,
  tamanho_bytes BIGINT,
  storage_path TEXT NOT NULL,
  url_documento TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.fornecedor_documentos ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para documentos de fornecedores
CREATE POLICY "Usuários autenticados podem ver documentos de fornecedores"
ON public.fornecedor_documentos
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem inserir documentos de fornecedores"
ON public.fornecedor_documentos
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar documentos de fornecedores"
ON public.fornecedor_documentos
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar documentos de fornecedores"
ON public.fornecedor_documentos
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Políticas de storage para documentos de fornecedores
CREATE POLICY "Usuários autenticados podem visualizar documentos de fornecedores"
ON storage.objects
FOR SELECT
USING (bucket_id = 'fornecedor-documentos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem fazer upload de documentos de fornecedores"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'fornecedor-documentos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar documentos de fornecedores"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'fornecedor-documentos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar documentos de fornecedores"
ON storage.objects
FOR DELETE
USING (bucket_id = 'fornecedor-documentos' AND auth.uid() IS NOT NULL);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_fornecedor_documentos_fornecedor_id 
ON public.fornecedor_documentos(fornecedor_id);

CREATE INDEX IF NOT EXISTS idx_fornecedor_documentos_created_at 
ON public.fornecedor_documentos(created_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_fornecedor_documentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_fornecedor_documentos_updated_at
BEFORE UPDATE ON public.fornecedor_documentos
FOR EACH ROW
EXECUTE FUNCTION public.update_fornecedor_documentos_updated_at();