-- Criar bucket para CVs dos colaboradores
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cvs', 'cvs', true);

-- Política para permitir que qualquer usuário autenticado visualize CVs
CREATE POLICY "CVs são publicamente acessíveis" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cvs');

-- Política para permitir que usuários autenticados façam upload de CVs
CREATE POLICY "Usuários podem fazer upload de CVs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'cvs' AND auth.role() = 'authenticated');

-- Política para permitir que usuários autenticados atualizem CVs
CREATE POLICY "Usuários podem atualizar CVs" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'cvs' AND auth.role() = 'authenticated');

-- Política para permitir que usuários autenticados deletem CVs
CREATE POLICY "Usuários podem deletar CVs" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'cvs' AND auth.role() = 'authenticated');