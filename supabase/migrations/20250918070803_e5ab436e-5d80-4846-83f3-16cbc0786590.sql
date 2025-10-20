-- Verificar e criar políticas RLS para o bucket comprovantes (apenas se não existirem)

-- Política para visualizar comprovantes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Usuários autenticados podem visualizar comprovantes'
    ) THEN
        CREATE POLICY "Usuários autenticados podem visualizar comprovantes"
        ON storage.objects FOR SELECT
        TO authenticated
        USING (bucket_id = 'comprovantes');
    END IF;
END $$;

-- Política para upload de comprovantes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Usuários autenticados podem fazer upload de comprovantes'
    ) THEN
        CREATE POLICY "Usuários autenticados podem fazer upload de comprovantes"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
          bucket_id = 'comprovantes' AND
          auth.uid()::text IS NOT NULL
        );
    END IF;
END $$;

-- Política para atualizar comprovantes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Usuários podem atualizar seus próprios comprovantes'
    ) THEN
        CREATE POLICY "Usuários podem atualizar seus próprios comprovantes"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (
          bucket_id = 'comprovantes' AND
          auth.uid()::text IS NOT NULL
        );
    END IF;
END $$;

-- Política para deletar comprovantes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Usuários podem deletar seus próprios comprovantes'
    ) THEN
        CREATE POLICY "Usuários podem deletar seus próprios comprovantes"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (
          bucket_id = 'comprovantes' AND
          auth.uid()::text IS NOT NULL
        );
    END IF;
END $$;