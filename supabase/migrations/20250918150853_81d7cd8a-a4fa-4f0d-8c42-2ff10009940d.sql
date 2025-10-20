-- Tornar o bucket CVs público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'cvs';

-- Verificar e recriar políticas se necessário
DROP POLICY IF EXISTS "CVs são publicamente acessíveis" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem fazer upload de CVs" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar CVs" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar CVs" ON storage.objects;

-- Criar políticas corretas para acesso público aos CVs
CREATE POLICY "CVs são publicamente acessíveis" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cvs');

CREATE POLICY "Usuários autenticados podem fazer upload de CVs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'cvs' AND auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar CVs" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'cvs' AND auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar CVs" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'cvs' AND auth.role() = 'authenticated');