
-- Add missing columns to colaboradores table
ALTER TABLE public.colaboradores 
ADD COLUMN tipo_colaborador TEXT,
ADD COLUMN numero_funcional TEXT,
ADD COLUMN bi TEXT,
ADD COLUMN morada TEXT,
ADD COLUMN cv_link TEXT;

-- Create tables for employee allocation and daily time tracking
CREATE TABLE public.colaboradores_projetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id INTEGER NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  projeto_id INTEGER NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
  data_alocacao DATE NOT NULL DEFAULT CURRENT_DATE,
  funcao TEXT NOT NULL,
  horario_tipo TEXT NOT NULL CHECK (horario_tipo IN ('integral', 'meio_periodo', 'turno')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(colaborador_id, projeto_id)
);

CREATE TABLE public.ponto_diario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id INTEGER NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  projeto_id INTEGER NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  hora_entrada TIME,
  hora_saida TIME,
  status TEXT NOT NULL DEFAULT 'presente' CHECK (status IN ('presente', 'ausente', 'atraso')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(colaborador_id, projeto_id, data)
);

-- Enable RLS for new tables
ALTER TABLE public.colaboradores_projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ponto_diario ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for now (you can restrict later based on your auth requirements)
CREATE POLICY "Allow all operations on colaboradores_projetos" ON public.colaboradores_projetos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on ponto_diario" ON public.ponto_diario FOR ALL USING (true) WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_colaboradores_projetos_updated_at
  BEFORE UPDATE ON public.colaboradores_projetos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ponto_diario_updated_at
  BEFORE UPDATE ON public.ponto_diario
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
