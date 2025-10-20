-- Criar bucket para comprovantes de gastos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'comprovantes',
  'comprovantes',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- Políticas RLS para o bucket comprovantes
CREATE POLICY "Usuários autenticados podem visualizar comprovantes"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'comprovantes');

CREATE POLICY "Usuários autenticados podem fazer upload de comprovantes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'comprovantes' AND
  auth.uid()::text IS NOT NULL
);

CREATE POLICY "Usuários podem atualizar seus próprios comprovantes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'comprovantes' AND
  auth.uid()::text IS NOT NULL
);

CREATE POLICY "Usuários podem deletar seus próprios comprovantes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'comprovantes' AND
  auth.uid()::text IS NOT NULL
);