-- Dropar políticas existentes para recriar (se existirem)
DROP POLICY IF EXISTS "CVs são publicamente acessíveis" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem fazer upload de CVs" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar CVs" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar CVs" ON storage.objects;

-- Criar políticas para o bucket CVs
CREATE POLICY "CVs são publicamente acessíveis" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cvs');

CREATE POLICY "Usuários podem fazer upload de CVs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'cvs' AND auth.role() = 'authenticated');

CREATE POLICY "Usuários podem atualizar CVs" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'cvs' AND auth.role() = 'authenticated');

CREATE POLICY "Usuários podem deletar CVs" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'cvs' AND auth.role() = 'authenticated');