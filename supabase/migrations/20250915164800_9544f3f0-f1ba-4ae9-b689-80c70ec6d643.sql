-- Criar bucket para armazenar comprovantes de gastos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('comprovantes', 'comprovantes', false);

-- Políticas de acesso ao bucket comprovantes
CREATE POLICY "Permitir upload de comprovantes para usuários autenticados" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'comprovantes');

CREATE POLICY "Permitir visualização de comprovantes próprios" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'comprovantes');

CREATE POLICY "Permitir atualização de comprovantes próprios" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'comprovantes');

CREATE POLICY "Permitir exclusão de comprovantes próprios" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'comprovantes');