-- Tornar o bucket 'comprovantes' público e permitir imagens/vídeos/PDF
UPDATE storage.buckets 
SET public = true,
    allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif','application/pdf','video/mp4','video/webm','video/quicktime']
WHERE id = 'comprovantes';

-- Permitir leitura pública (anon) via API para o bucket 'comprovantes'
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Público pode ler comprovantes'
    ) THEN
        CREATE POLICY "Público pode ler comprovantes"
        ON storage.objects FOR SELECT
        TO anon
        USING (bucket_id = 'comprovantes');
    END IF;
END $$;