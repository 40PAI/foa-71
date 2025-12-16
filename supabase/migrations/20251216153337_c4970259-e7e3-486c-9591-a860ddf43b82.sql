
-- Criar bucket para imagens de materiais do armazém
INSERT INTO storage.buckets (id, name, public)
VALUES ('materiais-armazem', 'materiais-armazem', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir visualização pública das imagens
CREATE POLICY "Imagens de materiais são públicas" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'materiais-armazem');

-- Política para permitir upload por usuários autenticados
CREATE POLICY "Usuários autenticados podem fazer upload de imagens de materiais" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'materiais-armazem' AND auth.uid() IS NOT NULL);

-- Política para permitir atualização por usuários autenticados
CREATE POLICY "Usuários autenticados podem atualizar imagens de materiais" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'materiais-armazem' AND auth.uid() IS NOT NULL);

-- Política para permitir deleção por usuários autenticados
CREATE POLICY "Usuários autenticados podem deletar imagens de materiais" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'materiais-armazem' AND auth.uid() IS NOT NULL);
