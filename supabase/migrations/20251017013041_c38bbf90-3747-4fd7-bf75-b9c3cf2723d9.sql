-- Tabela para armazenar documentos de projetos
CREATE TABLE IF NOT EXISTS documentos_projeto (
  id SERIAL PRIMARY KEY,
  projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  nome_arquivo TEXT NOT NULL,
  url_arquivo TEXT NOT NULL,
  tipo_arquivo TEXT NOT NULL,
  tamanho_bytes BIGINT NOT NULL,
  descricao TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_documentos_projeto_projeto_id ON documentos_projeto(projeto_id);
CREATE INDEX IF NOT EXISTS idx_documentos_projeto_uploaded_by ON documentos_projeto(uploaded_by);

-- Comentários
COMMENT ON TABLE documentos_projeto IS 'Armazena documentos associados aos projetos';
COMMENT ON COLUMN documentos_projeto.nome_arquivo IS 'Nome original do arquivo';
COMMENT ON COLUMN documentos_projeto.url_arquivo IS 'URL do arquivo no Storage';
COMMENT ON COLUMN documentos_projeto.tipo_arquivo IS 'Extensão/tipo do arquivo';
COMMENT ON COLUMN documentos_projeto.tamanho_bytes IS 'Tamanho do arquivo em bytes';

-- RLS Policies
ALTER TABLE documentos_projeto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver documentos" 
  ON documentos_projeto FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Usuários autenticados podem criar documentos" 
  ON documentos_projeto FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar documentos" 
  ON documentos_projeto FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar documentos" 
  ON documentos_projeto FOR DELETE 
  TO authenticated 
  USING (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_documentos_projeto_updated_at
  BEFORE UPDATE ON documentos_projeto
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Criar bucket para documentos de projetos
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos-projetos', 'documentos-projetos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS para o bucket
CREATE POLICY "Permitir upload de documentos para usuários autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos-projetos');

CREATE POLICY "Permitir visualização de documentos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documentos-projetos');

CREATE POLICY "Permitir deleção de documentos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documentos-projetos');