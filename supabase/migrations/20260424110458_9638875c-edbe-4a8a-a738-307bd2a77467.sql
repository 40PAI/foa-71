-- Enable REPLICA IDENTITY FULL and add critical tables to supabase_realtime publication
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'projetos',
    'tarefas_lean',
    'colaboradores',
    'colaboradores_projetos',
    'requisicoes',
    'movimentos_financeiros',
    'materiais_armazem',
    'etapas_projeto',
    'dashboard_kpis',
    'patrimonio',
    'ponto_diario'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename=t) THEN
      EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', t);
      IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename=t
      ) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
      END IF;
    END IF;
  END LOOP;
END $$;