-- Criar apenas as políticas RLS para o bucket comprovantes (que já existe)

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios comprovantes" ON storage.objects;

-- Criar novas políticas RLS para o bucket comprovantes
CREATE POLICY "Usuarios podem visualizar comprovantes"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'comprovantes');

CREATE POLICY "Usuarios podem fazer upload de comprovantes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'comprovantes' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Usuarios podem atualizar comprovantes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'comprovantes' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Usuarios podem deletar comprovantes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'comprovantes' AND
  auth.uid() IS NOT NULL
);